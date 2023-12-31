const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  image: { type: String, required: true },
  profileUrl: { type: String, required: false },
  country: { type: String, required: true },
  description: { type: String, required: true },
  businesses: [
    { type: mongoose.Types.ObjectId, required: true, ref: 'Business' },
  ],
  sentOffers: [{ type: mongoose.Types.ObjectId, required: true, ref: 'Offer' }],
  receivedOffers: [
    { type: mongoose.Types.ObjectId, required: true, ref: 'Offer' },
  ],
});

userSchema.plugin(uniqueValidator);

module.exports = mongoose.model('User', userSchema);
