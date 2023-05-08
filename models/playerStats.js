'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const playerStatsSchema = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  data: {
    createdAt: {
      type: Number,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    accountId: {
      type: Number,
      required: true,
    },
    snapshots: {
      type: Array,
      required: true,
    },
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

