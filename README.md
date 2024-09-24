Command to start proxy/API server.
1. Navigate to the "server" folder.
2. Run the command "npm run start-dev-server".


Command to start client-side server.
1. Navigate to the "client" folder.
2. Run the command "npm run dev".

When you clone the repo, you'll need to add a ".env" file in the "server" dir with your openAI API key.

Using openAI to convert Natural Language to SQL. 
High-Level Overview:
- Give openAI a string representation/description of your DB.
The user asks a Question.
- Feed the question to LLM and direct it to form a query.
- Send Query, receive data.
- Form a response on given data.


Better documentation to come, as soon as other projects clear up....
