import sqlite3 from 'sqlite3';

// this is our db connector
let db = new sqlite3.Database('./database_dir/fastFood_restraunt.db', (err: Error | null) => {
    if(err){
        console.error(err.message);
    }
    console.log('Connected to the SQLite database.');
});


const appendRest = (Name: string) => {
    // Define the sql stateement
    const sql = 'INSERT INTO Restraunt (Name) VALUES (?)';
    // 
    db.run(sql, [Name], function(err: Error | null){
        if (err){
            return console.log(err.message);
        }
        console.log(`A row has been appended with rowID ${this.lastID}`);
    });
};


appendRest('Wendys');
appendRest('Taco Bell');
appendRest('Burger King');


// Close the db
db.close((err: Error | null) => {
    if (err){
        console.log(err.message);
    }
    console.log('Closed the database.')
});

