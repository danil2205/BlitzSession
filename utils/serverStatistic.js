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
    console.error(error);
  }
};

const getVehicleStats = async (accountId) => {
  const vehicleStatsURL = `${BASE_URL}/tanks/stats/?application_id=${application_id}&account_id=${accountId}`;
  const vehicleAchievmentsURL = `${BASE_URL}/tanks/achievements/?application_id=${application_id}&account_id=${accountId}`;
  try {
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
  } catch (err) {
    console.error(err);
  }
};

const initializePlayerStats = (regularStats, ratingStats, achievements) => {
  allPlayerStats.account.regular = getStatsObject(statsNames, regularStats);
  allPlayerStats.account.rating = getStatsObject(statsNames, ratingStats);
  allPlayerStats.account.mastery = getStatsObject(achievementsName, achievements);
};

const updatePlayerStats = (regularStats, ratingStats, achievements) => {
  statsNames.forEach((statName) => {
    allPlayerStats.account.regular[statName] += regularStats[statName];
    allPlayerStats.account.rating[statName] += ratingStats[statName];
  });

  achievementsName.forEach((achievementName) => {
    allPlayerStats.account.mastery[achievementName] += (achievements[achievementName] || 0);
  });
};

const updateTankStats = (existingTank, vehicle) => {
  statsNames.forEach((statName) => {
    existingTank.regular[statName] += vehicle.regular[statName];
  });
  achievementsName.forEach((achievementName) => {
    existingTank.mastery[achievementName] += vehicle.mastery[achievementName] || 0;
  });
  existingTank.battleLifeTime += vehicle.battleLifeTime;
};

const processPlayerStats = async (stats, achievements) => {
  if (!stats || !achievements) return;

  const regularStats = stats.all;
  const ratingStats = stats.rating;

  if (JSON.stringify(allPlayerStats.account) === '{}') {
    initializePlayerStats(regularStats, ratingStats, achievements);
  } else {
    updatePlayerStats(regularStats, ratingStats, achievements);
  }
}

const processVehicleStats = async (accountId) => {
  const vehicleStats = await getVehicleStats(accountId);
  if (!vehicleStats) return;

  vehicleStats.forEach((vehicle) => {
    const existingTank = allPlayerStats.tanks.find((tank) => tank.wotId === vehicle.wotId);

    if (existingTank) {
      updateTankStats(existingTank, vehicle);
    } else {
      allPlayerStats.tanks.push(vehicle);
    }
  });
};

const fetchPlayerStats = async (playerIds) => {
  const playerStatsURL = `${BASE_URL}/account/info/?application_id=${application_id}&account_id=${playerIds.join(',')}&extra=statistics.rating`;
  const playerAchievementsURL = `${BASE_URL}/account/achievements/?application_id=${application_id}&account_id=${playerIds.join(',')}`;

  try {
    const [playerStats, playerAchievements] = await Promise.all([getInfo(playerStatsURL), getInfo(playerAchievementsURL)]);

    for (const accountId in playerStats) {
      const stats = playerStats[accountId]?.statistics;
      const achievements = playerAchievements[accountId]?.achievements;

      await processPlayerStats(stats, achievements);
      await processVehicleStats(accountId);
    }
  } catch (error) {
    console.error('Error:', error);
  }
};

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
  application_id,
  getVehicleStats,
  fetchPlayerStats,
  fetchAllPlayerStats,
}
