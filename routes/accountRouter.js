'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const authenticate = require('../authenticate');
const cors = require('./cors');
const { postPlayerSnapshots } = require('../utils/wargaming.js');
const { isSameDay } = require('../utils/time');
const Accounts = require('../models/accounts');
const AccountStats = require('../models/accountStats.js');

const accountRouter = express.Router();
accountRouter.use(bodyParser.json());

accountRouter.route('/')
  .options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
  .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    Accounts.find({ 'user': req.user._id })
      .populate('user')
      .then((accounts) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(accounts);
      }, (err) => next(err))
      .catch((err) => next(err));
  })
  .post(cors.corsWithOptions, authenticate.verifyUser, async (req, res, next) => {
    try {
      if (req.body.account_id === null) {
        const err = new Error('Error while getting info');
        err.status = 401;
        err.message = 'Error while getting info';
        throw err;
      }

      const accounts = await Accounts.findOne({ user: req.user._id });

      if (!accounts) {
        const account = await Accounts.create({});
        account.user = req.user._id;
        account.userAccounts.push(req.body);
        await account.save();
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(account);
      } else {
        if (accounts.userAccounts.some(account => account.account_id.toString() === req.body.account_id)) {
          const err = new Error('You already have this account!');
          err.status = 401;
          throw err;
        }

        accounts.userAccounts.push(req.body);
        await accounts.save();
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(accounts);
      }
    } catch (err) {
      next(err);
    }
  })
  .put(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
    res.statusCode = 403;
    res.end('PUT operation is not supported on /accounts');
  })
  .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Accounts.remove({ 'user': req.user._id })
      .then((resp) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
      }, (err) => next(err))
      .catch((err) => next(err));
  });

accountRouter.route('/:accountID')
  .options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
  .get(cors.cors, async (req, res, next) => {
      try {
        const accountStats = await AccountStats.findOne({ 'data.accountId': req.params.accountID });
        if (accountStats === null) {
          const err = new Error('Error while getting account');
          err.status = 404;
          err.message = 'Error while getting account';
          throw err;
        }
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(accountStats);
      } catch (err) {
        next(err);
      }
  })
  .post(cors.corsWithOptions, authenticate.verifyUser, async (req, res, next) => {
    try {
      const statsToAdd = await postPlayerSnapshots(req.params.accountID);
      const playerStats = await AccountStats.findOne({ 'data.accountId': req.params.accountID });

      if (!statsToAdd.success) {
        if (playerStats) {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          return res.json(playerStats);
        } else {
          const err = new Error('Account not found');
          err.status = 404;
          err.message = 'Account not found';
          throw err;
        }
      }

      if (!playerStats) {
        const createdPlayer = await AccountStats.create(statsToAdd);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        return res.json(createdPlayer);
      }

      const snapshotsDB = playerStats.data.snapshots;
      const snapshotToAdd = statsToAdd.data.snapshots[0];


      if (snapshotsDB.at(-1).lastBattleTime !== snapshotToAdd.lastBattleTime) {
        if (isSameDay(snapshotsDB.at(-1).lastBattleTime, snapshotToAdd.lastBattleTime)) {
          snapshotsDB.splice(-1, 1, snapshotToAdd);
        } else {
          snapshotsDB.push(snapshotToAdd);
        }

        await playerStats.save();
      }

      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.json(playerStats);
    } catch (err) {
      next(err);
    }
  })
  .put(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
    res.statusCode = 403;
    res.end(`PUT operation is not supported on /accounts/${req.params.accountID}`);
  })
  .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Accounts.findOne({ 'user': req.user._id })
      .then((account) => {
        const index = account.userAccounts.findIndex((acc) => (
          acc.account_id.toString() === req.params.accountID
        ));
        if (index !== -1) account.userAccounts.splice(index, 1);
        account.save()
          .then((acc) => {
            Accounts.findById(acc._id).populate('user');
          });
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(account);
      }, (err) => next(err))
      .catch((err) => next(err));
  });

module.exports = accountRouter;
