'use strict';

const { default: fetch } = require("node-fetch");

const application_id = 'd78e7f67147305f3042bef05755fa168';
const MAX_ACCOUNTS_PER_REQUEST = 100;
const TOTAL_ACCOUNTS = 594859325;
const BASE_URL = 'https://api.wotblitz.eu/wotb/';
const allPlayerStats = {};

const statsToWrite = ['battles', 'damage_dealt', 'damage_received', 'frags', 'spotted', 'wins', 'losses', 'survived_battles'];
const getStatsObject = (stats) => Object.fromEntries(statsToWrite.map((statName) => [statName, stats[statName] || 0]));

const fetchPlayerStats = async (playerIds) => {
  const url = `${BASE_URL}account/info/?application_id=${application_id}&account_id=${playerIds.join(',')}&extra=statistics.rating`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    const playerStats = data.data;

    for (const accountId in playerStats) {
      const accountData = playerStats[accountId]?.statistics;
      if (!accountData) return;
      const regularStats = accountData.all;
      const ratingStats = accountData.rating;

      if (!allPlayerStats.regular) {
        allPlayerStats.regular = getStatsObject(regularStats)
        allPlayerStats.rating = getStatsObject(ratingStats) 
      }
      console.log(allPlayerStats)
      statsToWrite.map((statName) => {
          allPlayerStats.regular[statName] = allPlayerStats.regular[statName] + regularStats[statName];
          allPlayerStats.rating[statName] = allPlayerStats.rating[statName] + ratingStats[statName];
      });

    }

  } catch (error) {
    console.error('Error:', error);
  }
}

const fetchAllPlayerStats = async () => {
  try {
    const numRequests = Math.ceil(TOTAL_ACCOUNTS / MAX_ACCOUNTS_PER_REQUEST);

    for (let i = 5900000; i < numRequests; i++) {
      const startIndex = i * MAX_ACCOUNTS_PER_REQUEST;
      const endIndex = Math.min(startIndex + MAX_ACCOUNTS_PER_REQUEST, TOTAL_ACCOUNTS);
      const accountIds = [];

      for (let accountId = startIndex; accountId < endIndex; accountId++) {
        accountIds.push(accountId);
      }

      await fetchPlayerStats(accountIds);
    }

    console.log(allPlayerStats);
  } catch (error) {
    console.error('Error:', error);
  }
}

(async () => await fetchAllPlayerStats())();