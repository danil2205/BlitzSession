'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const playerStatsSchema = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  data: {
    type: Object,
    required: true,
  },
  success: {
    type: Boolean,
    required: true,
  },
}, {
  timestamps: true
});

const playerStats = mongoose.model('PlayerStats', playerStatsSchema);

module.exports = playerStats;

