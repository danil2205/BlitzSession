'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const feedbackSchema = new Schema({
  firstname: {
    type: String,
    required: true,
  },
  lastname: {
    type: String,
    required: true,
  },
  telnum: {
    type: Number,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  agree: {
    type: Boolean,
    required: true,
  },
  contactType: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: false,
  },
}, {
  timestamps: true
});

const feedback = mongoose.model('Feedback', feedbackSchema);

module.exports = feedback;
