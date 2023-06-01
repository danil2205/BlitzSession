'use strict';

const request = require('supertest');
const express = require('express');
const serverRouter = require('../routes/serverRouter.js');
const { fetchAllPlayerStats } = require('../utils/serverStatistic.js');
const ServerStats = require('../models/serverStats.js');
const User = require('../models/user.js');
const userRouter = require('../routes/users.js');
const mongoose = require('mongoose');
require('dotenv').config();

jest.mock('../utils/serverStatistic.js', () => ({
  fetchAllPlayerStats: jest.fn(),
}));

const app = express();
app.use(express.json());
app.use('/server', serverRouter);
app.use('/users', userRouter);

describe('Server Router', () => {
  let bearerToken;
  beforeAll(async () => {
    const url = process.env.mongoUrlTest;
    mongoose.connect(url, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    const newUser = {
      username: 'testuser5',
      password: 'testpassword',
    };
    const response = await request(app)
      .post('/users/signup')
      .send(newUser);

    const user = await User.findOne({ 'username': newUser.username });
    user.admin = true;
    user.save();
    bearerToken = response.body.token;
  });
  afterAll(async () => {
    await ServerStats.deleteMany();
    await User.findOneAndDelete({ username: 'testuser5' });
    await mongoose.connection.close();
  });

  describe('POST /server', () => {
    it('should update server stats', async () => {
      const mockServerStats = { 
        account: {
          mastery: {
            markOfMastery: 2,
            markOfMasteryI: 2,
            markOfMasteryII: 2,
            markOfMasteryIII: 2,
          },
          regular: {
            battles: 228,
            wins: 1337,
            damageDealt: 2205
          },
          rating: {
            battles: 228,
            wins: 1337,
            damageDealt: 2205
          },
        }, 
        tanks: [
          {
            wotId: 322,
            battleLifeTime: 121244,
            regular: {
              battles: 228,
              wins: 1337,
              damageDealt: 2205
            },
            mastery: {
              markOfMastery: 2,
              markOfMasteryI: 2,
              markOfMasteryII: 2,
              markOfMasteryIII: 2,
            },
          }
        ] 
      };
      fetchAllPlayerStats.mockResolvedValue(mockServerStats);

      const res = await request(app)
        .post('/server')
        .set('Authorization', `Bearer ${bearerToken}`)
        .send();

      expect(res.statusCode).toBe(200);
      expect(res.headers['content-type']).toMatch('application/json');
      expect(res.body.account).toEqual(mockServerStats.account);
      expect(res.body.tanks).toEqual(mockServerStats.tanks);
    });

    it('should handle unauthorized access', async () => {
      const res = await request(app).post('/server');
      expect(res.statusCode).toBe(401);
    });

    it('should handle errors', async () => {
      const errorMessage = 'Failed to update server stats';
      fetchAllPlayerStats.mockRejectedValue(new Error(errorMessage));
      try {
        const res = await request(app)
        .post('/server')
        .set('Authorization', `Bearer ${bearerToken}`)
        .send();
      expect(res.statusCode).toBe(500);
      } catch (err) {
        expect(err.message).toBe('Failed to update server stats');
      }
    });
  });

  describe('GET /server', () => {
    it('should return server stats', async () => {
      const mockServerStats = [{ 
        account: {
          mastery: {
            markOfMastery: 2,
            markOfMasteryI: 2,
            markOfMasteryII: 2,
            markOfMasteryIII: 2,
          },
          regular: {
            battles: 228,
            wins: 1337,
            damageDealt: 2205
          },
          rating: {
            battles: 228,
            wins: 1337,
            damageDealt: 2205
          },
        }, 
        tanks: [
          {
            wotId: 322,
            battleLifeTime: 121244,
            regular: {
              battles: 228,
              wins: 1337,
              damageDealt: 2205
            },
            mastery: {
              markOfMastery: 2,
              markOfMasteryI: 2,
              markOfMasteryII: 2,
              markOfMasteryIII: 2,
            },
          }
        ] 
      }];
      fetchAllPlayerStats.mockResolvedValue(mockServerStats);

      const res = await request(app).get('/server');
      expect(res.statusCode).toBe(200);
      expect(res.headers['content-type']).toMatch('application/json');
      expect(res.body.account).toEqual(mockServerStats.account);
      expect(res.body.tanks).toEqual(mockServerStats.tanks);
    });

    it('should handle errors', async () => {
      jest.spyOn(ServerStats, 'find').mockRejectedValue(new Error('Failed to retrieve server stats'));
      try {
        const res = await request(app).get('/server');
        expect(res.statusCode).toBe(500);
      } catch (err) {
        expect(err.message).toBe('Failed to retrieve server stats');
      }
    });
  });
});
