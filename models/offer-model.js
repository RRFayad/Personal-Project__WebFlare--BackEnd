const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema({
  business: { type: mongoose.Types.ObjectId, required: true, ref: 'Business' },
  message: { type: String, required: false },
  offerValue: { type: Number, required: true },
  sender: { type: mongoose.Types.ObjectId, required: true, ref: 'User' },
  status: {
    type: String,
    required: true,
    enum: ['active', 'accepted', 'denied'],
  },
});

module.exports = mongoose.model('Offer', offerSchema);
