'use strict';

const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const AccountStats = require('../models/accountStats.js');
const Accounts = require('../models/accounts.js');
const User = require('../models/user.js');
const accountRouter = require('../routes/accountRouter.js');
const userRouter = require('../routes/users.js');
const mongoose = require('mongoose');
const { postPlayerSnapshots } = require('../utils/wargaming.js');
require('dotenv').config();

const app = express();
app.use(bodyParser.json());
app.use('/accounts', accountRouter);
app.use('/users', userRouter);

jest.mock('../utils/wargaming.js', () => ({
  postPlayerSnapshots: jest.fn(),
}));


describe('Account Router', () => {
  let bearerToken;
  beforeAll(async () => {
    const url = process.env.mongoUrlTest;
    mongoose.connect(url, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const newUser = {
      username: 'testuser6',
      password: 'testpassword',
    };

    const response = await request(app)
      .post('/users/signup')
      .send(newUser);

    bearerToken = response.body.token;
  });

  afterAll(async () => {
    await AccountStats.deleteMany();
    await Accounts.deleteMany();
    await User.findOneAndDelete({ username: 'testuser6' });
    await mongoose.connection.close();
  });

  describe('POST /accounts', () => {
    it('should create a new user account', async () => {
      const newAccount = {
        account_id: 594859325,
        nickname: 'Danil2205_',
        access_token: 'blabalbal',
        expires_at: 1685568249,
      };
  
      const res = await request(app)
        .post('/accounts')
        .set('Authorization', `Bearer ${bearerToken}`)
        .send(newAccount);
  
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('user');
      expect(res.body).toHaveProperty('userAccounts');
      expect(res.body.userAccounts.map(({ _id, ...rest }) => rest)).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            access_token: newAccount.access_token,
            account_id: newAccount.account_id,
            expires_at: newAccount.expires_at,
            nickname: newAccount.nickname,
          }),
        ])
      );
      
    });
  
    it('should return an error if the account ID is null', async () => {
      const newAccount = {
        account_id: null,
        nickname: 'D_W_S',
        access_token: 'sdasddf',
        expires_at: 1685568249,
      };
  
      try {
        const res = await request(app)
        .post('/accounts')
        .set('Authorization', `Bearer ${bearerToken}`)
        .send(newAccount);
      } catch (err) {
        expect(err.status).toBe(401);
        expect(err.message).toBe('Error while getting info');
      }
    });
  });
  

  describe('GET /accounts', () => {
    it('should return user accounts for the authenticated user', async () => {
      const res = await request(app)
        .get('/accounts')
        .set('Authorization', `Bearer ${bearerToken}`)
        .send();
  
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('length');
      expect(res.body).toEqual(expect.arrayContaining([]));
      expect(res.body[0]).toHaveProperty('user');
      expect(res.body[0]).toHaveProperty('userAccounts');
    });
  
    it('should return an error if the user is not authenticated', async () => {
      try {
        await request(app).get('/accounts');
      } catch (err) {
        expect(err.status).toBe(401);
        expect(err.message).toBe('Authentication failed');
      }
    });
  });
  
  describe('GET /accounts/:accountID', () => {
    it('should return the account stats for a valid account ID', async () => {
      const accountId = 594859325;
      const accountStatsData = {
        data: {
          createdAt: 123456789,
          name: 'TestAccount',
          accountId: accountId,
          snapshots: [{
            lastBattleTime: 1682530171,
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
            mastery: {
              markOfMastery: 2,
              markOfMasteryI: 2,
              markOfMasteryII: 2,
              markOfMasteryIII: 2,
            },
          }]
        },
        success: true
      };
      
      await AccountStats.create(accountStatsData);

      const res = await request(app)
        .get(`/accounts/${accountId}`)
        .expect(200);

      expect(res.body.data).toEqual(accountStatsData.data);
    });

    it('should return an error for an invalid account ID', async () => {
      const invalidAccountId = 1;
      try {
        const res = await request(app).get(`/accounts/${invalidAccountId}`);
      } catch (err) {
        expect(err.status).toBe(404);
        expect(err.message).toBe('Error while getting account');
      }
    });
  });

  describe('POST /accounts/:accountID', () => {
    it('should add a new snapshot to the account stats for a valid account ID', async () => {
      const accountId = 594859325;
      const snapshotToAdd = {
        success: true,
        data: {
          snapshots: [{
            lastBattleTime: 1685671188,
            regular: {
              battles: 1337,
              wins: 1336,
              damageDealt: 222
            },
            rating: {
              battles: 228,
              wins: 1337,
              damageDealt: 2205
            },
            mastery: {
              markOfMastery: 20,
              markOfMasteryI: 123,
              markOfMasteryII: 200,
              markOfMasteryIII: 1024,
            }
          }]
        }
      };
      postPlayerSnapshots.mockResolvedValue(snapshotToAdd);

      const res = await request(app)
      .post(`/accounts/${accountId}`)
      .set('Authorization', `Bearer ${bearerToken}`)
      .send()
      .expect(200);

      const updatedAccountStats = res.body.data;
      console.dir(updatedAccountStats, { depth: null })
      expect(updatedAccountStats.snapshots.at(-1)).toEqual(snapshotToAdd.data.snapshots[0]);
    });

    it('should return an error for an invalid account ID', async () => {
      const invalidAccountId = 123; // Replace with an invalid account ID
      const mockResolvedValue = { success: false, data: {} };
      postPlayerSnapshots.mockResolvedValue(mockResolvedValue);

      try {
        await request(app)
        .post(`/accounts/${invalidAccountId}`)
        .set('Authorization', `Bearer ${bearerToken}`)
        .send()
        .expect(404);
      } catch (err) {
        expect(err.message).toBe('Account not found');
      }
    });
  });
});
