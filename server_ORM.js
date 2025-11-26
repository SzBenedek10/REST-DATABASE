const express = require('express');
const cors =require('cors');
const {Sequlize, DataTypes, Sequelize, where}= require('sequelize');
const { useActionState } = require('react');
const app = express();
const port = 3000;

app.use(express.json());
app.use(cors());//Cors Origin Resource Sharing 
//User modell definiálása

const sequelize = new Sequelize('ormdb','root','',{
    host: localhost,
    dialect: mysql,
    logging : false
});
//Mysql adatbátis kapcsolat a sequlize ORM-el
const User= Sequelize.define('User',{
    firstName : {type: DataTypes.STRING, allowNull: false},
    lastName : {type: DataTypes.STRING, allowNull: false},
    city : {type: DataTypes.STRING, allowNull: false},
    addres : {type: DataTypes.STRING, allowNull: false},
    phone : {type: DataTypes.STRING, allowNull: false},
    email : {type: DataTypes.STRING, allowNull: false},
    gender : {type: DataTypes.STRING, allowNull: false}
},{
    timestamps : false,
    tableName: 'users'
});
//Adatbázis szinkronizálása (tábla létrehozása)
sequelize.sync()
//Adatbázis kapcsolat ellenőrzése
.then(() =>console.log('Adatbázis kapcsolat létrejött és a táblák szinkronizálása'))
.catch(err => console.error('Hiba történt az adatkapcsolat során ',err));

//POST új felhasználó létrehozása 
app.post('/api/users', async (req, res) =>{
    try{
        const user = await User.create(req.body);
        res.status(201).json({message: 'A felhasználó rögzítése sikeres volt ',user});

    }
    catch ( err){
        console.error(err);
        res.status(500).json({ message: 'Hiba történt a felhasználó rögzítése során '})

    }
})
//Get összer felhasználó lekérése 
app.get('/api/users', async (req, res) =>{
    try{
        const user = await User.findAll();
        res.status(200).json({user});

    }
    catch ( err){
        console.error(err);
        res.status(500).json({ message: 'Hiba történt az adatok lekérése során '})

    }
})
// DELETE felhasználó törlése
app.delete('/api/users/:id', async (req, res) =>{
    try{
        const deleted = await User.destroy({
            where : { id : req.params.id}
        })
        if(deleted){
            res.status(200).json({message: 'Sikeres adattörlés.'})
        }
        else{
            res.status(404).json({message:' A felhasználó nem található!'})
        }

    }
    catch ( err){
        console.error(err);
        res.status(500).json({ message: 'Hiba történt a felhasznáéók törlése során '})

    }
})
