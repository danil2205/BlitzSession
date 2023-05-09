'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const authenticate = require('../authenticate');
const cors = require('./cors');
const { getListTanks, postTanksSnapshots } = require('../utils/wargaming.js');
const { isSameDay } = require('../utils/time');
const TankStats = require('../models/tankStats.js');

const tanksRouter = express.Router();
tanksRouter.use(bodyParser.json());

tanksRouter.route('/')
  .options(cors.corsWithOptions, (_, res) => { res.sendStatus(200); })
  .get(cors.cors, async (_, res) => res.json(await getListTanks()));

tanksRouter.route('/:accountID')
  .options(cors.corsWithOptions, (_, res) => { res.sendStatus(200); })
  .get(cors.cors, async (req, res) => res.json(await postTanksSnapshots(req.params.accountID)))
  .post(cors.corsWithOptions, authenticate.verifyUser, async (req, res, next) => {
    const statsToAdd = await postTanksSnapshots(req.params.accountID);
    statsToAdd.data = statsToAdd.data.filter((tankStats) => tankStats.tank_id);
    TankStats.findOne({ 'account_id': req.params.accountID })
      .then((tankStats) => {
        if (!tankStats) {
          TankStats.create(statsToAdd)
            .then((tanks) => {
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.json(tanks);
            });
        } else {
          const dataFromDB = tankStats.data;
          tankStats.data.map((tankFromDB) => {
            const snapshotToAdd = statsToAdd.data.find((tankFromStats) => tankFromStats.tank_id === tankFromDB.tank_id);
            if (!snapshotToAdd) return;
            if (snapshotToAdd.snapshots[0].lastBattleTime !== tankFromDB.snapshots.at(-1).lastBattleTime) {
              isSameDay(tankFromDB.snapshots.at(-1).lastBattleTime, snapshotToAdd.snapshots[0].lastBattleTime) ? 
              tankFromDB.snapshots.splice(-1, 1, snapshotToAdd.snapshots[0]) : 
              tankFromDB.snapshots.push(snapshotToAdd.snapshots[0]);
            } 
          });
          tankStats.save();
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.json(tankStats);
        }
      });
  });

module.exports = tanksRouter;