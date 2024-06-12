import sqlite3 from 'sqlite3';
import * as fs from 'fs';

type SQL_SCHEMA = {
    R_ID: string,
    Item: string,
    Price: string,
    Cals: string
};


// Our db connector
let db = new sqlite3.Database('./database_dir/fastFood_restraunt.db', (err: Error | null) => {
    if(err){
        console.log(err.message);
    }
    console.log('Connected to the SQLite database.')
});


const appendedItem = (arg: SQL_SCHEMA) => {
    const insertSql = 'INSERT INTO Items (R_ID, Item, Price, Cals) VALUES (?, ?, ?, ?)';
    const selectSql = 'SELECT * FROM Items WHERE Item = ? AND R_ID = ?';
    db.run(insertSql, [arg.R_ID, arg.Item, arg.Price, arg.Cals], function(err: Error | null){
        if(err){
            console.log(err.message);
        }
        console.log(`A row has been appended with rowID ${this.lastID}`)
    });
    // db.get(selectSql, [arg.Item, arg.R_ID], (err: Error | null, row: any) => {
    //     if(err){
    //         console.log(err.message);
    //     }
    //     console.log(`Inserted Vals: ${JSON.stringify(row, null, 2)}`)
    // });
};

function readCSV(): Promise<string[][]> {
    const csvFilePath = '/Users/westcoasttoast/Desktop/TS_FastFoodItem_Scraper/database_append.csv';
    return new Promise((resolve, reject) => {
        fs.readFile(csvFilePath, 'utf8', (err, data) => {
            if (err) {
                reject(err);
                return;
            }

            const rows = data.trim().split('\n').map(row => row.split(','));
            resolve(rows);
        });
    });
};



async function main(){
    const csv_data: string[][] = await readCSV();
    console.log(csv_data.length);
    console.log(csv_data);
    for(const i in csv_data){
        const SCHEMA_OBJ: SQL_SCHEMA = {
            R_ID: csv_data[i][0],
            Item: csv_data[i][1],
            Price: csv_data[i][2],
            Cals: csv_data[i][3]
        };
        appendedItem(SCHEMA_OBJ);
    };


    // Close the DB
    db.close((err: Error | null)=>{
        if(err){
            console.log(err.message);
        }
        console.log('Closed the database');
    });
    
};


main();



