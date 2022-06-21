'use strict';

const puppeteer = require('puppeteer');
const readline = require('readline-sync');
const fetch = require('node-fetch');

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

const getAccountID = async () => {
  const nickName = await readline.question('Write a nickname: ');
  const url = `https://api.worldoftanks.ru/wot/account/list/?application_id=${applicationID}&search=${nickName}`;
  const response = await fetch(url);
  const data = await response.json();
  const accounts = data.data;
  accounts.map((account) => {
    if (account.nickname.toLowerCase() === nickName.toLowerCase()) {
      accountID = account.account_id;
      console.log('Account ID:', accountID);
    }
  });
};

const getPrivateInfo = async () => {
  await getAccountID();
  await getAccessToken();
  const url = `https://api.worldoftanks.ru/wot/account/info/?application_id=${applicationID}&access_token=${accessToken}&account_id=${accountID}`;
  const response = await fetch(url);
  const data = await response.json();
  const playerInfo = data.data[accountID];
  for (const [key, info] of Object.entries(publicInfo)) {
    const value = playerInfo[`${key}`];
    if (isTimestamp(value)) {
      console.log(`${info} ${getTimestampToDate(value)}`)
    } else {
      console.log(`${info} ${value}`);
    }
  }
  for (const [key, info] of Object.entries(privateInfo)) {
    const value = playerInfo.private[`${key}`];
    console.log(`${info} ${value}`);
  }
}

const getAccessToken = async () => {
  const email = await readline.question('Write a email: ');
  const password = await readline.question('Write a password: ');
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
  console.log('Access Token:', accessToken);
  await browser.close();
};

const addZeroInTime = (time, n = 2) => `${time}`.padStart(n, '0');

const getTimestampToDate = (timestamp) => {
  const date = new Date(timestamp * 1000);
  const hours = addZeroInTime(date.getHours());
  const minutes = addZeroInTime(date.getMinutes());
  return `${date.toLocaleDateString()} ${hours}:${minutes}`;
};

const isTimestamp = (value) => value.toString().length === 10 && typeof value === 'number'

const getFunction = async () => {
  console.log('Write 1, if you want to get account_id by nickname \n' +
    'Write 2, if you want to get access_token by email/password \n' +
    'Write 3, if you want to get private info by access_token and account_id \n');
  const digit = await readline.question('Write a digit: ');
  const collection = {
    1: () => getAccountID(),
    2: () => getAccessToken(),
    3: () => getPrivateInfo(),
  };
  await collection[digit]();
};
getFunction();
