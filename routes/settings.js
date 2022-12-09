'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const authenticate = require('../authenticate');
const cors = require('./cors');

const Settings = require('../models/settings');
const settingsRouter = express.Router();
settingsRouter.use(bodyParser.json());

settingsRouter.route('/')
  .options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
  .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    Settings.find({'user': req.user._id})
        .populate('user')
        .then((settings) => {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.json(settings);
        }, (err) => next(err))
      .catch((err) => next(err));
  })
  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Settings.findOne({'user': req.user._id})
      .then((settings) => {
        if (!settings) {
          Settings.create(req.body)
            .then((settings) => {
              settings.user = req.user._id;
              settings.save();
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.json(settings);
            })
        } else {
          Settings.findOneAndUpdate({'user': req.user._id}, req.body, { new: true }, (err, data) => {
            if (err) {
              const err = new Error('Error while getting info');
              err.status = 401;
              return next(err);
            } else {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(data);
            }
          })
        }
      }, (err) => next(err))
      .catch((err) => next(err));
  })
  .put(cors.corsWithOptions, (req, res) => {
    res.statusCode = 403;
    res.end('PUT operation is not supported on /settings');
  })
  .delete(cors.corsWithOptions, (req, res, next) => {
    res.statusCode = 403;
    res.end('DELETE operation is not supported on /settings');
  });

  module.exports = settingsRouter;