'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const User = new Schema({
  firstName: {
    type: String,
    default: '',
  },
  lastName: {
    type: String,
    default: '',
  },
  facebookId: String,
  admin: {
    type: Boolean,
    default: false,
  },
});

User.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', User);
