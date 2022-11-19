'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const settingsSchema = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  alignment: {
    type: String,
    required: true,
  },
  backgroundColor: {
    type: String,
    required: true,
  },
  textColor: {
    type: String,
    required: true,
  },
  fontSize: {
    type: String,
    required: true,
  },
  battleText: {
    type: String,
    required: true,
  },
  damageText: {
    type: String,
    required: true,
  },
  winrateText: {
    type: String,
    required: true,
  },
  fontFamily: {
    type: String,
    required: true,
  },
}, {
  timestamps: true
});

const settings = mongoose.model('Settings', settingsSchema);

module.exports = settings;

