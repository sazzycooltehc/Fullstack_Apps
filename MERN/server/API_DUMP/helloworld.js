const express = require('express');
const app = express();
const port = 9000 || process.env.PORT;

app.get('/', (req, res) => {
  res.send('Hello, World!');
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});