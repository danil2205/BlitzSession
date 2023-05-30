'use strict';

const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const User = require('../models/user.js');
const Settings = require('../models/settings.js');
const settingsRouter = require('../routes/settings.js');
const userRouter = require('../routes/users.js');
require('dotenv').config();

const app = express();
app.use(bodyParser.json());
app.use('/settings', settingsRouter);
app.use('/users', userRouter);

describe('Settings Router', () => {
  let bearerToken;

  beforeAll(async () => {
    const url = process.env.mongoUrlTest;
    mongoose.connect(url, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const newUser = {
      username: 'testuser2',
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
    await User.findOneAndDelete({ username: 'testuser2' });
    await Settings.deleteMany();
    await mongoose.connection.close();
  });

  describe('GET /settings', () => {
    it('should return the settings of the authenticated user', async () => {
      const response = await request(app)
        .get('/settings')
        .set('Authorization', `Bearer ${bearerToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(0);
    });

    it('should return 401 if user is not authenticated', async () => {
      const response = await request(app)
        .get('/settings');

      expect(response.status).toBe(401);
    });
  });

  describe('POST /settings', () => {
    it('should create new settings for the authenticated user', async () => {
      const newSettings = {
        alignment: 'left',
        backgroundColor: '#FFFFFF',
        textColor: '#000000',
        fontSize: '12px',
        battleText: 'Battle',
        damageText: 'Damage',
        winrateText: 'Win Rate',
        fontFamily: 'Arial',
      };

      const response = await request(app)
        .post('/settings')
        .set('Authorization', `Bearer ${bearerToken}`)
        .send(newSettings);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('alignment', 'left');
    });

    it('should update existing settings for the authenticated user', async () => {
      const updatedSettings = {
        alignment: 'right',
        backgroundColor: '#000000',
        textColor: '#FFFFFF',
        fontSize: '14px',
        battleText: 'Battle',
        damageText: 'Damage',
        winrateText: 'Win Rate',
        fontFamily: 'Arial',
      };

      const response = await request(app)
        .post('/settings')
        .set('Authorization', `Bearer ${bearerToken}`)
        .send(updatedSettings);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('alignment', 'right');
    });

    it('should return 401 if user is not authenticated', async () => {
      const newSettings = {
        alignment: 'left',
        backgroundColor: '#FFFFFF',
        textColor: '#000000',
        fontSize: '12px',
        battleText: 'Battle',
        damageText: 'Damage',
        winrateText: 'Win Rate',
        fontFamily: 'Arial',
      };

      const response = await request(app)
        .post('/settings')
        .send(newSettings);

      expect(response.status).toBe(401);
    });
  });

  describe('PUT /settings', () => {
    it('should return 403 (Forbidden)', async () => {
      const response = await request(app)
        .put('/settings')
        .set('Authorization', `Bearer ${bearerToken}`);

      expect(response.status).toBe(403);
    });
  });

  describe('DELETE /settings', () => {
    it('should return 403 (Forbidden)', async () => {
      const response = await request(app)
        .delete('/settings')
        .set('Authorization', `Bearer ${bearerToken}`);

      expect(response.status).toBe(403);
    });
  });
});
