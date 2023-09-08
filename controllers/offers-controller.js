const mongoose = require('mongoose');
const { validationResult } = require('express-validator');
const HttpError = require('../models/http-error');
const Offer = require('../models/offer-model');
const Business = require('../models/business-model');
const User = require('../models/user-model');

const getOffersByUserId = async (req, res, next) => {
  const userId = req.params.uid;
  let offers = [];
  try {
    const populatedUser = await User.findById(userId).populate(
      req.path.split('/')[2] === 'sent' ? 'sentOffers' : 'receivedOffers',
    );
    offers =
      req.path.split('/')[2] === 'sent'
        ? populatedUser.sentOffers
        : populatedUser.receivedOffers;
  } catch (error) {
    return next(new HttpError(`Could not fetch user data - "${error}"`, 500));
  }

  return res.json({
    offers: offers.map(offer => offer.toObject({ getters: true })),
  });
};

const getReceivedOffersByUserId = async (req, res, next) => {};

const createOffer = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError(`${errors.array()[0].msg}`, 422));
  }

  const {
    business: businessId,
    message,
    offerValue,
    sender: senderId,
  } = req.body;

  const newOffer = new Offer({
    business: businessId,
    message,
    offerValue,
    sender: senderId,
    status: 'active', // status: active, accepted, denied
  });

  let offerSender;
  let business;
  let offerReceiver;

  try {
    offerSender = await User.findById(senderId);
    business = await Business.findById(businessId).populate('owner');
    offerReceiver = await business.owner;
  } catch (error) {
    return next(new HttpError(`Fetching data failed - "${error}"`, 500));
  }

  try {
    const session = await mongoose.startSession();
    session.startTransaction();
    await newOffer.save({ session });
    await offerSender.sentOffers.push(newOffer);
    await offerSender.save({ session });
    await offerReceiver.receivedOffers.push(newOffer);
    await offerReceiver.save({ session });
    await session.commitTransaction();
  } catch (error) {
    return next(new HttpError(`Creating Offer failed - "${error}"`, 500));
  }

  return res
    .status(201)
    .json({ newOffer: newOffer.toObject({ getters: true }) });
};

const acceptOfferById = async (req, res, next) => {
  const offerId = req.params.oid;

  let offer;
  try {
    offer = await Offer.findById(offerId);
  } catch (error) {
    return next(new HttpError(`Fetching offer failed - "${error}"`, 500));
  }

  if (!offer) {
    return next(new HttpError('Offer not found', 404));
  }

  offer.status = 'accepted';

  let result;
  try {
    result = await Offer.save();
  } catch (error) {
    return next(new HttpError(`Saiving offer failed - "${error}"`, 500));
  }

  return res.json({ offer: result.toObject({ getters: true }) });
};

const deleteOfferById = async (req, res, next) => {
  const offerId = req.params.oid;

  let offer;
  let offerSender;
  let offerReceiver;

  try {
    offer = await Offer.findById(offerId).populate(['sender', 'business']);
    offerSender = offer.sender;
    const business = await offer.business.populate('owner');
    offerReceiver = business.owner;
  } catch (error) {
    return next(new HttpError(`Fetching data failed - "${error}"`, 500));
  }

  if (!offer) {
    return next(new HttpError('Offer not found', 404));
  }

  try {
    const session = await mongoose.startSession();
    session.startTransaction();
    await offer.deleteOne({ session });
    await offerSender.sentOffers.pull(offer);
    await offerReceiver.receivedOffers.pull(offer);
    await offerSender.save({ session });
    await offerReceiver.save({ session });
    await session.commitTransaction();
  } catch (error) {
    return next(new HttpError(`Deleting offer failed - "${error}"`, 500));
  }

  return res.json({ message: 'Offer deleted successfully' });
};

exports.getOffersByUserId = getOffersByUserId;
exports.getReceivedOffersByUserId = getReceivedOffersByUserId;
exports.createOffer = createOffer;
exports.acceptOfferById = acceptOfferById;
exports.deleteOfferById = deleteOfferById;
