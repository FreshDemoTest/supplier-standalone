const express = require('express');
const app = express();
const port = process.env.PORT || 3000; // Use the port from environment variable or default to 3000

// Middleware and routes go here
app.get('/', (req, res) => {
  res.send('Hello World!');
});

// Start the server
app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${port}`);
});