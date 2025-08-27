const express = require('express');
const cors = require('cors');
const path = require('path');
const waitlistHandler = require('./api/waitlist.js');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Serve static files
app.use('/modification1', express.static('modification1'));

// API routes
app.post('/api/waitlist', waitlistHandler);

// Catch-all handler: send back index.html file
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});