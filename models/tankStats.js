'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const tankStatsSchema = new Schema({
  account_id: {
    type: Number,
    required: true,
  },
  data: [{
    hp: {
      type: Number,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    isPremium: {
      type: Boolean,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    snapshots: {
      type: Array,
      required: true,
    },
    tank_id: {
      type: Number,
      required: true,
    },
    tier: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
  }],
  status: {
    type: Boolean,
    required: true,
  },
}, {
  timestamps: true
});

const tankStats = mongoose.model('TankStats', tankStatsSchema);

module.exports = tankStats;