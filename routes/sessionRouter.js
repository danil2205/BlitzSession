'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const authenticate = require('../authenticate');
const cors = require('./cors');
const { startSession, endSession } = require('../index');

const Session = require('../models/session');
const Accounts = require('../models/accounts');
const sessionRouter = express.Router();
sessionRouter.use(bodyParser.json());

sessionRouter.route('/')
  .options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
  .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    Session.find({'user': req.user._id})
      .populate('user')
      .then((accounts) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(accounts);
      }, (err) => next(err))
      .catch((err) => next(err));
  });


sessionRouter.route('/:sessionStatus')
  .options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
  .get(cors.cors, authenticate.verifyUser, async (req, res, next) => {
    const accountID = await Accounts.findOne({'user': req.user._id})
      .then((acc) => acc.userAccounts[0].account_id); // [0] - bullshit :(
    let result;

    if (req.params.sessionStatus === '0') {
      console.log('Session Started');
      result = await startSession(accountID);
    }

    if (req.params.sessionStatus === '1') {
      console.log('Session Ended');
      result = await endSession(accountID);
    }

    if (req.params.sessionStatus === '2') {
      console.log('Session Cleared');
      result = await startSession(accountID);
    }

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json(result);
  });

module.exports = sessionRouter;
