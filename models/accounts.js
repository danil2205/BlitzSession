'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const accountSchema = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  userAccounts: [{
    account_id: {
      type: Number,
      required: true,
    },
    nickname: {
      type: String,
      require: true,
    },
    access_token: {
      type: String,
      require: true,
    },
    expires_at: {
      type: Number,
      require: true,
    },
  }],
}, {
  timestamps: true
});

const accounts = mongoose.model('Account', accountSchema);

module.exports = accounts;

