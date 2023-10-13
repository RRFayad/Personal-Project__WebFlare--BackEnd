const fs = require('fs');
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
require('dotenv').config();

const usersRoutes = require('./routes/users-routes');
const businessesRoutes = require('./routes/businesses-routes');
const offersRoutes = require('./routes/offers-routes');

const app = express();
app.use(bodyParser.json());

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, PATCH, DELETE',
  );
  next();
});

app.use('/images', express.static(path.join('images')));
app.use('/api/users', usersRoutes);
app.use('/api/businesses', businessesRoutes);
app.use('/api/offers', offersRoutes);

app.use((error, req, res, next) => {
  if (req.file) {
    fs.unlink(req.file.path, err => console.log(err));
  }
  res.status(error.status).json({ message: `${error.message}` });
});

mongoose
  .connect(
    `mongodb+srv://renanrfayad:${process.env.MONGO_PROJECT_PASSWORD}@webflare-cluster.qhiblj4.mongodb.net/`,
  )
  .then(() => {
    app.listen(process.env.PORT || 5000);
  })
  .catch(err => console.log(err));
