'use strict';

const { default: fetch } = require("node-fetch");

const application_id = 'd78e7f67147305f3042bef05755fa168';
const MAX_ACCOUNTS_PER_REQUEST = 100;
const TOTAL_ACCOUNTS = 594859325;
const BASE_URL = 'https://api.wotblitz.eu/wotb';
const allPlayerStats = {};

const statsNames = ['battles', 'damage_dealt', 'damage_received', 'frags', 'spotted', 'wins', 'losses', 'survived_battles'];
const achievementsName = ['markOfMastery', 'markOfMasteryI', 'markOfMasteryII', 'markOfMasteryIII'];
const getStatsObject = (statsName, stats) => Object.fromEntries(statsName.map((statName) => [statName, stats[statName] || 0]));

const getPlayerInfo = async (url) => {
  try {
    const response = await fetch(url);
    const data = await response.json();
    const playerInfo = data.data;
    return playerInfo;
  } catch (error) {
    console.error('Error:', error);
  }
};

const fetchPlayerStats = async (playerIds) => {
  const playerStatsURL = `${BASE_URL}/account/info/?application_id=${application_id}&account_id=${playerIds.join(',')}&extra=statistics.rating`;
  const playerAchievmentsURL = `${BASE_URL}/account/achievements/?application_id=${application_id}&account_id=${playerIds.join(',')}`;

  try {
    const playerStats = await getPlayerInfo(playerStatsURL);
    const playerAchievments = await getPlayerInfo(playerAchievmentsURL);

    for (const accountId in playerStats) {
      const stats = playerStats[accountId]?.statistics;
      const achievements = playerAchievments[accountId]?.achievements;

      if (!stats || !achievements) continue;
      const regularStats = stats.all;
      const ratingStats = stats.rating;

      if (!allPlayerStats.regular) {
        allPlayerStats.regular = getStatsObject(statsNames, regularStats);
        allPlayerStats.rating = getStatsObject(statsNames, ratingStats);
        allPlayerStats.mastery = getStatsObject(achievementsName, achievements);
      }
      console.log(allPlayerStats);
      statsNames.map((statName) => {
          allPlayerStats.regular[statName] = allPlayerStats.regular[statName] + regularStats[statName];
          allPlayerStats.rating[statName] = allPlayerStats.rating[statName] + ratingStats[statName];
      });
      achievementsName.map((achievmentName) => {
        allPlayerStats.mastery[achievmentName] = allPlayerStats.mastery[achievmentName] + (achievements[achievmentName] || 0);
    });
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

const fetchAllPlayerStats = async () => {
  try {
    const numRequests = Math.ceil(TOTAL_ACCOUNTS / MAX_ACCOUNTS_PER_REQUEST);

    for (let i = 5900000; i < numRequests; i++) { // change `i` to any number
      const startIndex = i * MAX_ACCOUNTS_PER_REQUEST;
      const endIndex = Math.min(startIndex + MAX_ACCOUNTS_PER_REQUEST, TOTAL_ACCOUNTS);
      const accountIds = [];

      for (let accountId = startIndex; accountId < endIndex; accountId++) {
        accountIds.push(accountId);
      }

      await fetchPlayerStats(accountIds);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

(async () => await fetchAllPlayerStats())();