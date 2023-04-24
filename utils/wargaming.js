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
      wotId: tank.tank_id,
      tier: tank.tier,
      type: tank.type,
      isPremium: tank.is_premium,
      hp: tank.default_profile.hp,
      image: tank.images.preview
    });
  }
  return cleanedList;
};

module.exports = getListTanks;