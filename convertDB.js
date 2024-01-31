import sqlite3 from 'sqlite3';
import fs from 'fs';

try {
    db = new sqlite3.Database('./public/dua_main.sqlite', sqlite3.OPEN_READONLY, (err) => {
        if (err) {
            console.error('Error opening database: ', err.message);
        } else {
            console.log('Connected to the Database.');
            convertDataToJson();
        }
    });

    function convertDataToJson() {
        queryTable('category', (err, categoryData) => {
            if (err) {
                console.error('Error querying category: ', err.message);
            } else {
                saveToJson('category.json', categoryData);
            }
        });

        queryTable('sub_category', (err, subCategoryData) => {
            if (err) {
                console.error('Error querying sub_category: ', err.message);
            } else {
                saveToJson('sub_category.json', subCategoryData);
            }
        });

        queryTable('dua', (err, duaData) => {
            if (err) {
                console.error('Error querying dua: ', err.message);
            } else {
                saveToJson('dua.json', duaData);
            }
        });
    }

    function queryTable(tableName, callback) {
        db.all(`SELECT * FROM ${tableName}`, (err, rows) => {
            if (err) {
                callback(err);
            } else {
                callback(null, rows);
            }
        });
    }

    function saveToJson(fileName, data) {
        try {
            const jsonData = JSON.stringify(data);
            fs.writeFileSync(`./public/${fileName}`, jsonData);
            console.log(`Data converted to JSON and saved as ${fileName}`);
        } catch (err) {
            console.error(`Error saving ${fileName}:`, err.message);
        }
    }
} catch (err) {
    console.error('Error opening database: ', err.message);
}
