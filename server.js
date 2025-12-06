// server.js
// This file starts the backend server on port 3000

const app = require('./app');

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
