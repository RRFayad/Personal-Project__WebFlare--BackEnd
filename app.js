const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
require('dotenv').config();

const usersRoutes = require('./routes/users-routes');
const businessesRoutes = require('./routes/businesses-routes');
const offersRoutes = require('./routes/offers-routes');

const app = express();
app.use(bodyParser.json());

app.use('/api/users', usersRoutes);
app.use('/api/businesses', businessesRoutes);
app.use('/api/offers', offersRoutes);

app.use((error, req, res, next) => {
  res.json({ message: error.message });
});

mongoose
  .connect(
    `mongodb+srv://renanrfayad:${process.env.MONGO_PROJECT_PASSWORD}@webflare-cluster.qhiblj4.mongodb.net/`,
  )
  .then(() => app.listen(5000))
  .catch(err => console.log(err));
