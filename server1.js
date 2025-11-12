const express = require('express');
const sqlite = require('sqlite3').verbose(); //verbose - hibakeresési támogatás
const cors =require('cors');
const app = express();
const port = 3000;

//Köztes alkalmazások 
app.use(express.json());
app.use(cors());//Cors Origin Resource Sharing 

//Az adatbázis inicializálása
const db = new sqlite.Database('users.db', (err) => {
    if (err) {
        console.log(err.message);
    }
    else {
        console.log('Az adatbázis kapcsolat létrejött.')
    }
})

//Adatbázis séma létrehozása
db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    firstName TEXT NUT NULL,
    lastName TEXT NOT NULL,
    city TEXT NOT NULL,
    address TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT NOT NULL,
    gender TEXT NOT NULL
    )`);

//POST végpont az adatok eltárolására a users táblában
app.post('/api/users', (req, res) => {
    const { firstName, lastName, city, address, phone, email, gender } = req.body;

    const sql = `INSERT INTO users (firstName, lastName, city, address, phone, email, gender) VALUES (?, ?, ?, ?, ?, ?, ?)`;
    db.run(sql, [firstName, lastName, city, address, phone, email, gender],
        //Callback függvény az esetleges adatbázis kapcsolódási hiba kezelésére, vagy a sikeres adatbázis művelet eredményének a visszaküldésére a kliensnek.
        function (err) {
            if (err) {
                console.log(err);
                return res.status(500).json({ message: 'Hiba történt az adatok rögzítése során!' })
            } else {
                return res.status(201).send({ message: 'Az adatok rögzítése sikeresvolt.', id: this.lastID, firstName, lastName, city, address, phone, email, gender });
            }
        }
    )
})

//GET végpont az adatbázis lekérésére
app.get('/api/users', (req, res) => {
    db.all(`SELECT * FROM users`, [], (err, records) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Hiba történt az adatok kiolvasása során!' });
        } else {
            return res.status(200).json(records);
        }
    })
})

//DELETE végpont az adatbázis egy sorának (id szerinti) törlésére
app.delete('/api/users/:id', (req, res) => {
    //Az id elérése az URL paraméter listájából
    const { id } = req.params;

    //Az adatbázis egy sorának a törlése
    db.run(`DELETE FROM users WHERE id = ?`, [id],
        //Callback föggvény az esetleges törlési hiba kezelésére
        function (err) {
            if (err) {
                return res.status(500).send(err.message);
            } else {
                return res.status(200).json({ message: 'Sikeres adattörlés!' });
            }
        })
})

//PUT végpont a táblázat adataink a módosítására
app.put('/api/users/:id', (req, res) => {
        //Az id elérése az URL paraméter listájából
        const { id } = req.params;
        const { firstName, lastName, city, address, phone, email, gender } = req.body;

        const sql = 'UPDATE users SET firstName = ?, lastName = ?, city = ?, address = ?, phone = ?, email = ?, gender = ? WHERE id = ?';

        db.run(sql, [firstName, lastName, city, address, phone, email, gender, id],
            //Callback föggvény az esetleges adatbázis elérési hiba kezelésére
            function (err) {
                if (err) {
                    return res.status(500).send(err.message);
                } else {
                    return res.status(200).json({ message: 'A felhasználó frissítése megtörtént!', id, firstName, lastName, city, address, phone, email, gender });
                }
            }
        )
})

app.listen(port, () => {
    console.log(`A webszerver fut a http://localhost:${port} webcímen`);
})






