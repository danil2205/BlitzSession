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
  const { data: { [account_id]: achievments } } = await fetch(achievmentsTanksURL).then((res) => res.json());
  const res = [];
  // Bug in Wargaming API after transfering account on another server. 
  //After fetch I must already have tanks with achievments. But, on some tanks i have achievments = {}
  const tanksWithAchievments = achievments.filter((tankAchievments) => Object.keys(tankAchievments.achievements).length > 0);  
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
  const res = { status: null, data: [] };
  const statsTanksURL = `https://api.wotblitz.eu/wotb/tanks/stats/?application_id=${application_id}&account_id=${account_id}`;
  const { data: { [account_id]: stats } } = await fetch(statsTanksURL).then((res) => res.json());
  // if account_id is invalid, it won't crash my server
  if (!stats) {
    res.status = 'fail';
    return res;
  } else {
    res.status = 'ok';
  }

  const achievements = await getTanksAchievments(account_id);
  const listOfTanks = await getListTanks();
  // Bug in Wargaming API after transfering account on another server. 
  // The same situation like with achievments, but now with statistic.
  const tanksWithStats = stats.filter((tankStats) => tankStats.last_battle_time !== 0);
  tanksWithStats.map((tankStats) => {
    const tankAchivs = achievements.find((tankAchievments) => tankAchievments.tank_id === tankStats.tank_id);
    const tankInformation = listOfTanks.find((tankInfo) => tankInfo.tank_id === tankStats.tank_id);
    // another bug in wargaming api. they didn't added new tank in list of all tanks, so i need to check on undefined.
    if (tankInformation === undefined) return; 

    const battles = tankStats.all.battles;
    const winrate = ((tankStats.all.wins / tankStats.all.battles) * 100).toFixed(2);
    const avgDmg = ~~(tankStats.all.damage_dealt / tankStats.all.battles);
    const coefFrag = (tankStats.all.frags / tankStats.all.battles).toFixed(2);
    const percentRemainHP = ((1 - (tankStats.all.damage_received / tankStats.all.battles) / tankInformation.hp) * 100).toFixed(2);
    const battlesForMaster = ~~(tankStats.all.battles / tankAchivs.mastery.markOfMastery);
    const avgTimeInBattleForSort = tankStats.battle_life_time / tankStats.all.battles;
    const avgTimeInBattle = (
      Math.floor(avgTimeInBattleForSort / 60) < 7 
        ? `${Math.floor(avgTimeInBattleForSort / 60)}m ${~~(avgTimeInBattleForSort % 60)}s` 
        : '~ 7m'
    );

    res.data.push({
      ...tankInformation, 
      ...{ 
        battles, 
        winrate, 
        avgDmg, 
        coefFrag, 
        percentRemainHP, 
        battlesForMaster, 
        avgTimeInBattle, 
        avgTimeInBattleForSort, 
        lastBattleTime: tankStats.last_battle_time
      }, 
      ...tankAchivs 
    });
  });

  return res;
};

(async () => await getTanksStats())();

module.exports = {
  getListTanks,
  getTanksStats,
  getTanksAchievments
};