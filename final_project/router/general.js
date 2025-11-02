const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.post("/register", (req, res) => {
    //Write your code here
    const username = req.body.username;
    const password = req.body.password;
    if (!username || !password) {
        return res.status(400).json({ message: "Username y password son requeridos" });
    }
    const userExists = users.some(user => user.username === username);
    if (userExists) {
        return res.status(409).json({ message: "El nombre de usuario ya existe" });
    }
    users.push({ username: username, password: password });
    return res.status(201).json({ message: "Usuario registrado exitosamente" });

});

// Get the book list available in the shop
public_users.get('/', async function (req, res) {
    try {
        const response = await Promise.resolve({ data: books });
        res.send(JSON.stringify(response.data, null, 4));
    } catch (error) {
        res.status(500).json({ message: "Error al obtener la lista de libros", error: error.message });
    }
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', async function (req, res) {
    const isbn = req.params.isbn;
    try {
        const response = await Promise.resolve({ data: books[isbn] });
        if (response.data) {
            res.send(JSON.stringify(response.data, null, 4));
        } else {
            res.status(404).json({ message: "Libro no encontrado para el ISBN proporcionado" });
        }
    } catch (error) {
        res.status(500).json({ message: "Error al obtener el libro", error: error.message });
    }
});


// Get book details based on author
public_users.get('/author/:author', async function (req, res) {
    const author = req.params.author.toLowerCase();
    try {
        const response = await Promise.resolve({ data: books });
        const booksByAuthor = Object.values(response.data).filter(book =>
            book.author.toLowerCase() === author
        );

        if (booksByAuthor.length > 0) {
            res.send(JSON.stringify(booksByAuthor, null, 4));
        } else {
            res.status(404).json({ message: "No se encontraron libros para el autor proporcionado" });
        }
    } catch (error) {
        res.status(500).json({ message: "Error al obtener libros por autor", error: error.message });
    }
});

// Get all books based on title
public_users.get('/title/:title', async function (req, res) {
    const title = req.params.title.toLowerCase();
    try {
        const response = await Promise.resolve({ data: books });
        const booksByTitle = Object.values(response.data).filter(book =>
            book.title.toLowerCase() === title
        );
        if (booksByTitle.length > 0) {
            res.send(JSON.stringify(booksByTitle, null, 4));
        } else {
            res.status(404).json({ message: "No se encontraron libros para el título proporcionado" });
        }
    } catch (error) {
        res.status(500).json({ message: "Error al obtener libros por título", error: error.message });
    }
});

//  Get book review
public_users.get('/review/:isbn', function (req, res) {
    //Write your code here
    const isbn = req.params.isbn;
    if (books[isbn]) {
        res.send(JSON.stringify(books[isbn].reviews, null, 4));
    } else {
        res.status(404).json({ message: "Libro no encontrado para el ISBN proporcionado" });
    }
    return res.status(300).json({ message: "Yet to be implemented" });
});

module.exports.general = public_users;
