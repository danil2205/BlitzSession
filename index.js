'use strict';

const puppeteer = require('puppeteer');
const readline = require('readline-sync');
const fetch = require('node-fetch');

const applicationID = '118323c3ada6d49317301a0762b75642';
let accountID = null;
let accessToken = null;

const mainInfo = {
  'nickname': 'Никнейм:',
  'last_battle_time': 'Последний бой:',
  'created_at': 'Аккаунт создан:',
  'global_rating': 'Личный рейтинг:',
  'clan_id': 'Clan id:',
};

const getAccountID = async () => {
  const nickName = await readline.question('Write a nickname: ');
  const url = `https://api.worldoftanks.ru/wot/account/list/?application_id=${applicationID}&search=${nickName}`;
  const response = await fetch(url);
  const data = await response.json();
  const accounts = data.data;
  accounts.map((account) => {
      if (account.nickname === nickName) {
        accountID = account.account_id;
        console.log('Account ID: ', accountID);
      }
  });
};

const getPersonalInfo = async () => {
  await getAccountID();
  const url = `https://api.worldoftanks.ru/wot/account/info/?application_id=${applicationID}&account_id=${accountID}`;
  const response = await fetch(url);
  const data = await response.json();
  const playerInfo = data.data[accountID];
};

const getAccessToken = async () => {
  const email = await readline.question('Write a email: ');
  const password = await readline.question('Write a password: ');
  const url = `https://api.worldoftanks.ru/wot/auth/login/?application_id=${applicationID}&redirect_uri=https%3A%2F%2Fdevelopers.wargaming.net%2Freference%2Fall%2Fwot%2Fauth%2Flogin%2F`;
  let browser = await puppeteer.launch({ headless: false, slowMo: 100 });
  let page = await browser.newPage();
  await page.goto(url, { waitUntil: 'domcontentloaded' });

  await page.waitForSelector('#id_login');
  await page.type('#id_login', email);
  await page.type('#id_password', password);
  const sendDataButton = await page.$('#jsc-submit-button-ed41-d255- > button > span');
  await sendDataButton.click();

  await page.waitForSelector('#confirm_form > div > div > input');
  const buttonConfirm = await page.$('#confirm_form > div > div > input');
  await buttonConfirm.click();

  await page.waitForSelector('body > div.console.js-console-layout.ui-resizable.ui-draggable.console__active > div.console_wrapper > pre > div > div.jspPane > code > div > ul > li:nth-child(2) > span.string');
  const element = await page.$('body > div.console.js-console-layout.ui-resizable.ui-draggable.console__active > div.console_wrapper > pre > div > div.jspPane > code > div > ul > li:nth-child(2) > span.string');
  accessToken = await page.evaluate((el) => el.textContent.replace(/"/g, ''), element);
  console.log(accessToken);
};

const addZeroInTime = (time, n = 2) => `${time}`.padStart(n, '0');

const getTimestampToDate = (timestamp) => {
  const date = new Date(timestamp * 1000);
  const hours = addZeroInTime(date.getHours());
  const minutes = addZeroInTime(date.getMinutes());
  return `${date.toLocaleDateString()} ${hours}:${minutes}`;
};
