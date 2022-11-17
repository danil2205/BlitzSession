'use strict';

const express = require('express');
const cors = require('cors');
const app = express();

// const whitelist = ['http://localhost:3000', 'https://localhost:3443', 'http://DESKTOP-VHT7MJ3:3001'];
const whitelist = ['https://localhost:3005', 'https://localhost:3443', 'http://DESKTOP-VHT7MJ3:3001'];
const corsOptionsDelegate = (req, callback) => {
  let corsOptions;
  if (whitelist.indexOf(req.header('Origin')) !== -1) {
    corsOptions = { origin: true };
  } else {
    corsOptions = { origin: false };
  }
  callback(null, corsOptions);
};

exports.cors = cors();
exports.corsWithOptions = cors(corsOptionsDelegate);
