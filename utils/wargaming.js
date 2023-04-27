'use strict';

const { default: fetch } = require("node-fetch");

const application_id = 'd78e7f67147305f3042bef05755fa168';

const getListTanks = async () => {
  const listOfTanksURL = `https://api.wotblitz.eu/wotb/encyclopedia/vehicles/?application_id=${application_id}`;
  const tanks = await fetch(listOfTanksURL).then((res) => res.json());
  const cleanedList = [];

  for (const key in tanks.data) {
    const tank = tanks.data[key];
    cleanedList.push({
      name: tank.name,
      tank_id: tank.tank_id,
      tier: tank.tier,
      type: tank.type,
      isPremium: tank.is_premium,
      hp: tank.default_profile.hp,
      image: tank.images.preview
    });
  }
  
  return cleanedList;
};

const getTanksAchievments = async (account_id = 594859325) => {
  const achievmentsTanksURL = `https://api.wotblitz.eu/wotb/tanks/achievements/?application_id=${application_id}&account_id=${account_id}`;
  const achievments = await fetch(achievmentsTanksURL).then((res) => res.json());
  const res = [];
  // Bug in Wargaming API after transfering account on another server. 
  //After fetch I must already have tanks with achievments. But, on some tanks i have achievments = {}
  const tanksWithAchievments = achievments.data[account_id].filter((tankAchievments) => Object.keys(tankAchievments.achievements).length > 0);  
  tanksWithAchievments.map((tankAchievments) => {
    res.push({
      tank_id: tankAchievments.tank_id,
      mastery: {
        markOfMastery: tankAchievments.achievements.markOfMastery || 0,
        markOfMasteryI: tankAchievments.achievements.markOfMasteryI || 0,
        markOfMasteryII: tankAchievments.achievements.markOfMasteryII || 0,
        markOfMasteryIII: tankAchievments.achievements.markOfMasteryIII || 0,
      },
    });
  });

  return res;
};

const getTanksStats = async (account_id = 594859325) => {
  const statsTanksURL = `https://api.wotblitz.eu/wotb/tanks/stats/?application_id=${application_id}&account_id=${account_id}`;
  const stats = await fetch(statsTanksURL).then((res) => res.json());
  const achievements = await getTanksAchievments(account_id);
  const listOfTanks = await getListTanks();
  const res = [];
  // Bug in Wargaming API after transfering account on another server. 
  // The same situation like with achievments, but now with statistic.
  const tanksWithStats = stats.data[account_id].filter((tankStats) => tankStats.last_battle_time !== 0);
  tanksWithStats.map((tankStats) => {
    const tankAchivs = achievements.find((tankAchievments) => tankAchievments.tank_id === tankStats.tank_id);
    const tankInformation = listOfTanks.find((tankInfo) => tankInfo.tank_id === tankStats.tank_id);
    // another bug in wargaming api. they didn't added new tank in list of all tanks, so i need to check on undefined.
    if (tankInformation === undefined) return; 

    const winrate = `${((tankStats.all.wins / tankStats.all.battles) * 100).toFixed(2)}%`;
    const avgDmg = ~~(tankStats.all.damage_dealt / tankStats.all.battles);
    const coefFrag = (tankStats.all.frags / tankStats.all.battles).toFixed(2);
    const percentRemainHP = `${((1 - (tankStats.all.damage_received / tankStats.all.battles) / tankInformation.hp) * 100).toFixed(2)}%`;
    const battlesForMaster = ~~(tankStats.all.battles / tankAchivs.mastery.markOfMastery);
    const avgTimeInBattle = `${Math.floor((tankStats.battle_life_time / tankStats.all.battles) / 60)}m ${tankStats.battle_life_time % 60}s`;

    res.push({
      ...tankInformation, 
      ...{ winrate, avgDmg, coefFrag, percentRemainHP, battlesForMaster, avgTimeInBattle }, 
      ...tankAchivs 
    });
  });

  return res;
};

module.exports = {
  getListTanks,
  getTanksStats,
  getTanksAchievments
};