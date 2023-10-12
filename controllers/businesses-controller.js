const fs = require('fs');
const mongoose = require('mongoose');
const { validationResult } = require('express-validator');

const HttpError = require('../models/http-error');
const Business = require('../models/business-model');
const User = require('../models/user-model');
const Offer = require('../models/offer-model');
const offerControllers = require('./offers-controller');

const defaultImagePath = 'images/businesses/00_default-business-image.jpg';

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
    return next(new HttpError(`${errors.array()[0].msg}`, 422));
  }

  console.log('ihaa');

  const {
    title,
    type,
    niche,
    age,
    monthlyRevenue,
    monthlyProfit,
    askingPrice,
    description,
  } = req.body;

  const ownerId = req.decodedTokenData.userId;

  const newBusiness = new Business({
    title,
    image: req.file ? req.file.path : defaultImagePath,
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
    // console.log(err);
    return next(new HttpError(`Saving business failed - "${err}"`, 500));
  }

  return res
    .status(201)
    .json({ business: newBusiness.toObject({ getters: true }) });
};

const updateBusinessById = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError(`${errors.array()[0].msg}`, 422));
  }
  const businessId = req.params.bid;

  const {
    title,
    type,
    niche,
    age,
    monthlyRevenue,
    monthlyProfit,
    askingPrice,
    description,
  } = req.body;

  let business;
  let imagePath;
  try {
    business = await Business.findById(businessId);
    imagePath = business.image;
  } catch (error) {
    return next(new HttpError(`Fetching business failed - "${error}"`, 500));
  }

  if (!business) {
    return next(new HttpError('Business not found', 404));
  }

  let updatedImage;
  if (req.file) {
    updatedImage = req.file.path;
  } else {
    updatedImage = business.image;
  }

  Object.assign(business, {
    title,
    image: updatedImage,
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

  if (req.file && imagePath !== defaultImagePath) {
    fs.unlink(imagePath, err => console.log(err));
  }

  return res.json({ business: result.toObject({ getters: true }) });
};

const deleteBusinessById = async (req, res, next) => {
  const businessId = req.params.bid;

  let business;
  let imageToBeDeleted;
  try {
    business = await Business.findById(businessId).populate('owner');
    imageToBeDeleted = business.image;
  } catch (error) {
    return next(new HttpError(`Fetching business failed - "${error}"`, 500));
  }

  let offers;
  try {
    offers = await Offer.find({ business: businessId });
  } catch (error) {
    return next(new HttpError(`Fetching business failed - "${error}"`, 500));
  }

  try {
    const session = await mongoose.startSession();
    session.startTransaction();
    // eslint-disable-next-line no-restricted-syntax
    for (const offer of offers) {
      // eslint-disable-next-line no-await-in-loop
      await offerControllers.deleteOfferById(offer.id);
    }
    await business.deleteOne({ session });
    business.owner.businesses.pull(business);
    await business.owner.save({ session });
    await session.commitTransaction();
  } catch (error) {
    return next(new HttpError(`Deleting business failed - "${error}"`, 500));
  }

  if (imageToBeDeleted !== defaultImagePath) {
    fs.unlink(imageToBeDeleted, err => console.log(err));
  }
  return res.json({ message: 'Business Deleted Successfully' });
};

exports.getAllBusinesses = getAllBusinesses;
exports.createBusiness = createBusiness;
exports.getBusinessesByUserId = getBusinessesByUserId;
exports.getBusinessById = getBusinessById;
exports.updateBusinessById = updateBusinessById;
exports.deleteBusinessById = deleteBusinessById;
