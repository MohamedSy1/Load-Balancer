const express = require('express');

const app = express();

app.get('/', (req, res) => {
  res.send('Hello from server!');
});

app.listen(8081, () => {
  console.log('Backend server running on port 8081'); 
});