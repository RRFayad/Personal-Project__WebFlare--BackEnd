const mongoose = require('mongoose');
const { validationResult } = require('express-validator');
const HttpError = require('../models/http-error');
const Offer = require('../models/offer-model');
const Business = require('../models/business-model');
const User = require('../models/user-model');

const getOfferById = async (req, res, next) => {
  const offerId = req.params.oid;

  let offer;
  try {
    offer = await Offer.findById(offerId)
      .populate({ path: 'business', populate: { path: 'owner' } })
      .populate('sender');
  } catch (error) {
    return next(new HttpError(`Could not fetch offer - "${error}"`, 500));
  }

  if (!offer) {
    return next(new HttpError('Offer not found', 404));
  }

  return res.json({ offer: offer.toObject({ getters: true }) });
};

const getOffersByUserId = async (req, res, next) => {
  const userId = req.params.uid;
  let offers = [];
  try {
    const populatedUser = await User.findById(userId)
      .populate('sentOffers')
      .populate('receivedOffers');
    offers = {
      sentOffers: populatedUser.sentOffers.map(offer =>
        offer.toObject({ getters: true }),
      ),
      receivedOffers: populatedUser.receivedOffers.map(offer =>
        offer.toObject({ getters: true }),
      ),
    };
  } catch (error) {
    return next(new HttpError(`Could not fetch user data - "${error}"`, 500));
  }

  return res.json({ offers });
};

const createOffer = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError(`${errors.array()[0].msg}`, 422));
  }

  const { businessId, message, offerValue } = req.body;

  const senderId = req.decodedTokenData.userId;

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

  return res.status(201).json({ offer: newOffer.toObject({ getters: true }) });
};

const acceptOfferById = async (req, res, next) => {
  const offerId = req.params.oid;

  let offer;
  let offerReceiverId;
  try {
    offer = await Offer.findById(offerId).populate('business');
    offerReceiverId = offer.business.owner.toString();
  } catch (error) {
    return next(new HttpError(`Fetching offer failed - "${error}"`, 500));
  }

  if (!offer) {
    return next(new HttpError('Offer not found', 404));
  }

  if (offerReceiverId !== req.decodedTokenData.userId) {
    return next(new HttpError('Not Authorized', 403));
  }

  offer.status = 'accepted';

  let result;
  try {
    result = await offer.save();
  } catch (error) {
    return next(new HttpError(`Saiving offer failed - "${error}"`, 500));
  }

  return res.json({ offer: result.toObject({ getters: true }) });
};

const deleteOfferById = async (req, res, next) => {
  const offerId = req.params ? req.params.oid : req; // I created this logic to be able to reuse this logic inside the business controller

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

  if (offerReceiver.id !== req.decodedTokenData.userId) {
    return next(new HttpError('Not Authorized', 403));
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

  return req.params && res.json({ message: 'Offer deleted successfully' });
};

exports.getOfferById = getOfferById;
exports.getOffersByUserId = getOffersByUserId;
exports.createOffer = createOffer;
exports.acceptOfferById = acceptOfferById;
exports.deleteOfferById = deleteOfferById;
