const mongoose = require('mongoose');
const { validationResult } = require('express-validator');

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

const getBusinessesByUserId = async (req, res, next) => {
  const userId = req.params.uid;

  let businesses;
  try {
    const populatedUser = await User.findById(userId).populate('businesses');
    businesses = populatedUser.businesses;
  } catch (error) {
    return next(new HttpError(`Saving business failed - "${error}"`, 500));
  }

  return res.json({
    businesses: businesses.map(business =>
      business.toObject({ getters: true }),
    ),
  });
};

const getBusinessById = async (req, res, next) => {
  const businessId = req.params.bid;

  let business;
  try {
    business = await Business.findById(businessId);
  } catch (error) {
    return next(new HttpError(`Could not fetch business - "${error}"`, 500));
  }

  if (!business) {
    return next(new HttpError('Business not found', 404));
  }

  return res.json({ business: business.toObject({ getters: true }) });
};

const createBusiness = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError('Invalid Inputs'));
  }

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

const updateBusinessById = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError('Invalid Inputs'));
  }

  const businessId = req.params.bid;

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
  } = req.body;

  let business;
  try {
    business = await Business.findById(businessId);
  } catch (error) {
    return next(new HttpError(`Fetching business failed - "${error}"`, 500));
  }

  if (!business) {
    return next(new HttpError('Business not found', 404));
  }

  Object.assign(business, {
    title,
    imageUrl,
    type,
    niche,
    age,
    monthlyRevenue,
    monthlyProfit,
    askingPrice,
    description,
  });

  let result;
  try {
    result = await business.save();
  } catch (error) {
    return next(new HttpError(`Saving business failed - "${error}"`, 500));
  }

  return res.json({ result: result.toObject({ getters: true }) });
};

const deleteBusinessById = async (req, res, next) => {
  const businessId = req.params.bid;

  let business;
  try {
    business = await Business.findById(businessId).populate('owner');
  } catch (error) {
    return next(new HttpError(`Fetching business failed - "${error}"`, 500));
  }

  if (!business) {
    return next(new HttpError('Business not found', 404));
  }

  try {
    const session = await mongoose.startSession();
    session.startTransaction();
    await business.deleteOne({ session });
    business.owner.businesses.pull(business);
    await business.owner.save({ session });
    await session.commitTransaction();
  } catch (error) {
    return next(new HttpError(`Deleting business failed - "${error}"`, 500));
  }
  return res.json({ message: 'Place Deleted Successfully' });
};

exports.getAllBusinesses = getAllBusinesses;
exports.createBusiness = createBusiness;
exports.getBusinessesByUserId = getBusinessesByUserId;
exports.getBusinessById = getBusinessById;
exports.updateBusinessById = updateBusinessById;
exports.deleteBusinessById = deleteBusinessById;
