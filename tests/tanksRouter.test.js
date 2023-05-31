'use strict';

const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const TankStats = require('../models/tankStats');
const User = require('../models/user.js');
const tanksRouter = require('../routes/tanksRouter.js');
const userRouter = require('../routes/users.js');
const mongoose = require('mongoose');
const { getListTanks, postTanksSnapshots } = require('../utils/wargaming.js');
require('dotenv').config();

const app = express();
app.use(bodyParser.json());
app.use('/tanks', tanksRouter);
app.use('/users', userRouter);

jest.mock('../utils/wargaming.js', () => ({
  getListTanks: jest.fn(),
  postTanksSnapshots: jest.fn(),
}));

describe('Tanks Router', () => {
  let bearerToken;
  beforeAll(async () => {
    const url = process.env.mongoUrlTest;
    mongoose.connect(url, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    const newUser = {
      username: 'testuser4',
      password: 'testpassword',
      firstName: 'John',
      lastName: 'Doe'
    };
    const response = await request(app)
      .post('/users/signup')
      .send(newUser);
    bearerToken = response.body.token;
  });
  afterAll(async () => {
    await TankStats.deleteMany();
    await User.findOneAndDelete({ username: 'testuser4' });
    await mongoose.connection.close();
  });

  describe('GET /tanks', () => {
    it('should return the list of tanks', async () => {
      const mockTankList = [{ id: 1, name: 'Tank 1' }, { id: 2, name: 'Tank 2' }];
      getListTanks.mockResolvedValue(mockTankList);

      const response = await request(app).get('/tanks');
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockTankList);
    });

    it('should handle errors and return an error response', async () => {
      getListTanks.mockRejectedValue(new Error('Failed to fetch tank list'));

      const response = await request(app).get('/tanks');
      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Failed to fetch tank list');
    });
  });

  describe('GET /tanks/:accountID', () => {
    it('should return the tank snapshots for the given account ID', async () => {
      const accountID = 123456;
      const mockResponse = { status: true, account_id: accountID, data: [{ id: 1, name: 'Tank 1' }] };
      postTanksSnapshots.mockResolvedValue(mockResponse);

      const response = await request(app).get(`/tanks/${accountID}`);
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockResponse);
    });

    it('should return a 404 status if the tank snapshots for the given account ID are not found', async () => {
      const accountID = 999999;
      const mockResponse = { status: false, account_id: accountID, data: [] };
      postTanksSnapshots.mockResolvedValue(mockResponse);

      const response = await request(app).get(`/tanks/${accountID}`);

      expect(response.status).toBe(404);
      expect(response.body).toEqual(mockResponse);
    });

    it('should handle errors and return an error response', async () => {
      const accountID = 123456;
      postTanksSnapshots.mockRejectedValue(new Error('Failed to fetch tank snapshots'));

      const response = await request(app).get(`/tanks/${accountID}`);
      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Failed to fetch tank snapshots');
    });
  });

  describe('POST /tanks/:accountID', () => {
    it('should add tank snapshots for the given account ID', async () => {
      const accountID = 123456;
      const mockResponse = { status: true, account_id: accountID, data: [
        {
          hp: 1337,
          image: 'tank1.img',
          isPremium: true,
          name: 'llumiss-228',
          snapshots: [{ battles: 1, wins: 0, lastBattleTime: 1685290763, losses: 1 }],
          tank_id: 322,
          tier: 9,
          type: 'heavyTank'
        }
      ] };
      postTanksSnapshots.mockResolvedValue(mockResponse);

      const response = await request(app)
        .post(`/tanks/${accountID}`)
        .set('Authorization', `Bearer ${bearerToken}`)
        .send();

      expect(response.status).toBe(200);
      expect(response.body.account_id).toEqual(mockResponse.account_id);

      const tankStats = await TankStats.findOne({ account_id: accountID });
      expect(tankStats).toBeDefined();
      expect(tankStats.data.length).toBe(1);
      expect(tankStats.data[0].tank_id).toBe(322);
    });

    it('should update existing tank snapshots for the given account ID', async () => {
      const accountID = 123456;
      const mockResponse = { status: true, account_id: accountID, data: [
        {
          hp: 1337,
          image: 'tank1.img',
          isPremium: true,
          name: 'llumiss-228',
          snapshots: [{ battles: 100, wins: 98, losses: 2, lastBattleTime: 1685490763 }],
          tank_id: 322,
          tier: 9,
          type: 'heavyTank'
        }
      ] };
      postTanksSnapshots.mockResolvedValue(mockResponse);

      const initialTankStats = {
        account_id: accountID,
        data: [{
          hp: 1337,
          image: 'tank1.img',
          isPremium: true,
          name: 'llumiss-228',
          snapshots: [{ battles: 1, wins: 0, lastBattleTime: 1685290763, losses: 1 }],
          tank_id: 322,
          tier: 9,
          type: 'heavyTank'
        }],
        status: true,
      };
      await TankStats.create(initialTankStats);

      const response = await request(app)
        .post(`/tanks/${accountID}`)
        .set('Authorization', `Bearer ${bearerToken}`)
        .send();

      expect(response.status).toBe(200);

      const tankStats = await TankStats.findOne({ account_id: accountID });
      expect(tankStats).toBeDefined();
      expect(tankStats.data.length).toBe(1);
      expect(tankStats.data[0].tank_id).toBe(322);
      expect(tankStats.data[0].snapshots.length).toBe(2);
      expect(tankStats.data[0].snapshots[0].lastBattleTime).toBe(1685290763);
    });

    it('should handle errors and return an error response', async () => {
      const accountID = 123456;
      postTanksSnapshots.mockRejectedValue(new Error('Failed to fetch tank snapshots'));

      const response = await request(app)
        .post(`/tanks/${accountID}`)
        .set('Authorization', `Bearer ${bearerToken}`)
        .send();

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Failed to fetch tank snapshots');
    });
  });
});
