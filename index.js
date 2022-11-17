'use strict';

const fetch = require('node-fetch');

const applicationID = 'd78e7f67147305f3042bef05755fa168';
let accountID = null;

const publicInfo = {
  'nickname': 'Никнейм:',
  'global_rating': 'Личный рейтинг:',
  'clan_id': 'Есть ли клан (айди):',
  'last_battle_time': 'Последний бой:',
  'created_at': 'Аккаунт создан:',
};

const getAccountID = async (nick) => {
  try {
    const nickName = await nick;
    const url = `https://api.worldoftanks.eu/wot/account/list/?application_id=${applicationID}&search=${nickName}`;
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
    const url = `https://api.worldoftanks.eu/wot/account/info/?application_id=${applicationID}&account_id=${accountID}`;
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

const fetchStats = async (accountId) => {
  const url = `https://api.wotblitz.eu/wotb/account/info/?application_id=${applicationID}&account_id=${accountId}`;
  const response = await fetch(url);
  const data = await response.json();
  const playerInfo = data.data[accountId].statistics.all;
  const battles = playerInfo.battles;
  const wins = playerInfo.wins;
  const damage = playerInfo.damage_dealt;
  return [battles, wins, damage];
}

let currBattles;
let currWins;
let currDamage;

const startSession = async (accountId) => {
  [currBattles, currWins, currDamage] = await fetchStats(accountId)
  return [currBattles, currWins, currDamage];
};

const endSession = async (accountId) => {
  const [endBattles, endWins, endDamage] = await fetchStats(accountId);

  const battles = endBattles - currBattles;
  const wins = endWins - currWins;
  const winRate = ((wins / battles) * 100).toFixed(2);
  const averageDamage = ((endDamage - currDamage) / battles).toFixed();
  return [battles, averageDamage, `${winRate}%`];
};

const addZeroInTime = (time, n = 2) => `${time}`.padStart(n, '0');

const getTimestampToDate = (timestamp) => {
  const date = new Date(timestamp * 1000);
  const hours = addZeroInTime(date.getHours());
  const minutes = addZeroInTime(date.getMinutes());
  return `${date.toLocaleDateString()} ${hours}:${minutes}`;
};

const isTimestamp = (value) => value.toString().length === 10 && typeof value === 'number';

module.exports = {
  getAccountID,
  getPublicInfo,
  startSession,
  endSession,
}
