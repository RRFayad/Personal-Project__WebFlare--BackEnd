const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  country: { type: String, required: true },
  imageUrl: { type: String, required: false },
  profileUrl: { type: String, required: false },
  description: { type: String, required: true },
  businesses: [{ type: mongoose.Types.ObjectId, required: true, ref: 'User' }],
  offers: [{ type: mongoose.Types.ObjectId, required: true, ref: 'Offer' }],
});

userSchema.plugin(uniqueValidator);

module.exports = mongoose.model('User', userSchema);
