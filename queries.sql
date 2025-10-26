CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE books (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    author VARCHAR(255),
    isbn VARCHAR(20),
    date_read DATE,
    rating INTEGER
);

CREATE TABLE notes (
    id SERIAL PRIMARY KEY,
    book_id INTEGER REFERENCES books(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO books (name, author, isbn, rating)
VALUES
('12 Rules for Life', 'Jordan B. Peterson', '9780345816023', 8),
('Can''t Hurt Me', 'David Goggins', '9781544512280', 9),
('Never Finished', 'David Goggins', '9781544534077', 9),
('Gulag Archipelago', 'Alexander Solzhenitsyn', '9780061253805', 10),
('The Picture of Dorian Gray', 'Oscar Wilde', '9780141439570', 7),
('Crime and Punishment', 'Fyodor Dostoevsky', '9780140449136', 8),
('Modern Man in Search of a Soul', 'Carl Jung', '9780156612067', 8),
('Man''s Search for Meaning', 'Viktor Frankl', '9780807014295', 10);