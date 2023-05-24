'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const authenticate = require('../authenticate');
const cors = require('./cors');
const { fetchAllPlayerStats } = require('../utils/serverStatistic.js');
const ServerStats = require('../models/serverStats.js');

const serverRouter = express.Router();
serverRouter.use(bodyParser.json());

serverRouter.route('/')
  .options(cors.corsWithOptions, (_, res) => { res.sendStatus(200); })
  .get(cors.cors, async (req, res, next) => {
    try {
      const serverStats = await ServerStats.find({});
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.json(serverStats);
    } catch (err) {
      next(err);
    }
  })
  .post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, async (req, res, next) => {
    try {
      const allPlayersStats = await fetchAllPlayerStats();
      const serverStats = await ServerStats.findOneAndReplace({}, allPlayersStats, { new: true, projection: { _id: 0, 'tanks._id': 0 }, upsert: true });
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.json(serverStats);
    } catch (err) {
      next(err);
    }
  });

module.exports = serverRouter;