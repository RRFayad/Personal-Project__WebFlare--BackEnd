const mongoose = require('mongoose');
const { nichesOptions, businessTypesOptions } = require('../util/parameters');

const businessSchema = new mongoose.Schema({
  title: { type: String, required: true },
  imageUrl: { type: String, required: false },
  type: { type: String, required: true, enum: businessTypesOptions },
  niche: { type: String, required: true, enum: nichesOptions },
  age: { type: Number, required: true },
  monthlyRevenue: { type: Number, required: true },
  monthlyProfit: { type: Number, required: true },
  askingPrice: { type: Number, required: true, unique: true },
  description: { type: String, required: true },
  ownerId: [{ type: mongoose.Types.ObjectId, required: true, ref: 'User' }],
});

module.exports = mongoose.model('Business', businessSchema);
