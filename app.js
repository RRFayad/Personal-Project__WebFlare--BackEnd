const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

app.get('/', (req, res, next) => {
  return res.send('<h1>Hi :) </h1>');
});
app.listen(5000);
