'use strict';

const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const User = require('../models/user.js');
const Settings = require('../models/settings.js');
const settingsRouter = require('../routes/settings.js');
const userRouter = require('../routes/users.js');
const { authenticate } = require('../authenticate');
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
    await User.deleteMany();
    await Settings.deleteMany();
    await mongoose.connection.close();
  });

  describe('GET /settings', () => {
    it('should return the settings of the authenticated user', async () => {
      const response = await request(app)
        .get('/settings')
        .set('Authorization', `Bearer ${bearerToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(0); // Adjust the expected length based on your test data
      // Add more assertions as needed
    });

    it('should return 401 if user is not authenticated', async () => {
      const response = await request(app)
        .get('/settings');

      expect(response.status).toBe(401);
      // Add more assertions as needed
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
      // Add more assertions as needed
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
      // Add more assertions as needed
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
      // Add more assertions as needed
    });
  });

  describe('PUT /settings', () => {
    it('should return 403 (Forbidden)', async () => {
      const response = await request(app)
        .put('/settings')
        .set('Authorization', `Bearer ${bearerToken}`);

      expect(response.status).toBe(403);
      // Add more assertions as needed
    });
  });

  describe('DELETE /settings', () => {
    it('should return 403 (Forbidden)', async () => {
      const response = await request(app)
        .delete('/settings')
        .set('Authorization', `Bearer ${bearerToken}`);

      expect(response.status).toBe(403);
      // Add more assertions as needed
    });
  });
});
