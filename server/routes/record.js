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
recordRoutes.route("/addOgloszenie").post(async function(req, res) {
    const { tytul, tresc, login } = req.body;
    try {
        let db_connect = dbo.getDb("pswbaza");
        const ogloszeniaCollection = db_connect.collection('ogloszenia');
        const result = await ogloszeniaCollection.insertOne({ tytul: tytul, tresc: tresc, login: login, komentarze: [] });
        res.status(201).json({ message: 'Ogłoszenie dodane'});
        console.log("Dodalem ogloszenie");
    } catch (error) {
        res.status(500).json({ message: 'Błąd podczas dodawania ogłoszenia' });
    }
}
);
recordRoutes.route("/getOgloszenia").get(async function(req, res) {
    try {
        let db_connect = dbo.getDb("pswbaza");
        const ogloszeniaCollection = db_connect.collection('ogloszenia');
        const allOgloszenia = await ogloszeniaCollection.find({}).toArray();
        res.status(200).json(allOgloszenia);
        console.log("Pobralem ogloszenia")
    } catch (error) {
        res.status(500).json({ message: 'Błąd podczas pobierania ogłoszeń' });
    }
});
recordRoutes.route("/addKomentarz").put(async function(req, res) {
    const { id, komentarz, login } = req.body;
    try {
        let db_connect = dbo.getDb("pswbaza");
        const ogloszeniaCollection = db_connect.collection('ogloszenia');
        const result = await ogloszeniaCollection.updateOne({ _id: ObjectId(id) }, { $push: { komentarze: { komentarz: komentarz, login: login } } });
        res.status(200).json({ message: 'Komentarz dodany'});
        console.log("Dodalem komentarz");
    } catch (error) {
        res.status(500).json({ message: 'Błąd podczas dodawania komentarza' });
    }
}
);
recordRoutes.route("/deleteAllOgloszenia").delete(async function(req, res) {
    try {
        let db_connect = dbo.getDb("pswbaza");
        const ogloszeniaCollection = db_connect.collection('ogloszenia');
        const result = await ogloszeniaCollection.deleteMany({});
        res.status(200).json({ message: 'Wszystkie ogloszenia usuniete'});
        console.log("Usunalem wszystkie ogloszenia");
    } catch (error) {
        res.status(500).json({ message: 'Nie udało sie usunąć wszystkich ogloszeń'});
    }
});
recordRoutes.route("/deleteOgloszenie").delete(async function(req, res) {
    const { id } = req.body;
    try {
        let db_connect = dbo.getDb("pswbaza");
        const ogloszeniaCollection = db_connect.collection('ogloszenia');
        const result = await ogloszeniaCollection.deleteOne({ _id: ObjectId(id) });
        res.status(200).json({ message: 'Ogloszenie usuniete'});
        console.log("Usunalem ogloszenie");
    } catch (error) {
        res.status(500).json({ message: 'Nie udało sie usunąć ogloszenia'});
    }
});
recordRoutes.route("/editOgloszenieTitle").put(async function(req, res) {
    const { id, tytul } = req.body;
    try {
        let db_connect = dbo.getDb("pswbaza");
        const ogloszeniaCollection = db_connect.collection('ogloszenia');
        const result = await ogloszeniaCollection.updateOne({ _id: ObjectId(id) }, { $set: { tytul: tytul } });
        res.status(200).json({ message: 'Tytul ogloszenia zmieniony'});
        console.log("Zmienilem tytul ogloszenia");
    } catch (error) {
        res.status(500).json({ message: 'Nie udało sie zmienić tytulu ogloszenia'});
    }
});

recordRoutes.route("/addNote").post(async function(req, res) {
    const { note, login } = req.body;
    try {
        let db_connect = dbo.getDb("pswbaza");
        const notesCollection = db_connect.collection('notes');
        const result = await notesCollection.insertOne({ note: note, login: login });
        res.status(201).json({ message: 'Notatka dodana'});
        console.log("Dodalem notatke");
    } catch (error) {
        res.status(500).json({ message: 'Błąd podczas dodawania notatki' });
    }
}
);

recordRoutes.route("/getNotes").get(async function(req, res) {
    try {
        let db_connect = dbo.getDb("pswbaza");
        const notesCollection = db_connect.collection('notes');
        const allNotes = await notesCollection.find({}).toArray();
        res.status(200).json(allNotes);
        console.log("Pobralem notatki")
    } catch (error) {
        res.status(500).json({ message: 'Błąd podczas pobierania notatek' });
    }
});
recordRoutes.route("/deleteAllNotes").delete(async function(req, res) {
    try {
        let db_connect = dbo.getDb("pswbaza");
        const notesCollection = db_connect.collection('notes');
        const result = await notesCollection.deleteMany({});
        res.status(200).json({ message: 'Wszystkie notatki usuniete'});
        console.log("Usunalem wszystkie notatki");
    } catch (error) {
        res.status(500).json({ message: 'Nie udało sie usunąć wszystkich notatek'});
    }
});

module.exports = recordRoutes;
