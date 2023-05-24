'use strict';

const { default: fetch } = require("node-fetch");

const application_id = 'd78e7f67147305f3042bef05755fa168';
const MAX_ACCOUNTS_PER_REQUEST = 100;
const TOTAL_ACCOUNTS = 594859326;
const BASE_URL = 'https://api.wotblitz.eu/wotb';
const allPlayerStats = { account: {}, tanks: [] };

const statsNames = ['battles', 'damage_dealt', 'damage_received', 'frags', 'spotted', 'wins', 'losses', 'survived_battles'];
const achievementsName = ['markOfMastery', 'markOfMasteryI', 'markOfMasteryII', 'markOfMasteryIII'];
const getStatsObject = (statsName, stats) => Object.fromEntries(statsName.map((statName) => [statName, stats[statName] || 0]));

const getInfo = async (url) => {
  try {
    const response = await fetch(url);
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error:', error);
  }
};

const getVehicleStats = async (accountId) => {
  const vehicleStatsURL = `${BASE_URL}/tanks/stats/?application_id=${application_id}&account_id=${accountId}`;
  const vehicleAchievmentsURL = `${BASE_URL}/tanks/achievements/?application_id=${application_id}&account_id=${accountId}`;
  const [vehicleStats, vehicleAchievments] = await Promise.all([getInfo(vehicleStatsURL), getInfo(vehicleAchievmentsURL)]);

  const stats = vehicleStats[accountId];
  const achievements = vehicleAchievments[accountId];

  if (!stats || !achievements) return;

  return stats.map((tankStats) => {
    const battleLifeTime = tankStats.battle_life_time;
    if (!battleLifeTime) return;
    const regular = getStatsObject(statsNames, tankStats.all);
    const mastery = getStatsObject(achievementsName, achievements.find((tankAchievements) => tankAchievements.tank_id === tankStats.tank_id).achievements);
    return { wotId: tankStats.tank_id, regular, battleLifeTime, mastery };
  }).filter((tankStats) => tankStats);
};

const fetchPlayerStats = async (playerIds) => {
  const playerStatsURL = `${BASE_URL}/account/info/?application_id=${application_id}&account_id=${playerIds.join(',')}&extra=statistics.rating`;
  const playerAchievmentsURL = `${BASE_URL}/account/achievements/?application_id=${application_id}&account_id=${playerIds.join(',')}`;

  try {
  const [playerStats, playerAchievments] = await Promise.all([getInfo(playerStatsURL), getInfo(playerAchievmentsURL)]);

    for (const accountId in playerStats) {
      const stats = playerStats[accountId]?.statistics;
      const achievements = playerAchievments[accountId]?.achievements;
      const vehicleStats = await getVehicleStats(accountId);

      if (!stats || !achievements) continue;
      const regularStats = stats.all;
      const ratingStats = stats.rating;

      if (JSON.stringify(allPlayerStats.account) === '{}') {
        allPlayerStats.account.regular = getStatsObject(statsNames, regularStats);
        allPlayerStats.account.rating = getStatsObject(statsNames, ratingStats);
        allPlayerStats.account.mastery = getStatsObject(achievementsName, achievements);
      } else {
        statsNames.map((statName) => {
          allPlayerStats.account.regular[statName] += regularStats[statName];
          allPlayerStats.account.rating[statName] += ratingStats[statName];
        });
        achievementsName.map((achievementName) => {
          allPlayerStats.account.mastery[achievementName] += (achievements[achievementName] || 0);
        });
      }

      if (vehicleStats) {
	      for (const vehicle of vehicleStats) {
          const existingTank = allPlayerStats.tanks.find((tank) => tank.wotId === vehicle.wotId);
      
          if (existingTank) {
            for (const statName of statsNames) {
              existingTank.regular[statName] += vehicle.regular[statName];
            }
            for (const achievementName of achievementsName) {
              existingTank.mastery[achievementName] += vehicle.mastery[achievementName] || 0;
            }
            existingTank.battleLifeTime += vehicle.battleLifeTime;
          } else {
            allPlayerStats.tanks.push(vehicle);
          }
        }
      }

    }
  } catch (error) {
    console.error('Error:', error);
  }
}

const fetchAllPlayerStats = async () => {
  try {
    const numRequests = Math.ceil(TOTAL_ACCOUNTS / MAX_ACCOUNTS_PER_REQUEST);

    for (let i = 5947593; i < numRequests; i++) { // change `i` to any number
      const startIndex = i * MAX_ACCOUNTS_PER_REQUEST;
      const endIndex = Math.min(startIndex + MAX_ACCOUNTS_PER_REQUEST, TOTAL_ACCOUNTS);
      const accountIds = Array.from({ length: endIndex - startIndex }, (_, index) => startIndex + index);
      console.log(accountIds)
      await fetchPlayerStats(accountIds);
    }

    return allPlayerStats;
  } catch (error) {
    console.error('Error:', error);
  }
}

module.exports = {
  fetchAllPlayerStats,
}