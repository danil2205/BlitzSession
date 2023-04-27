'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('./cors');
const { getListTanks, getTanksStats } = require('../utils/wargaming');

const tanksRouter = express.Router();
tanksRouter.use(bodyParser.json());

tanksRouter.route('/')
  .options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
  .get(cors.cors, async (req, res) => res.json(await getListTanks()));

tanksRouter.route('/:accountID')
  .options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
  .get(cors.cors, async (req, res) => res.json(await getTanksStats(req.params.accountID)));

module.exports = tanksRouter;