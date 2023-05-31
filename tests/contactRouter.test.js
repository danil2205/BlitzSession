'use strict';

const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const Feedback = require('../models/feedback.js');
const User = require('../models/user.js');
const contactRouter = require('../routes/contactRouter.js');
const userRouter = require('../routes/users.js');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
app.use(bodyParser.json());
app.use('/contact', contactRouter);
app.use('/users', userRouter);

describe('Contact Router', () => {
  let bearerToken;
  beforeAll(async () => {
    const url = process.env.mongoUrlTest;
    mongoose.connect(url, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const newUser = {
      username: 'testuser3',
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
    await Feedback.deleteMany();
    await User.findOneAndDelete({ username: 'testuser3' });
    await mongoose.connection.close();
  });

  describe('GET /contact', () => {
    it('should return 403 if user is not an admin', async () => {
      const response = await request(app)
        .get('/contact')
        .set('Authorization', `Bearer ${bearerToken}`);

      expect(response.status).toBe(403);
    });
  });

  describe('POST /contact', () => {
    it('should create a new feedback', async () => {
      const newFeedback = {
        firstname: 'John',
        lastname: 'Doe',
        telnum: 123456789,
        email: 'johndoe@example.com',
        agree: true,
        contactType: 'email',
        message: 'Test message',
      };

      const response = await request(app)
        .post('/contact')
        .send(newFeedback);

      expect(response.status).toBe(200);
    });
  });

  describe('PUT /contact', () => {
    it('should return 403', async () => {
      const response = await request(app).put('/contact');
      expect(response.status).toBe(403);
    });
  });

  describe('DELETE /contact', () => {
    it('should return 403', async () => {
      const response = await request(app).delete('/contact');
      expect(response.status).toBe(403);
    });
  });
});
