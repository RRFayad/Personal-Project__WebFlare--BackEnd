const mongoose = require('mongoose');

const statusOptions = ['active', 'accepted', 'denied'];

const offerSchema = new mongoose.Schema({
  business: { type: mongoose.Types.ObjectId, required: true, ref: 'Business' },
  message: { type: String, required: false },
  offerValue: { type: Number, required: true },
  sender: { type: mongoose.Types.ObjectId, required: true, ref: 'User' },
  status: { type: String, required: true, enum: statusOptions },
});

module.exports = mongoose.model('Offer', offerSchema);
