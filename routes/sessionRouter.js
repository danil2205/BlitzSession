'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const authenticate = require('../authenticate');
const cors = require('./cors');

const Session = require('../models/session');
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
  })
  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Session.findOne({'user': req.user._id})
      .then((session) => {
        if (!session) {
          Session.create(req.body)
            .then((session) => {
              session.user = req.user._id;
              session.save();
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.json(session);
            })
        } else {
          Session.findOneAndUpdate({'user': req.user._id}, req.body, (err, data) => {
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
    res.end('PUT operation is not supported on /session');
  })
  .delete(cors.corsWithOptions, (req, res, next) => {
    res.statusCode = 403;
    res.end('DELETE operation is not supported on /session');
  });

module.exports = sessionRouter;
