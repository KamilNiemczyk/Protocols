const express = require("express");
const recordRoutes = express.Router();
const dbo = require("../db/conn");
const ObjectId = require("mongodb").ObjectId;
const bcrypt = require('bcrypt');
const saltRounds = 10;

recordRoutes.route("/register").post(async function(req, res) {
    const newUser = req.body;
    try {
        let db_connect = dbo.getDb("pswbaza");
        const usersCollection = db_connect.collection('users');
        const existingUser = await usersCollection.findOne({ login: newUser.login });
        if (existingUser) {
            return res.status(500).json({ message: 'Jest już taki użytkownik' });
        }
        const hashedPassword = await bcrypt.hash(newUser.password, saltRounds);
        newUser.password = hashedPassword;
        const result = await usersCollection.insertOne(newUser);
        res.status(201).json({ message: 'Użytkownik dodany'});
    } catch (error) {
        res.status(500).json({ message: 'Błąd podczas dodawania użytkownika' });
    }
});

recordRoutes.route("/login").post(async function(req, res) {
    const { login, password } = req.body;
    try {
        let db_connect = dbo.getDb("pswbaza");
        const usersCollection = db_connect.collection('users');
        const user = await usersCollection.findOne({ login: login });
        if (user) {
            const match = await bcrypt.compare(password, user.password);
            if (match) {
                res.status(200).json({ message: 'Zalogowano' });
            } else {
                res.status(500).json({ message: 'Niepoprawne hasło' });
            }
        }else {
            res.status(500).json({ message: 'Niepoprawny login' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Błąd podczas pobierania użytkowników'});
    }
});

recordRoutes.route("/usunWszystko").delete(async function(req, res) {
    try {
        let db_connect = dbo.getDb("pswbaza");
        const usersCollection = db_connect.collection('users');
        const result = await usersCollection.deleteMany({});
        res.status(200).json({ message: 'Wszystkie osoby usuniete'});
    } catch (error) {
        res.status(500).json({ message: 'Nie udało sie usunąć wszystkich osób'});
    }
});

recordRoutes.route("/getUsers").get(async function(req, res) {
    try {
        let db_connect = dbo.getDb("pswbaza");
        const usersCollection = db_connect.collection('users');
        const allUsers = await usersCollection.find({}).toArray();
        res.status(200).json(allUsers);
    } catch (error) {
        res.status(500).json({ message: 'Błąd podczas pobierania użytkowników' });
    }
});

module.exports = recordRoutes;