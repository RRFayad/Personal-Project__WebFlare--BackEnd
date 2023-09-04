const mongoose = require('mongoose');

const HttpError = require('../models/http-error');
const Business = require('../models/business-model');
const User = require('../models/user-model');

const getAllBusinesses = async (req, res, next) => {
  let businesses;

  try {
    businesses = await Business.find();
  } catch {
    return next(
      new HttpError('Could not fetch businesses, please try again later', 500),
    );
  }

  return res.json({
    businesses: businesses.map(business =>
      business.toObject({ getters: true }),
    ),
  });
};

const createBusiness = async (req, res, next) => {
  const {
    title,
    imageUrl,
    type,
    niche,
    age,
    monthlyRevenue,
    monthlyProfit,
    askingPrice,
    description,
    ownerId,
  } = req.body;

  const newBusiness = new Business({
    title,
    imageUrl:
      imageUrl ||
      'https://assets.entrepreneur.com/content/3x2/2000/1602623277-GettyImages-1204099658.jpg',
    type,
    niche,
    age,
    monthlyRevenue,
    monthlyProfit,
    askingPrice,
    description,
    owner: ownerId,
  });

  let user;
  try {
    user = await User.findById(ownerId);
  } catch (err) {
    return next(new HttpError(`Fetching user failed - "${err}"`, 500));
  }

  try {
    const session = await mongoose.startSession();
    session.startTransaction();
    await newBusiness.save({ session });
    await user.businesses.push(newBusiness);
    await user.save({ session });
    await session.commitTransaction();
  } catch (err) {
    return next(new HttpError(`Saving business failed - "${err}"`, 500));
  }

  return res
    .status(201)
    .json({ business: newBusiness.toObject({ getters: true }) });
};

exports.getAllBusinesses = getAllBusinesses;
exports.createBusiness = createBusiness;
