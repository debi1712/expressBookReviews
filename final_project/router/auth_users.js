const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => { //returns boolean
    //write code to check is the username is valid
    return users.some(user => user.username === username);
}

const authenticatedUser = (username, password) => { //returns boolean
    //write code to check if username and password match the one we have in records.
    return users.some(user => user.username === username && user.password === password);
}

//only registered users can login
regd_users.post("/login", (req, res) => {
    //Write your code here
    const username = req.body.username;
    const password = req.body.password;
    if (!username || !password) {
        return res.status(400).json({ message: "Username y password son requeridos" });
    }
    if (!authenticatedUser(username, password)) {
        return res.status(401).json({ message: "Credenciales inválidas" });
    }
    const accessToken = jwt.sign(
        { username: username },
        'fingerprint_customer',
        { expiresIn: '1h' }
    );
    req.session.authorization = { accessToken };

    return res.status(200).json({ message: "Login exitoso", accessToken: accessToken });
});



// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    //Write your code here
    const isbn = req.params.isbn;
    const username = req.user ? req.user.username : null;
    const review = req.query.review;

    if (!username) {
        return res.status(401).json({ message: "Usuario no autenticado. Por favor inicia sesión." });
    }

    if (!review) {
        return res.status(400).json({ message: "La reseña es requerida como parámetro de consulta." });
    }

    if (!books[isbn]) {
        return res.status(404).json({ message: "Libro no encontrado para el ISBN proporcionado." });
    }

    if (!books[isbn].reviews) {
        books[isbn].reviews = {};
    }

    books[isbn].reviews[username] = review;

    return res.status(200).json({ message: "Reseña agregada/modificada exitosamente.", reviews: books[isbn].reviews });
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const username = req.user ? req.user.username : null;

    if (!username) {
        return res.status(401).json({ message: "Usuario no autenticado. Por favor inicia sesión." });
    }

    if (!books[isbn]) {
        return res.status(404).json({ message: "Libro no encontrado para el ISBN proporcionado." });
    }

    if (!books[isbn].reviews || !books[isbn].reviews[username]) {
        return res.status(404).json({ message: "No existe una reseña de este usuario para eliminar." });
    }

   
    delete books[isbn].reviews[username];

    return res.status(200).json({ message: "Reseña eliminada exitosamente.", reviews: books[isbn].reviews });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
