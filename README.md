# BlitzSession

This project was done for the second course.<br />
BlitzSession is a website dedicated to the popular game World of Tanks Blitz, designed to provide players with a comprehensive tool to analyze their performance and enhance their gameplay experience. With detailed statistics, customizable filters, and comparative analysis against server averages, BlitzSession empowers players to make informed decisions and improve their skills.

## Motivation
World of Tanks Blitz boasts a massive fan base, and i want to make website that offers valuable insights and data analysis for players. As avid gamers ourselves, I understand the significance of statistics in shaping gameplay decisions, such as tank selection, performance improvement strategies, and issue identification. My motivation behind BlitzSession is to fill this gap and provide World of Tanks Blitz players with a user-friendly and feature-rich website to analyze their performance comprehensively

[Link on Frontend](https://github.com/danil2205/blitz-session-react)

[Design Document](https://docs.google.com/document/d/1Blprl62qVn8JEoNXtWzSsBnPYQ7XCCcmvsvOy5Jzq-c/edit)

## Download & Run
**You need to have installed NodeJS on your machine.**

1. Clone the repository
```bash
$ git clone https://github.com/danil2205/BlitzSession.git
```

2. Install all necessary packages

```bash
$ npm install
```
3. Run

```bash
$ npm start
```

4. Test

```bash
$ npm test
```

## API Endpoints

* GET /accounts: Retrieves a list of user's wargaming accounts.
* POST /accounts: Adds user's wargaming account to database.
* DELETE /accounts: Deletes user's account.
* GET /accounts/:accountID: Retrieves the stats of a specific wargaming account.
* POST /accounts/:accountID: Adds new stats of a specific wargaming account.
* DELETE /accounts/:accountID: Deletes user's wargaming account from database.

* GET /serverStatistic: Retrieves general server statistic of players in WoT Blitz.
* POST /serverStatistic: Adds general server statistic of players to database.

* GET /settings: Retrieves user's configuration of session widget.
* POST /settings: Adds user's configuration of session widget to database.

* GET /tanks: Retrieves list of all tanks in WoT Blitz.
* GET /tanks/:accountID: Retrieves user's tanks stats of specific wargaming account.
* POST /tanks/:accountID: Adds user's tanks stats of specific wargaming account to database.

* GET /users: Retrieves all users information.
* POST /users/signup: Register new user.
* POST /users/login: Authenticate a user.
* GET /users/checkJWTToken: Validating user's jwt token.

* GET /contact: Retrieves all feedbacks.
* POST /contact: Adds feedback to database.

## Сode reviews of my project

- [Code review №1](https://github.com/danil2205/blitz-session-react/pull/3) 
- [Code review №2](https://github.com/danil2205/blitz-session-react/pull/4) 
- [Code review №3](https://github.com/danil2205/BlitzSession/pull/1) 
- [Code review №4](https://github.com/danil2205/BlitzSession/pull/2) 

## My code reviews

- [Code review №1](https://github.com/vladimirvikulin/To-Do-List/pull/4) 
- [Code review №2](https://github.com/vladimirvikulin/To-Do-List-Server/pull/2) 
- [Code review №3](https://github.com/vladimirvikulin/To-Do-List-Server/pull/3) 
- [Code review №4](https://github.com/vladimirvikulin/To-Do-List/pull/8) 
