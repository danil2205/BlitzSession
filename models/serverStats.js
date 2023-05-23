'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const serverStatsSchema = new Schema({
  account: {
    mastery: {
      type: Object,
      required: true,
    },
    regular: {
      type: Object,
      required: true,
    },
    rating: {
      type: Object,
      required: true,
    },
  },
  tanks: [{
    wotId: {
      type: Number,
      required: true,
    },
    battleLifeTime: {
      type: Number,
      required: true,
    },
    regular: {
      type: Object,
      required: true,
    },
    mastery: {
      type: Object,
      required: true,
    },
  }],
}, {
  timestamps: true
});

const serverStats = mongoose.model('ServerStats', serverStatsSchema);

module.exports = serverStats;