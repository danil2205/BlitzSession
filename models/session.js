'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const sessionSchema = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  inGameNickname: {
    type: String,
    required: true,
  },
  account_id: {
    type: Number,
    required: true,
  },
  battles: {
    type: Number,
    required: true,
  },
  damage: {
    type: Number,
    required: true,
  },
  wins: {
    type: Number,
    required: true,
  },
}, {
  timestamps: true
});

const session = mongoose.model('Session', sessionSchema);

module.exports = session;

