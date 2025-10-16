const express = require('express');
const sqlite = require('sqlite3').verbose();//hibakeresés
const app= express();
const port= 3000;

app.use(express.json());

//az adatbázis 
const db = new sqlite.Database('users.db', (err) =>{
    if(err) {
        console.log(err.message);
    }
    else {
        console.log('Az adatbázis kapcsolat létrejött.')
    }
})
//adatbázis séma létrehozása
db.run(`CREATE TABLE IF NOT EXISTS users(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    firstName TEXT NOT NULL,
    lastName TEXT NOT NULL,
    city TEXT NOT NULL,
    address TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT NOT NULL,
    gender TEXT NOT NULL 
    )`);
//POST végpont az adatok mentésére a users táblában 
app.post('/api/users',(req,res) =>{
    //adatok elérése
    const {firstName, lastName, city, address, phone, email, gender}= req.body;

    const sql = 'INSERT INTO users (firstName, lastName, city, address, phone, email, gender) VALUES(?,?,?,?,?,?,?)'
    db.run(sql, [firstName, lastName, city, address, phone, email, gender],
    function(err){
        if (err) {
            console.log(err);
            return res.status(500).json({error: "Hiba történt"});
        }
        else {
            res.status(200).send({message: 'Adatok sikeresen rögzítése', id: this.lastID,firstName, lastName, city, address, phone, email, gender});
        }
    })
})




    app.listen(port, () => {
        console.log(`A szerver fut a htttp://localhost: ${port} címen`);
    })
