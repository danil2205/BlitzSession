'use strict';

const puppeteer = require('puppeteer');
const readline = require('readline-sync');
const fetch = require('node-fetch');
const fs = require('fs');

const applicationID = '118323c3ada6d49317301a0762b75642';
let accountID = null;
let accessToken = null;

const publicInfo = {
  'nickname': 'Никнейм:',
  'global_rating': 'Личный рейтинг:',
  'clan_id': 'Есть ли клан (айди):',
  'last_battle_time': 'Последний бой:',
  'created_at': 'Аккаунт создан:',
};

const privateInfo = {
  'credits': 'Количество кредитов:',
  'gold': 'Количество золота:',
  'bonds': 'Количество бонов:',
  'free_xp': 'Количество свободного опыта:',
  'is_bound_to_phone': 'Привязан телефон:',
  'is_premium': 'Есть ли премиум:',
  'ban_info': 'Бан:',
};

const selectors = {
  loginInput: '#id_login',
  passwordInput: '#id_password',
  submitButton: '#jsc-submit-button-ed41-d255- > button > span',
  confirmButton: '#confirm_form > div > div > input',
  accessIDText: 'body > div.console.js-console-layout.ui-resizable.ui-draggable.console__active > div.console_wrapper > pre > div > div.jspPane > code > div > ul > li:nth-child(2) > span.string',
  twoFactor: '#jsc-twofactor-form-ccb9-f5ff- > form > div > div > p',
  twoFactorInput: '#id_code',
  twoFactorButton: '#jsc-submit-button-db60-99c8- > button',
};

const getAccountID = async (nick) => {
  try {
    const nickName = await nick;
    const url = `https://api.worldoftanks.ru/wot/account/list/?application_id=${applicationID}&search=${nickName}`;
    const response = await fetch(url);
    const data = await response.json();
    const accounts = data.data;
    accounts.map((account) => {
      if (account.nickname.toLowerCase() === nickName.toLowerCase()) {
        accountID = account.account_id;
      }
    })
    return `account_id of ${nick}: ${accountID}`;
  } catch {
    console.log('Unknown nickname');
  }
};

const getPublicInfo = async (nick) => {
  try {
    await getAccountID(nick);
    const url = `https://api.worldoftanks.ru/wot/account/info/?application_id=${applicationID}&account_id=${accountID}`;
    const res = [];
    const response = await fetch(url);
    const data = await response.json();
    const playerInfo = data.data[accountID];
    for (const [key, info] of Object.entries(publicInfo)) {
      const value = playerInfo[key];
      if (isTimestamp(value)) {
        const data = `${info} ${getTimestampToDate(value)}`;
        res.push(data);
      } else {
        const data = `${info} ${value}`;
        res.push(data);
      }
    }
    return res;
  } catch {
    console.log('Cannot find that nickname');
  }
};

const getPrivateInfo = async (email, password) => {
  await getAccountID();
  await getAccessToken(email, password);
  const url = `https://api.worldoftanks.ru/wot/account/info/?application_id=${applicationID}&access_token=${accessToken}&account_id=${accountID}`;
  const res = [];
  const response = await fetch(url);
  const data = await response.json();
  const playerInfo = data.data[accountID];
  for (const [key, info] of Object.entries(privateInfo)) {
    const value = playerInfo.private[key];
    const data = `${info} ${value}`;
    res.push(data);
  }
  return res;
}

const getAccessToken = async (email, password) => {
  const url = `https://api.worldoftanks.ru/wot/auth/login/?application_id=${applicationID}&redirect_uri=https%3A%2F%2Fdevelopers.wargaming.net%2Freference%2Fall%2Fwot%2Fauth%2Flogin%2F`;
  let browser = await puppeteer.launch({ headless: true, slowMo: 100 });
  let page = await browser.newPage();
  await page.goto(url, { waitUntil: 'domcontentloaded' });

  await page.waitForSelector(selectors.loginInput);
  await page.type(selectors.loginInput, email);
  await page.type(selectors.passwordInput, password);
  const sendDataButton = await page.$(selectors.submitButton);
  await sendDataButton.click();

  await page.waitFor(2000);
  if (await page.$(selectors.twoFactorInput) !== null) {
    const twoFactor = await readline.question('Write Two Factor code: ');
    await page.type(selectors.twoFactorInput, twoFactor);
    const sendCodeButton = await page.$(selectors.twoFactorButton);
    await sendCodeButton.click();
  }

  await page.waitForSelector(selectors.confirmButton);
  const buttonConfirm = await page.$(selectors.confirmButton);
  await buttonConfirm.click();

  await page.waitForSelector(selectors.accessIDText);
  const element = await page.$(selectors.accessIDText);
  accessToken = await page.evaluate((el) => el.textContent.replace(/"/g, ''), element);
  await browser.close();
  return accessToken;
};

const addZeroInTime = (time, n = 2) => `${time}`.padStart(n, '0');

const getTimestampToDate = (timestamp) => {
  const date = new Date(timestamp * 1000);
  const hours = addZeroInTime(date.getHours());
  const minutes = addZeroInTime(date.getMinutes());
  return `${date.toLocaleDateString()} ${hours}:${minutes}`;
};

const setDateToTimestamp = (date) => date.getTime();

const isTimestamp = (value) => value.toString().length === 10 && typeof value === 'number';

module.exports = {
  getAccountID,
  getAccessToken,
  getPublicInfo,
  getPrivateInfo,
}
