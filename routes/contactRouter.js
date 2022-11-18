'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const authenticate = require('../authenticate');
const cors = require('./cors');

const Feedback = require('../models/feedback');
const contactRouter = express.Router();
contactRouter.use(bodyParser.json());

contactRouter.route('/')
  .options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
  .get(cors.cors, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Feedback.find({}, (err, feedbacks) => {
        if (err) throw err;
        res.json(feedbacks);
      });
  })
  .post(cors.corsWithOptions, (req, res, next) => {
    Feedback.create(req.body)
    .then((feedback) => {
        console.log('Feedback Created ', feedback);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(feedback);
    }, (err) => next(err))
    .catch((err) => next(err));
  })
  .put(cors.corsWithOptions, (req, res) => {
    res.statusCode = 403;
    res.end('PUT operation is not supported on /contact');
  })
  .delete(cors.corsWithOptions, (req, res, next) => {
    res.statusCode = 403;
    res.end('DELETE operation is not supported on /contact');
  });

  module.exports = contactRouter;