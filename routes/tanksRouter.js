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
  .get(cors.cors, async (_, res) => {
    try {
      res.json(await getListTanks());
    } catch (err) {
      console.error(err);
      res.status(404).json({ error: 'Failed to fetch tank list' });
    }
  });

tanksRouter.route('/:accountID')
  .options(cors.corsWithOptions, (_, res) => { res.sendStatus(200); })
  .get(cors.cors, async (req, res) => {
    try {
      const tankSnapshots = await postTanksSnapshots(req.params.accountID);
      if (tankSnapshots.status) {
        res.status(200).json(tankSnapshots);
      } else {
        res.status(404).json(tankSnapshots);
      }
    } catch (err) {
      console.error(err);
      res.status(404).json({ error: 'Failed to fetch tank snapshots' });
    }
  })
  .post(cors.corsWithOptions, authenticate.verifyUser, async (req, res, next) => {
    try {
      const statsToAdd = await postTanksSnapshots(req.params.accountID);
      if (!statsToAdd.status) { // if bad data
        return res.status(404).json(statsToAdd)
      };
      statsToAdd.data = statsToAdd.data.filter((tankStats) => tankStats.tank_id);

      const tankStats = await TankStats.findOne({ 'account_id': req.params.accountID });

      if (!tankStats) {
        const createdTanks = await TankStats.create(statsToAdd);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        return res.json(createdTanks);
      }
      const dataFromDB = tankStats.data;
      statsToAdd.data.map((tankFromStats) => {
        const snapshotsFromDB = dataFromDB.find((tankFromDB) => tankFromStats.tank_id === tankFromDB.tank_id);
        if (!snapshotsFromDB) {
          dataFromDB.push(tankFromStats);
          return;
        }

        if (tankFromStats.snapshots[0].lastBattleTime !== snapshotsFromDB.snapshots.at(-1).lastBattleTime) {
          if (isSameDay(snapshotsFromDB.snapshots.at(-1).lastBattleTime, tankFromStats.snapshots[0].lastBattleTime)) {
            snapshotsFromDB.snapshots.splice(-1, 1, tankFromStats.snapshots[0]);
          } else {
            snapshotsFromDB.snapshots.push(tankFromStats.snapshots[0]);
          }
        }
      });

      await tankStats.save();
      res.status(200).json(tankStats);
    } catch (err) {
      console.error(err);
      res.status(404).json({ error: 'Failed to fetch tank snapshots' });
    }
  });

module.exports = tanksRouter;