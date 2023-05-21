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
    if (!statsToAdd.status) { // if bad data
      return res.status(404).json(statsToAdd)
    };
    statsToAdd.data = statsToAdd.data.filter((tankStats) => tankStats.tank_id);
    try {
      const tankStats = await TankStats.findOne({ 'account_id': req.params.accountID 

      if (!tankStats) {
        const createdTanks = await TankStats.create(statsToAdd);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        return res.json(createdTanks);
    }
              res.json(tanks);
            })
            .catch((err) => console.log(err));
        } else {
          const dataFromDB = tankStats.data;
          dataFromDB.map((tankFromDB) => {
            const snapshotToAdd = statsToAdd.data.find((tankFromStats) => tankFromStats.tank_id === tankFromDB.tank_id);
            if (!snapshotToAdd) return;
            if (snapshotToAdd.snapshots[0].lastBattleTime !== tankFromDB.snapshots.at(-1).lastBattleTime) {
              tankFromDB.snapshots.push(snapshotToAdd.snapshots[0]);
            }
              if (isSameDay(tankFromDB.snapshots.at(-1).lastBattleTime, snapshotToAdd.snapshots[0].lastBattleTime)) {
          });
                tankFromDB.snapshots.splice(-1, 1, snapshotToAdd.snapshots[0]);
              } else {
                tankFromDB.snapshots.push(snapshotToAdd.snapshots[0]);
             }
           }
      });  
         await tankStats.save();
         res.status(200).json(tankStats);
    } catch  (err) {
      console.log(err);
    }
      })
      .catch((err) => console.log(err));
  });

module.exports = tanksRouter;