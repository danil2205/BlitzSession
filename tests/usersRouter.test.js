'use strict';

const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const passport = require('passport');
const User = require('../models/user.js');
const userRouter = require('../routes/users.js');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
app.use(bodyParser.json());
app.use(passport.initialize());

app.use('/users', userRouter);

describe('User Router', () => {
  let bearerToken;
  beforeAll(async () => {
    const url = process.env.mongoUrlTest;
    mongoose.connect(url, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  });

  afterAll(async () => {
    await User.findOneAndDelete({ username: 'testuser1' });
    await mongoose.connection.close();
  });

  describe('GET /users', () => {
    it('should return all users', async () => {
      const response = await request(app).get('/users');
      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(0);
    });
  });

  describe('POST /users/signup', () => {
    it('should register a new user and return a token', async () => {
      const newUser = {
        username: 'testuser1',
        password: 'testpassword',
        firstName: 'John',
        lastName: 'Doe'
      };

      const response = await request(app)
        .post('/users/signup')
        .send(newUser);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('token');
    });
  });

  describe('POST /users/login', () => {
    it('should log in a user and return a token', async () => {
      const credentials = {
        username: 'testuser1',
        password: 'testpassword'
      };

      const response = await request(app)
        .post('/users/login')
        .send(credentials);

      bearerToken = response.body.token;

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('token');
    });
  });

  describe('GET /users/checkJWTToken', () => {
    it('should check the validity of a JWT token', async () => {
      const response = await request(app)
        .get('/users/checkJWTToken')
        .set('Authorization', `Bearer ${bearerToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('status', 'JWT valid!');
    });

    it('should return 401 if the JWT token is invalid', async () => {
      const token = 'invalid_token';

      const response = await request(app)
        .get('/users/checkJWTToken')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('status', 'JWT invalid!');
    });
  });
});
