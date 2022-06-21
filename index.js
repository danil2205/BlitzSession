'use strict';

const puppeteer = require('puppeteer');
const readline = require('readline-sync');
const fetch = require('node-fetch');

const applicationID = '118323c3ada6d49317301a0762b75642';
let accountID = null;

const getAccountID = async () => {
  // const nickName = await readline.question('Write a nickname: ');
  const nickName = 'Danil2205_'; // temporary
  const url = `https://api.worldoftanks.ru/wot/account/list/?application_id=${applicationID}&search=${nickName}`;
  const response = await fetch(url);
  const data = await response.json();
  const accounts = data.data;
  accounts.map((account) => {
      if (account.nickname === nickName) accountID = account.account_id;
  });
};

const getPersonalInfo = async () => {
  await getAccountID();
  const url = `https://api.worldoftanks.ru/wot/account/info/?application_id=${applicationID}&account_id=${accountID}`;
  const response = await fetch(url);
  const data = await response.json();
  const playerInfo = data.data[`${accountID}`];
};

const addZeroInTime = (time, n = 2) => `${time}`.padStart(n, '0');

const getTimestampToDate = (timestamp) => {
  const date = new Date(timestamp * 1000);
  const hours = addZeroInTime(date.getHours());
  const minutes = addZeroInTime(date.getMinutes());
  return `${date.toLocaleDateString()} ${hours}:${minutes}`;
};

getPersonalInfo();
