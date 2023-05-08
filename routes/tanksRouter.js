'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const authenticate = require('../authenticate');
const cors = require('./cors');
const { getListTanks, getTanksStats, postPlayerSnapshots, } = require('../utils/wargaming.js');
const { isSameDay } = require('../utils/time');
const PlayerStats = require('../models/playerStats.js');

const tanksRouter = express.Router();
tanksRouter.use(bodyParser.json());

tanksRouter.route('/')
  .options(cors.corsWithOptions, (_, res) => { res.sendStatus(200); })
  .get(cors.cors, async (_, res) => res.json(await getListTanks()));

tanksRouter.route('/:accountID')
  .options(cors.corsWithOptions, (_, res) => { res.sendStatus(200); })
  .get(cors.cors, async (req, res) => res.json(await getTanksStats(req.params.accountID)))
  .post(cors.corsWithOptions, authenticate.verifyUser, async (req, res, next) => {
    const statsToAdd = await postPlayerSnapshots(req.params.accountID);
    PlayerStats.findOne({ 'user': req.user._id })
      .then((playerStats) => {
        if (!playerStats) {
          PlayerStats.create(statsToAdd)
            .then((player) => {
              player.user = req.user._id;
              player.save();
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.json(player);
            });
        } else {
          const snapshotsDB = playerStats.data.snapshots;
          const snapshotToAdd = statsToAdd.data.snapshots[0];
          if (snapshotsDB.at(-1).lastBattleTime !== snapshotToAdd.lastBattleTime) {
            isSameDay(snapshotsDB.at(-1).lastBattleTime, snapshotToAdd.lastBattleTime) ? 
              snapshotsDB.splice(-1, 1, snapshotToAdd) : 
              snapshotsDB.push(snapshotToAdd);

            playerStats.save();
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(playerStats);
          } else {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(playerStats);
          }
        }
      });
  });

module.exports = tanksRouter;