This project is a backend API for a cinema booking system. It includes user authentication, admin tools, movie and screen management, showtime scheduling, temporary seat reservations, and full booking functionality.

Setup & Installation

Clone the project from GitHub and open the backend folder.

Install all required packages using “npm install”.

Start the server by running “node server.js”.

The server will run on http://localhost:3000


Database

SQLite is used, and the database file (iyad_cinema.db) is created automatically when the server starts for the first time.
If you want to view the database tables, install the “SQLite Viewer” extension in VS Code.

Authentication

An admin user can be created by running the file createAdmin.js.
After logging in through the /auth/login endpoint, a JWT token is returned as a cookie. This cookie must be sent with all protected routes.

Main Routes

/auth for login, register, logout

/movies for movie management

/screens for cinema screen settings

/showtimes for scheduling movies

/bookings for seat reservations and bookings

/admin for dashboard and admin booking tools