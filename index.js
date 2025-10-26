const express = require('express');
const path = require('path');
const fetch = require('node-fetch');
const bodyParser = require('body-parser');
const { Client } = require('pg');
const bcrypt = require('bcrypt');
const session = require('express-session');
require('dotenv').config();



const db = new Client({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

db.connect();

const app = express();
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));

// Dummy books array for demonstration
const books = [
    {
        id: 1,
        name: 'Atomic Habits',
        author: 'James Clear',
        isbn: '9780735211292',
        dateRead: '2023-08-01',
        rating: 9
    },
    {
        id: 2,
        name: 'Deep Work',
        author: 'Cal Newport',
        isbn: '9781455586691',
        dateRead: '2023-09-15',
        rating: 8
    },
    {
        id: 3,
        name: '12 Rules for Life',
        author: 'Jordan Peterson',
        isbn: '9780345816023',
        dateRead: '2023-09-30',
        rating: 9
    },
    {
        id: 4,
        name: 'The Pragmatic Programmer',
        author: 'Andrew Hunt',
        isbn: '9780135957059',
        dateRead: '2023-10-05',
        rating: 10
    },
    {
        id: 5,
        name: 'Clean Code',
        author: 'Robert C. Martin',
        isbn: '9780136083238',
        dateRead: '2023-10-10',
        rating: 9
    }

];

// Example notes array
let notes = [];

// Helper to get cover URL from Open Library
function getCoverUrl(isbn) {
    return `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`;
}

// Helper to render main page
function renderMainPage(res, user, sort = 'recency') {
    let sortedBooks = [...books];

    if (sort === 'rating') {
        sortedBooks.sort((a, b) => b.rating - a.rating);
    } else if (sort === 'title') {
        sortedBooks.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sort === 'recency') {
        sortedBooks.sort((a, b) => new Date(b.dateRead) - new Date(a.dateRead));
    }

    const booksWithCovers = sortedBooks.map(book => ({
        ...book,
        coverUrl: getCoverUrl(book.isbn)
    }));
    res.render('index', { books: booksWithCovers, sort, user });
}

async function getSortedBooks(sort = 'recency') {
    let orderBy = 'date_read DESC';
    if (sort === 'rating') orderBy = 'rating DESC';
    else if (sort === 'title') orderBy = 'name ASC';

    const result = await db.query(`SELECT * FROM books ORDER BY ${orderBy}`);
    return result.rows.map(book => ({
        ...book,
        coverUrl: getCoverUrl(book.isbn)
    }));
}

// Usage in your route:
app.get('/', async (req, res) => {
    const sort = req.query.sort || 'recency';
    const booksWithCovers = await getSortedBooks(sort);
    res.render('index', { books: booksWithCovers, sort, user: req.session.user });
});

// Store user in memory for demo (replace with session for production)
let loggedInUser = null;

app.get('/book/:id', async (req, res) => {
    const bookId = req.params.id;
    const bookResult = await db.query('SELECT * FROM books WHERE id = $1', [bookId]);
    const book = bookResult.rows[0];
    if (!book) {
        return res.status(404).send('Book not found');
    }
    book.coverUrl = getCoverUrl(book.isbn);

    const notesResult = await db.query(
        'SELECT notes.*, users.username FROM notes JOIN users ON notes.user_id = users.id WHERE book_id = $1 ORDER BY notes.created_at DESC',
        [bookId]
    );
    const bookNotes = notesResult.rows;

    res.render('book', { book, user: req.session.user, notes: bookNotes });
});

app.post('/book/:id/note', async (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }
    const bookId = req.params.id;
    const { content } = req.body;

    try {
        await db.query(
            'INSERT INTO notes (book_id, user_id, content) VALUES ($1, $2, $3)',
            [bookId, req.session.user.id, content]
        );
        res.redirect(`/book/${bookId}`);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error adding note.');
    }
});





// Login and Registration Routes

app.get('/login', (req, res) => {
    res.render('login');
});

app.get('/register', (req, res) => {
    res.render('login');
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const result = await db.query(
            'SELECT * FROM users WHERE username = $1',
            [username]
        );
        const user = result.rows[0];
        if (!user) {
            return res.render('login', { error: 'Invalid username or password.' });
        }
        const match = await bcrypt.compare(password, user.password_hash);
        if (match) {
            req.session.user = { id: user.id, username: user.username }; // Store minimal info
            res.redirect('/');
        } else {
            res.render('login', { error: 'Invalid username or password.' });
        }
    } catch (err) {
        res.render('login', { error: 'Login failed. Please try again.' });
    }
});

app.post('/register', async (req, res) => {
    const { username, email, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        await db.query(
            'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3)',
            [username, email, hashedPassword]
        );
        res.render('login', { regSuccess: true });
    } catch (err) {
        if (err.code === '23505') {
            res.render('login', { error: 'Username or email already exists.' });
        } else {
            res.render('login', { error: 'Registration failed. Please try again.' });
        }
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});