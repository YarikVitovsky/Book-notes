# Book Notes

A web application for tracking books I've read and sharing notes with other users.  
This project demonstrates user authentication, integration with public APIs, and CRUD operations using PostgreSQL.

## Features

- **User Login & Registration:**  
  Secure authentication using hashed passwords (`bcrypt`). Only logged-in users can leave notes on books.

- **One-to-Many Relationship:**  
  Each book can have multiple notes from different users. Notes are linked to both the book and the user, illustrating a classic one-to-many relationship in PostgreSQL.

- **Public API Integration:**  
  Book cover images are fetched dynamically from the Open Library Covers API using ISBNs.  
  Example integration uses `axios` or `node-fetch` to retrieve data from external APIs.

- **Express/Node.js Backend:**  
  The server is built with Express.js, handling routing, authentication, and API requests.

- **CRUD with PostgreSQL:**  
  - **Create:** Users can add notes to books.
  - **Read:** All users can view books and notes.
  - **Update:** (Extendable) Notes or book details can be updated.
  - **Delete:** (Extendable) Notes or books can be deleted.
  Data is persisted in a PostgreSQL database using parameterized queries for security.

## Technologies Used

- Node.js
- Express.js
- PostgreSQL
- bcrypt (for password hashing)
- axios or node-fetch (for API requests)
- EJS (for server-side rendering)
- dotenv (for environment variable management)

## How Public APIs Are Integrated

Public APIs like Open Library are accessed from the backend using HTTP clients (`axios` or `node-fetch`).  
The backend fetches book cover URLs based on ISBNs and passes them to the frontend for display.

## Getting Started

1. Clone the repository.
2. Install dependencies: `npm install`
3. Set up your `.env` file with database credentials and session secret.
4. Run database migrations from `queries.sql`.
5. Start the server: `node index.js`
6. Register a user, log in, and start adding/viewing notes!

## Learning Outcomes

- Understand and implement one-to-many relationships in relational databases.
- Integrate public APIs into web projects for dynamic content.
- Gain experience with Express/Node.js for server-side programming.
- Demonstrate ability to Create, Read, Update, and Delete data in PostgreSQL.
- Implement secure user authentication and session management.

---