const express = require('express');
const rateLimit = require('express-rate-limit');
const session = require('express-session');
const axios = require('axios');
const cors = require('cors');
const dotenv = require('dotenv');
const sqlite3 = require('sqlite3');

dotenv.config()

const app = express();
const PORT = process.env.PORT || 5000
const whitelist = ['http://localhost:3000', 'http://localhost']
// const whitelist = ['http://127.0.0.1:8080', 'http://127.0.0.1']
// const whitelist = ['http://192.168.0.252:8080', 'http://192.168.0.252

/*------------------------------- START of config  ------------------------------------*/

const token_usage_log = {
    total_tokens_used: 0,
    token_log: []
};

let request_count = 1;


// Set up session middleware
app.use(session({
    secret: process.env.SESSION_SECRET || 'your_secret_key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set to true if using HTTPS
}));

// Debugging middleware to log session
// app.use((req, res, next) => {
//     console.log('Session:', req.session);
//     next();
// });

// Check to see if the origin of the requestis permitted
const corsOptions = {
    origin: (origin, callback) => {
        if (!origin || whitelist.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true // Enable credentials (cookies)
};


// Define our rate limit
const limiter = rateLimit({
    windowMs: 1000,
    max: 4
});

// Our db connector
let db = new sqlite3.Database("../update_db/database_dir/fastFood_restraunt.db", (err) => {
    if (err) {
        console.log(err.message);
    }
    else{
        console.log('Connected to the SQLite database.');
    }
});


// Apply our corsOptions
app.use(cors(corsOptions));
// Apply the limit
app.use(limiter);

/*-------------------------------  END of config  ------------------------------------*/
// DB query
const query_data = (AI_SQL_String) => {
    // Return a new Promise
    return new Promise((resolve, reject) => {
        // Perform the asynchronous database query
        db.all(AI_SQL_String, (err, data) => {
            if (err) {
                // If there's an error, print the error message and reject the Promise
                console.log(err.message);
                reject(err); // Reject the Promise with the error
            } else {
                // If the query is successful, print the result and resolve the Promise
                console.log(`Gotten Vals: ${JSON.stringify(data, null, 2)}`);
                resolve(data); // Resolve the Promise with the query result
            }
        });
    });
};



class openAI_post_request {
    model;
    messages;
    temperature;
    headers;
    og_message_length;
    token_limit;
    constructor(model = 'gpt-3.5-turbo', messages = [{ "role": "system", "content": "You are a helpfull assitant" }], temperature = 0.7, token_limit = 15000) {
        this.model = model;
        this.messages = messages;
        this.temperature = temperature;
        this.headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.OPENAI_APIKEY}` };
        this.og_message_length = this.messages.length
        this.token_limit = token_limit;
    };
    async open_AI_req(){
        try {
            const response = await axios.post('https://api.openai.com/v1/chat/completions', {
                model: this.model,
                messages: this.messages,
                temperature: this.temperature
            }, {
                headers: this.headers
            });
            
            // An additional check. Just in case if the context is getting to long
            // We need to clear the messages so that we don't get a err 400
            // Note would prob be better to calc token len before makin the req. But this works for now hehe
            if(response.data.usage.total_tokens >= this.token_limit){
                this.messages.splice(this.og_message_length, this.messages.length + 1)
            }

            // Using our Logging object here
            token_usage_log.total_tokens_used += response.data.usage.total_tokens
            const log_string = `Request_number: ${request_count}`;
            const log_object  = {};
            log_object[log_string] = response.data.usage.total_tokens;
            token_usage_log.token_log.push(log_object)
            request_count++;
            console.log(token_usage_log)
            return response;

        } catch (err) {
            console.error('Error making POST request:', err.response.data ?? err.message);
        };
    }
};


app.get('/SetSession/', async (req, res) =>{
    // Initialize initial_params and sorting_params in the session
    try{
        if(req.session){
            req.session.initial_params = new openAI_post_request();
            req.session.sorting_params = new openAI_post_request();
            
            // Set temperature for initial_params and sorting_params
            req.session.initial_params.temperature = 0.1;
            req.session.sorting_params.temperature = 0.3;

            // Initialize messages arrays for initial_params and sorting_params

            req.session.initial_params.messages = [{ "role": "system", "content": "You are a specialized assistant." },
            { "role": "system", "content": "When you recieve a question, you will create an sql query stemming from SQL schemas given." },
            {
                "role": "system", "content": "This is the sql schema, for the main table. These are all the restraunts in the table.\
                                -- Restraunt Table --\
                R_ID,Restraunt\
                1|Wendys\
                2|Taco Bell\
                3|Burger King"},
            {
                "role": "system", "content": "This is the sql schema, for the seconday table.\
                                -- Items Table -- \
                R_ID,Item,Price,Cals"},
            // { "role": "system", "content": "In the Restraunt Table, the R_ID is the primary key. Use the primary key to create a query from the Items Table." },
            { "role": "system", "content": "You will next recieve a question. Striclty output a query, no other text." },
            { "role": "system", "content": "The query will be in the form of 'SELECT * FROM Items WHERE R_ID ='. Or 'SELECT * FROM Items WHERE R_ID = * AND R_ID = *'. "},
            { "role": "system", "content": "Critical: Do not search for the Item direclty!"},
            ];


            req.session.sorting_params.messages = [{ "role": "system", "content": "You are a specialized assistant." },
            { "role": "system", "content": "You will be fed data, you must answer the user's question with the data provided or with your own responces." },
            {
                "role": "system", "content": "This is the sql schema, for the main table. These are all the restraunts in the table.\
                                -- Restraunt Table --\
                R_ID,Restraunt\
                1|Wendys\
                2|Taco Bell\
                3|Burger King"},
            { "role": "system", "content": `The data will be given in form of a string, transformed from a JSON object. Treat it as such.` },
            ];
            res.send(`Session vars have been sent ${req.session.sorting_params.messages}`);
        }
    }catch(err){
        console.error('Error setting session variables:', err);
        res.status(500).send('Error setting session variables');
    }
});


// Route to set session variable
// Route to set session variable
app.get('/setSessionTEST', (req, res) => {
    req.session.username = 'exampleUser';
    req.session.test_obj = [{'Mike': "Hunt"}];
    res.send('Session variable set');
});

app.get('/getSessionTEST', (req, res) => {
    const username = req.session.username || 'No user';
    res.send(`Messages: ${JSON.stringify(req.session.sorting_params)}`)
    // res.send(`Session username: ${username}`);
});



app.get('/AIresponse/:query', async (req, res) => {
    try {
        if(req.session){
            // We have to re-assighn methods. Methods are not stored in JSON.
            const initial_obj = req.session.initial_params;
            const initial_params = Object.assign(new openAI_post_request(), initial_obj);
            const sorting_obj = req.session.sorting_params;
            const sorting_params = Object.assign(new openAI_post_request(), sorting_obj);


            // This is the first step. User inputs a request.
            // Then model outputs a SQL query, the string/queury gets passed and made
            const user_input = req.params.query
            initial_params.messages.push({ "role": "user", "content": `${user_input}` })
            initial_params.open_AI_req()
            const returned_query = (await initial_params.open_AI_req()).data.choices[0].message.content;
            console.log("Here is the query", returned_query);
            let recieved_query_data = await query_data(returned_query);
            recieved_query_data = JSON.stringify(recieved_query_data);

            // This is the second part. Use the returned JSON, to pass back into model for sorting
            // console.log("!!!!!!!!", recieved_query_data, "!!!!!")
            sorting_params.messages.push({ "role": "system", "content": `Here is the data to answer from: ${recieved_query_data}` });
            sorting_params.messages.push({ "role": "system", "content": `Sort through the data to form your response.` });
            sorting_params.messages.push({ "role": "user", "content": `${user_input}` });
            const second_res = (await sorting_params.open_AI_req());
            const second_res_string = second_res.data.choices[0].message.content
            console.log("The second response", second_res_string)


            // remove the queryd data, but leave the user's question
            sorting_params.messages.splice(4, 2)
            // Want to attempt and return the model responsce into itself. But can lead to over 16k tokens.
            sorting_params.messages.push({"role":"assistant", "content": `${second_res_string}`})

            console.log(sorting_params.messages)

            res.json(second_res.data)
        }
    } catch (err) {
        console.error('Error making GET request:', err);
        console.log(sorting_params); // Check if sorting_params is defined
        // console.log(req.session.sorting_params?.messages); // Check if messages is defined)
    }
});


app.listen(PORT, () => console.log(`Server is listining on port ${PORT}`));
