'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const sessionSchema = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  battles: {
    type: Number,
    required: true,
  },
  damage: {
    type: Number,
    required: true,
  },
  winRate: {
    type: String,
    required: true,
  },
}, {
  timestamps: true
});

const session = mongoose.model('Session', sessionSchema);

module.exports = session;

