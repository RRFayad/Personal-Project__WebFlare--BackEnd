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

exports.getOffersByUserId = getOffersByUserId;
exports.getReceivedOffersByUserId = getReceivedOffersByUserId;
exports.createOffer = createOffer;
