const express = require('express');

const app = express();

app.get('/', (req, res) => {
  res.send('Hello from server!');
});

app.get('/health', (req, res) => {
  res.status(200).send('Server is healthy');
});

app.listen(8081, () => {
  console.log('Backend server running on port 8081'); 
});