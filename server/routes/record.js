const express = require("express");
const recordRoutes = express.Router();
const dbo = require("../db/conn");
const ObjectId = require("mongodb").ObjectId;
const bcrypt = require('bcrypt');
const saltRounds = 10;

const fs = require('fs');
const util = require('util');

const log_file = fs.createWriteStream(__dirname + "/debug.log", { flags: "w" });
const log_stdout = process.stdout;

console.log = function (d) {
    log_file.write(util.format(d) + "\n");
    log_stdout.write(util.format(d) + "\n");
};

console.log("Server started");
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
        console.log("Dodalem uzytkownika");
    } catch (error) {
        res.status(500).json({ message: 'Błąd podczas dodawania użytkownika' });
        console.log("Nie dodalem uzytkownika");
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
        console.log("Usunalem wszystkich");
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
        console.log("Pobralem uzytkownikow")
    } catch (error) {
        res.status(500).json({ message: 'Błąd podczas pobierania użytkowników' });
        console.log("Nie pobralo uzytkownikow");
    }
});
recordRoutes.route("/getPassword/:login").get(async function(req, res) {
    const { login } = req.params;
    try {
        let db_connect = dbo.getDb("pswbaza");
        const usersCollection = db_connect.collection('users');
        const user = await usersCollection.findOne({ login: login });
        if (user) {
            res.status(200).json({ password: user.password });
        } else {
            res.status(404).json({ message: 'Użytkownik nie został znaleziony' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Błąd podczas pobierania hasła' });
    }
});
recordRoutes.route("/getChats/:chatWzorzec").get(async function(req, res) {
    const { chatWzorzec } = req.params;
    try {
        let db_connect = dbo.getDb("pswbaza");
        const chatsCollection = db_connect.collection('chats');
        const allChats = await chatsCollection.find({ chat: { $regex: chatWzorzec, $options: 'i'} }).toArray();
        res.status(200).json(allChats.map(chat => chat.chat));
    } catch (error) {
        res.status(500).json({ message: 'Błąd podczas pobierania czatów' });
    }
});

recordRoutes.route("/editPassword").put(async function(req, res) {
    const { login, password } = req.body;
    try {
        let db_connect = dbo.getDb("pswbaza");
        const usersCollection = db_connect.collection('users');
        const user = await usersCollection.findOne({ login: login });
        if (user) {
            const hashedPassword = await bcrypt.hash(password, saltRounds);
            const result = await usersCollection.updateOne({ login: login }, { $set: { password: hashedPassword } });
            res.status(200).json({ message: 'Hasło zmienione' });
        } else {
            res.status(404).json({ message: 'Użytkownik nie został znaleziony' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Błąd podczas zmiany hasła' });
    }
});
recordRoutes.route("/editLogin").put(async function(req, res) {
    const { login, newLogin } = req.body;
    try {
        let db_connect = dbo.getDb("pswbaza");
        const usersCollection = db_connect.collection('users');
        const user = await usersCollection.findOne({ login: login });
        if (user) {
            const result = await usersCollection.updateOne({ login: login }, { $set: { login: newLogin } });
            res.status(200).json({ message: 'Login zmieniony' });
            console.log("Zmienilem login");
        } else {
            res.status(404).json({ message: 'Użytkownik nie został znaleziony' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Błąd podczas zmiany loginu' });
    }
});
recordRoutes.route("/addChat").post(async function(req, res) {
    const { chat } = req.body;
    try {
        let db_connect = dbo.getDb("pswbaza");
        const chatsCollection = db_connect.collection('chats');
        const existingChat = await chatsCollection.findOne({ chat: chat });
        if (existingChat) {
            return res.status(500).json({ message: 'Jest już taki czat' });
        }else{
            const result = await chatsCollection.insertOne({ chat: chat });
            res.status(201).json({ message: 'Czat dodany'});
            console.log("Dodalem czat");
        }
    } catch (error) {
        res.status(500).json({ message: 'Błąd podczas dodawania czatu' });
    }
}
);
recordRoutes.route("/getChats").get(async function(req, res) {
    try {
        let db_connect = dbo.getDb("pswbaza");
        const chatsCollection = db_connect.collection('chats');
        const allChats = await chatsCollection.find({}).toArray();
        res.status(200).json(allChats.map(chat => chat.chat));
        console.log("Pobralem czaty")
    } catch (error) {
        res.status(500).json({ message: 'Błąd podczas pobierania czatów' });
    }
});
recordRoutes.route("/deleteAllChats").delete(async function(req, res) {
    try {
        let db_connect = dbo.getDb("pswbaza");
        const chatsCollection = db_connect.collection('chats');
        const result = await chatsCollection.deleteMany({});
        res.status(200).json({ message: 'Wszystkie czaty usuniete'});
        console.log("Usunalem wszystkie czaty");
    } catch (error) {
        res.status(500).json({ message: 'Nie udało sie usunąć wszystkich czatów'});
    }
});
module.exports = recordRoutes;
