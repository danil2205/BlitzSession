'use strict';
const { getListTanks, getTanksAchievments, application_id } = require('./wargaming.js');
const fetch = require('node-fetch');

// Mock the fetch function
jest.mock('node-fetch');

describe('getListTanks', () => {
  it('should return a cleaned list of tanks', async () => {
    const mockResponse = {
      status: 200,
      meta: {
        count: 2
      },
      json: jest.fn().mockResolvedValue({
        data: {
          tank1: {
            name: 'Tank 1',
            nation: 'ussr',
            engines: { 0: 261, 1: 5},
            prices_xp: { 2049: 11000 },
            tank_id: 1,
            tier: 8,
            type: 'heavyTank',
            is_premium: true,
            default_profile: { hp: 1500 },
            images: { normal: 'tank1.jpg', hd: 'tank1_hd.jpg' }
          },
          tank2: {
            name: 'Tank 2',
            tank_id: 2,
            nation: 'ussr',
            engines: { 0: 2061, 1: 50},
            prices_xp: { 1139: 11228 },
            tier: 6,
            type: 'mediumTank',
            is_premium: false,
            default_profile: { hp: 1000 },
            images: { normal: 'tank2.jpg', hd: 'tank1_hd.jpg' }
          }
        }
      })
    };

    fetch.mockResolvedValue(mockResponse);
    const result = await getListTanks();

    expect(result).toEqual([
      {
        name: 'Tank 1',
        tank_id: 1,
        tier: 8,
        type: 'heavyTank',
        isPremium: true,
        hp: 1500,
        image: 'tank1.jpg'
      },
      {
        name: 'Tank 2',
        tank_id: 2,
        tier: 6,
        type: 'mediumTank',
        isPremium: false,
        hp: 1000,
        image: 'tank2.jpg'
      }
    ]);

    expect(fetch).toHaveBeenCalledWith(
      `https://api.wotblitz.eu/wotb/encyclopedia/vehicles/?application_id=${application_id}`
    );
  });

  it('should handle errors and log them', async () => {
    fetch.mockRejectedValue(new Error('API Error'));
    console.error = jest.fn();
    const result = await getListTanks();

    expect(result).toBeUndefined();

    expect(console.error).toHaveBeenCalledWith(new Error('API Error'));
  });
});
