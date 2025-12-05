const express = require('express');
const mysql = require('mysql2/promise');
const cors =require('cors');
const app = express();
const port = 3000;

//Köztes alkalmazások 
app.use(express.json());
app.use(cors());//Cors Origin Resource Sharing 

//mysql kapcsolat 
const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'shopdb1'
});
//Kapcsolat ellenőrzése 



// Modellek létrehozása
async function createTables(){
    await db.query(`
        CREATE TABLE IF NOT EXISTS users(
        id INT AUTO_INCREMENT PRIMARY KEY,
        firstName VARCHAR(255) NOT NULL,
        lastName VARCHAR(255) NOT NULL,
        city VARCHAR(255) NOT NULL,
        address VARCHAR(255) NOT NULL,
        phone VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        gender VARCHAR(255) NOT NULL
        
        )`);
    await db.query(`
        CREATE TABLE IF NOT EXISTS products(
        id INT  AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        price VARCHAR(255) NOT NULL,
        
        )
        
        `);
    await db.query(`
        CREATE TABLE IF NOT EXISTS orders(
        id INT  AUTO_INCREMENT PRIMARY KEY,
        userId INT NOT NULL,
        status VARCHAR(255) NOT NULL,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
        
        )

        `);
        //Pivot tábla létrehozása 
        await db.query(`
            CREATE TABLE IF NOT EXISTS orderproducts (
            id INT AUTO_INCREMENT PRIMARY KEY,
            orderId INT NOT NULL,
            productId INT NOT NULL, 
            FOREIGN KEY (orderId) REFERENCES orders(id) ON DELETE CASCADE,
            FOREIGN KEY (productId) REFERENCES product(id) ON DELETE CASCADE
            
            
            )
            
            `);
            console.log("Az adatbázis táblai létrehozása és ellenőrzése.")
};
createTables();



//POST végpont az adatok eltárolására a users táblában
app.post('/api/users', (req, res) => {
    const { firstName, lastName, city, address, phone, email, gender } = req.body;

    const sql = `INSERT INTO users (firstName, lastName, city, address, phone, email, gender) VALUES (?, ?, ?, ?, ?, ?, ?)`;
    db.query(sql, [firstName, lastName, city, address, phone, email, gender],
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
    db.query(`SELECT * FROM users`, [], (err, records) => {
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
    db.query(`DELETE FROM users WHERE id = ?`, [id],
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

        db.query(sql, [firstName, lastName, city, address, phone, email, gender, id],
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

//Rendelések rögzítése
app.post('/api/orders',async (req,res) =>{
    //Adatbázis kapcsolat kezdeményezései
    const connection = await db.getConnection()

    try{
 //A klienstől érkező adatok fogadása  
 const {userId,status,productIds} = req.body;     
//Rendelési adatok rögzítése
await connection.beginTransaction();
const {orderResult} = await connection.query(
    `INSERT INTO orders (userId, status) VALUES (?,?)`,
    [userId,status]
);
const orderId = orderResult.insertId
//pivot tábla feltöltése  ( orderId , productId)
if (productIds && productIds.length >0){
    //Ciklus  
    for(const pid of productIds) {
        await connection.query(
            `INSERT INTO orderproducts (orderId, productId) VALUES (?,?)`,
            [orderId, pid]
        );
    }
}
await connection.commit();
res.status(201).json({message: 'Rendelés létrehozása ', orderId})
    }
    catch(err)
    {

        await connection.rollback();
        res.status(500).json({message: 'Hiba történt a rendelés létrehozása'});
    }
    finally {
        connection.release();
    }
})
app.get('/api/users/:id/orders/products', async (req, res) =>{
    try {
        const userId = req.params.id;

        const [[user]] = await db.query(`SELECT * FROM users WHERE id = ? `, [userId]);
        // Ha az user megtalálható az adatbázisból 
        if(!user) res.status(404).json({message: 'A felhasználó nem tallálható '});

        const [orders] = await db.query(`SELECT * FROM orders WHERE id = ? `, [userId])

        /*
        1. ciklussal bejárjuk az összes rndelést 
        2.JOIN- al lekérdezzük a rendeléshez tartozó termékeket 
        3.Az order.products objektumokba beleteszi a termékeket .
        4.Elküldi a kliensnek a rendeléseket és a hozzátertozó termékeket
        
        */ 
       for (let order of orders) {
        const sql = `SELECT p.* FROM product p JOIN orderproducts op ON op.productId = p.id WHERE op.orderId = ? `;
        const [products] = await db.query(sql, [order.id]);
        order.products =products;
       }
       res.status(200).json({...user, ordersn});
    }
    catch (err)
    {
        res.status(500).json({message: "Hiba történt a rendelések lekérése során "});
    }
})

app.listen(port, () => {
    console.log(`A webszerver fut a http://localhost:${port} webcímen`);
})






