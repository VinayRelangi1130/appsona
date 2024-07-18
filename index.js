const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json())
const dbPath = path.join(__dirname, "database.db");

let db = null;

const initializeDBAndServer = async () => {
    try {
        db = await open({
            filename: dbPath,
            driver: sqlite3.Database
        })

        app.listen(3000, () => {
            console.log("Server is Running at http://localhost:3000/");
        })
    } catch (e) {
        console.log(`DB Error: ${e.message}`);
        process.exit(1);
    }
}

initializeDBAndServer();

app.post('/addItem', async (request, response) => {
    try {
        const notesDetails = request.body;
        const { title, description, archieve, is_delete } = notesDetails;
        const sqlQuery = `
        INSERT INTO notes
            (title, description, archieve, is_delete) 
        VALUES (?, ?, ?, ?)
    `;

        await db.run(sqlQuery, [title, description, archieve, is_delete]);
        response.status(200).send("Note added successfully!");
    } catch (e) {
        console.error(`Error adding note: ${e.message}`);
        response.status(500).send("An error occurred while adding the note.");
    }
});

// GET API
app.get('/getNotes', async (request, response) => {
    try {
        const sqlQuery = `SELECT * FROM notes  WHERE archieve = 0 AND is_delete = 0;`;

        const notes = await db.all(sqlQuery);

        response.status(200).json(notes);
    } catch (error) {
        console.error(`Error retrieving notes: ${error.message}`);
        response.status(500).send("An error occurred while retrieving the notes.");
    }
});

//change to archeive 

app.get('/getArchieve', async (request, response) => {
    try {
        const sqlQuery = `SELECT * FROM notes  WHERE archieve = 1 ;`;

        const notes = await db.all(sqlQuery);

        response.status(200).json(notes);
    } catch (error) {
        console.error(`Error retrieving notes: ${error.message}`);
        response.status(500).send("An error occurred while retrieving the notes.");
    }
});

app.get('/getisDelete', async (request, response) => {
    try {
        const sqlQuery = `SELECT * FROM notes  WHERE archieve = 0 AND is_delete = 1;`;

        const notes = await db.all(sqlQuery);

        response.status(200).json(notes);
    } catch (error) {
        console.error(`Error retrieving notes: ${error.message}`);
        response.status(500).send("An error occurred while retrieving the notes.");
    }
});

//when  we click on archeive button then it toggle to true

app.put('/updateArchievedNotes', async (request, response) => {
   
    try {
        const {id, archieve} = request.body
        const sqlQuery = `
        UPDATE 
            notes
        SET
            archieve = ?,
            is_delete = 0
        WHERE
            id = ?;
        `;

        const result = await db.run(sqlQuery, [archieve, id]);
        response.status(200).json('archieve updated successfully');
    } catch (error) {
        console.error(`Error updating archived notes: ${error.message}`);
        response.status(500).send("An error occurred while updating the archived notes.");
    }
});

app.put('/updateDeletedNotes', async (request, response) => {
   
    try {
        const {id, is_delete} = request.body
        const sqlQuery = `
        UPDATE 
            notes
        SET
            archieve = 0,
            is_delete = ?
        WHERE
            id = ?;
        `;

        const result = await db.run(sqlQuery, [is_delete, id]);
        response.status(200).json("deleted successfully");
    } catch (error) {
        console.error(`Error updating archived notes: ${error.message}`);
        response.status(500).send("An error occurred while updating the archived notes.");
    }
});


app.get('/', async (req, res) => {
    try {
        res.send('Backend Started');
    } catch (e) {
        console.error(e.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
