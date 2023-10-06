const mongoose = require('mongoose');
const { nichesOptions, businessTypesOptions } = require('../util/parameters');

const businessSchema = new mongoose.Schema({
  title: { type: String, required: true },
  image: { type: String, required: true },
  type: { type: String, required: true, enum: businessTypesOptions },
  niche: { type: String, required: true, enum: nichesOptions },
  age: { type: Number, required: true },
  monthlyRevenue: { type: Number, required: true },
  monthlyProfit: { type: Number, required: true },
  askingPrice: { type: Number, required: true },
  description: { type: String, required: true },
  owner: { type: mongoose.Types.ObjectId, required: true, ref: 'User' },
});

module.exports = mongoose.model('Business', businessSchema);
