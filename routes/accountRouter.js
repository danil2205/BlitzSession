'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const authenticate = require('../authenticate');
const cors = require('./cors');

const Accounts = require('../models/accounts');
const accountRouter = express.Router();
accountRouter.use(bodyParser.json());

accountRouter.route('/')
  .options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
  .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    Accounts.find({'user': req.user._id})
        .populate('user')
        .then((accounts) => {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.json(accounts);
        }, (err) => next(err))
      .catch((err) => next(err));
  })
  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    if (req.body.account_id === null) {
      const err = new Error('Error while getting info');
      err.status = 401;
      return next(err);
    }
    Accounts.findOne({'user': req.user._id})
      .then((accounts) => {
        if (!accounts) {
          Accounts.create({})
            .then((account) => {
              account.user = req.user._id;
              account.userAccounts.push(req.body);
              account.save()
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.json(account);
            });
        } else {
          if (accounts.userAccounts.some((account) => account.account_id.toString() === req.body.account_id)) {
            const err = new Error('You already have this account!');
            err.status = 401;
            return next(err);
          } else {
            accounts.userAccounts.push(req.body);
            accounts.save();
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(accounts);
          }
        }
      });
  })
  .put(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
    res.statusCode = 403;
    res.end('PUT operation is not supported on /accounts');
  })
  .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Accounts.remove({'user': req.user._id})
      .then((resp) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
      }, (err) => next(err))
      .catch((err) => next(err));
  });

accountRouter.route('/:accountID')
  .options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
  .get(cors.cors, (req, res, next) => {
    res.statusCode = 403;
    res.end(`GET operation is not supported on /accounts/${req.params.accountID}`);
  })
  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end(`POST operation is not supported on /accounts/${req.params.accountID}`);
  })
  .put(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
    res.statusCode = 403;
    res.end(`PUT operation is not supported on /accounts/${req.params.accountID}`);
  })
  .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Accounts.findOne({'user': req.user._id})
      .then((account) => {
        const index = account.userAccounts.findIndex((acc) => {
          return acc.account_id.toString() === req.params.accountID;
        });
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
