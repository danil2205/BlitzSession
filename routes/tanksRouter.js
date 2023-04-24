'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('./cors');
const getListTanks = require('../utils/wargaming');

const tanksRouter = express.Router();
tanksRouter.use(bodyParser.json());

tanksRouter.route('/')
  .options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
  .get(cors.cors, async (req, res) => res.json(await getListTanks()));

module.exports = tanksRouter;