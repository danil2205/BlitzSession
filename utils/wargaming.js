'use strict';

const { default: fetch } = require("node-fetch");

const application_id = 'd78e7f67147305f3042bef05755fa168';

const getListTanks = async () => {
  const listOfTanksURL = `https://api.wotblitz.eu/wotb/encyclopedia/vehicles/?application_id=${application_id}`;
  try {
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
        image: tank.images.normal
      });
    }
    
    return cleanedList;
  } catch (err) {
    console.error(err);
  }
};

const getTanksAchievments = async (account_id = 594859325) => {
  const achievmentsTanksURL = `https://api.wotblitz.eu/wotb/tanks/achievements/?application_id=${application_id}&account_id=${account_id}`;
  try {
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
  } catch (err) {
    console.error(err);
  }
};

const postTanksSnapshots = async (account_id = 594859325) => {
  const res = { status: null, account_id, data: [] };
  const statsTanksURL = `https://api.wotblitz.eu/wotb/tanks/stats/?application_id=${application_id}&account_id=${account_id}`;
  try {
    const { data: { [account_id]: stats } } = await fetch(statsTanksURL).then((res) => res.json());
    // if account_id is invalid, it won't crash my server
    if (!stats) {
      res.status = false;
      return res;
    } else {
      res.status = true;
    }

    const achievements = await getTanksAchievments(account_id);
    const listOfTanks = await getListTanks();
    // Bug in Wargaming API after transfering account on another server. 
    // The same situation like with achievments, but now with statistic.
    const tanksWithStats = stats.filter((tankStats) => tankStats.last_battle_time !== 0);
    tanksWithStats.map((tankStats) => {
      const tankAchivs = achievements.find((tankAchievments) => tankAchievments.tank_id === tankStats.tank_id);
      const tankInformation = listOfTanks.find((tankInfo) => tankInfo.tank_id === tankStats.tank_id);

      // const winrate = ((tankStats.all.wins / tankStats.all.battles) * 100).toFixed(2);
      // const avgDmg = ~~(tankStats.all.damage_dealt / tankStats.all.battles);
      // const coefFrag = (tankStats.all.frags / tankStats.all.battles).toFixed(2);
      // const percentRemainHP = ((1 - (tankStats.all.damage_received / tankStats.all.battles) / tankInformation?.hp) * 100).toFixed(2);
      // const battlesForMaster = ~~(tankStats.all.battles / tankAchivs?.mastery?.markOfMastery);
      // const avgTimeInBattleForSort = tankStats.battle_life_time / tankStats.all.battles;
      // const avgTimeInBattle = (
      //   Math.floor(avgTimeInBattleForSort / 60) < 7 
      //     ? `${Math.floor(avgTimeInBattleForSort / 60)}m ${~~(avgTimeInBattleForSort % 60)}s` 
      //     : '~ 7m'
      // );

      res.data.push({
        ...tankInformation, 
        snapshots: [{
          battleLifeTime: tankStats.battle_life_time,
          lastBattleTime: tankStats.last_battle_time,
          mastery: tankAchivs.mastery,
          regular: { 
            battles: tankStats.all.battles, 
            wins: tankStats.all.wins,
            losses: tankStats.all.losses, 
            damageDealt: tankStats.all.damage_dealt,
            damageReceived: tankStats.all.damage_received,
            frags: tankStats.all.frags,
            spotted: tankStats.all.spotted,
            survivedBattles: tankStats.all.survived_battles
            // coefFrag: isNaN(coefFrag) ? '0.00' : coefFrag,
            // percentRemainHP: isNaN(percentRemainHP) ? '0.00' : percentRemainHP,
            // battlesForMaster, 
            // avgTimeInBattle, 
            // avgTimeInBattleForSort, 
          }
        }],
      });
    });

    return res;
  } catch (err) {
    console.error(err);
  }
};

const postPlayerSnapshots = async (account_id = 594859325) => {
  const res = { success: null, data: {} };
  const playerStatsURL = `https://api.wotblitz.eu/wotb/account/info/?application_id=${application_id}&account_id=${account_id}&extra=statistics.rating`;
  const playerAchievmentsURL = `https://api.wotblitz.eu/wotb/account/achievements/?application_id=${application_id}&account_id=${account_id}`
  try {
    const { data: { [account_id]: playerStats } } = await fetch(playerStatsURL).then((res) => res.json());
    const { data: { [account_id]: playerAchievments } } = await fetch(playerAchievmentsURL).then((res) => res.json());

    if (!playerStats || !playerAchievments) {
      res.success = false;
      return res;
    } else {
      res.success = true;
    }

    res.data = {
      createdAt: playerStats.created_at,
      name: playerStats.nickname,
      accountId: playerStats.account_id,
      snapshots: [{
        lastBattleTime: playerStats.last_battle_time,
        regular: {
          battles: playerStats.statistics.all.battles,
          wins: playerStats.statistics.all.wins,
          losses: playerStats.statistics.all.losses,
          damageDealt: playerStats.statistics.all.damage_dealt,
          damageReceived: playerStats.statistics.all.damage_received,
          survivedBattles: playerStats.statistics.all.survived_battles,
          spotted: playerStats.statistics.all.spotted,
          frags: playerStats.statistics.all.frags,
        },
        rating: {
          battles: playerStats.statistics.rating.battles,
        },
        mastery: {
          markOfMastery: playerAchievments.achievements.markOfMastery,
          markOfMasteryI: playerAchievments.achievements.markOfMasteryI,
          markOfMasteryII: playerAchievments.achievements.markOfMasteryII,
          markOfMasteryIII: playerAchievments.achievements.markOfMasteryIII,
        },
      }],
    }

    return res;
  } catch (err) {
    console.error(err);
  }
};

module.exports = {
  getListTanks,
  postTanksSnapshots,
  getTanksAchievments,
  postPlayerSnapshots,
};