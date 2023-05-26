'use strict';
const { getListTanks, getTanksAchievments, postTanksSnapshots, postPlayerSnapshots, application_id } = require('./wargaming.js');
const fetch = require('node-fetch');
const account_id = 594859325;

jest.mock('node-fetch');

// tests getListTanks:
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


// tests getTankAchievments:
describe('getTanksAchievements', () => {
  it('should return an array of tanks with achievements', async () => {
    const mockResponse = {
      status: 200,
      meta: {
        count: 1
      },
      json: jest.fn().mockResolvedValue({
        data: {
          '594859325': [
            {
              tank_id: 1,
              account_id: 594859325,
              max_series: {
                sinai: 1337,
                diehard: 0,
              },
              achievements: {
                markOfMastery: 1,
                punisher: 4,
                warrior: 5,
                markOfMasteryI: 2,
                medalCarius: 3,
                markOfMasteryII: 3,
                markOfMasteryIII: 4,
              },
            },
            {
              tank_id: 2,
              account_id: 594859325,
              max_series: {
                sinai: 18,
                medalEkins: 2,
              },
              achievements: {
                markOfMastery: 0,
                scout: 9,
                markOfMasteryI: 0,
                markOfMasteryII: 0,
                titleSniper: 1,
              },
            }
          ],
        },
      }),
    };

    fetch.mockResolvedValue(mockResponse);
    const result = await getTanksAchievments();

    expect(result).toEqual([
      {
        tank_id: 1,
        mastery: {
          markOfMastery: 1,
          markOfMasteryI: 2,
          markOfMasteryII: 3,
          markOfMasteryIII: 4,
        }
      },
      {
        tank_id: 2,
        mastery: {
          markOfMastery: 0,
          markOfMasteryI: 0,
          markOfMasteryII: 0,
          markOfMasteryIII: 0,
        },
      },
    ]);

    expect(fetch).toHaveBeenCalledWith(
      `https://api.wotblitz.eu/wotb/tanks/achievements/?application_id=${application_id}&account_id=594859325`
    );
  });

  it('should return an empty array when achievements object is empty', async () => {
    const mockResponse = {
      status: 200,
      meta: {
        count: 1
      },
      json: jest.fn().mockResolvedValue({
        data: {
          '594859325': [
            {
              tank_id: 3,
              account_id: 594859325,
              max_series: {
                sinai: 18,
                medalEkins: 2,
              },
              achievements: {},
            }
          ],
        },
      }),
    };

    fetch.mockResolvedValue(mockResponse);
    const result = await getTanksAchievments();

    expect(result).toEqual([]);

    expect(fetch).toHaveBeenCalledWith(
      `https://api.wotblitz.eu/wotb/tanks/achievements/?application_id=${application_id}&account_id=594859325`
    );
  });

  it('should return an empty array when there are no tanks', async () => {
    const mockResponse = {
      status: 200,
      json: jest.fn().mockResolvedValue({
        data: {
          '594859325': [],
        },
      }),
    };

    fetch.mockResolvedValue(mockResponse);
    const result = await getTanksAchievments();

    expect(result).toEqual([]);

    expect(fetch).toHaveBeenCalledWith(
      `https://api.wotblitz.eu/wotb/tanks/achievements/?application_id=${application_id}&account_id=594859325`
    );
  });

  it('should handle API request error', async () => {
    fetch.mockRejectedValue(new Error('API request failed'));
    const result = await getTanksAchievments();

    expect(result).toBeUndefined();

    expect(fetch).toHaveBeenCalledWith(
      `https://api.wotblitz.eu/wotb/tanks/achievements/?application_id=${application_id}&account_id=594859325`
    );

    expect(console.error).toHaveBeenCalledWith(new Error('API request failed'));
  });
});


// tests for postTanksSnapshot:
// describe('postTanksSnapshots', () => {
//   it('should return the correct response when account_id is valid', async () => {
//     const account_id = 594859325;

//     const mockResponse = {
//       status: 200,
//       meta: {
//         count: 1
//       },
//       json: jest.fn().mockResolvedValue({
//         data: {
//           [account_id]: [
//             {
//               achievements: [
//                 {
//                   tank_id: 123,
//                   mastery: {
//                     markOfMastery: 1,
//                     markOfMasteryI: 2,
//                     markOfMasteryII: 3,
//                     markOfMasteryIII: 4,
//                   }
//                 }
//               ],
//               listOfTanks: [
//                 {
//                   name: 'Tank 1',
//                   tank_id: 123,
//                   tier: 8,
//                   type: 'heavyTank',
//                   isPremium: true,
//                   hp: 1500,
//                   image: 'tank1.jpg'
//                 }
//               ],
//               tank_id: 123,
//               battle_life_time: 100,
//               last_battle_time: 1234567890,
//               all: {
//                 battles: 50,
//                 wins: 30,
//                 losses: 20,
//                 damage_dealt: 10000,
//                 damage_received: 5000,
//                 frags: 10,
//                 spotted: 15,
//                 survived_battles: 25,
//               },
//             },
//           ],
//         },
//       }),
//     };


//     const expectedResponse = {
//       status: true,
//       account_id: account_id,
//       data: [
//         {
//           name: 'Tank 1',
//           tank_id: 123,
//           tier: 8,
//           type: 'heavyTank',
//           isPremium: true,
//           hp: 1500,
//           image: 'tank1.jpg',
//           snapshots: [
//             {
//               battleLifeTime: 100,
//               lastBattleTime: 1234567890,
//               mastery: {
//                 markOfMastery: 1,
//                 markOfMasteryI: 2,
//                 markOfMasteryII: 3,
//                 markOfMasteryIII: 4,
//               },
//               regular: {
//                 battles: 50,
//                 wins: 30,
//                 losses: 20,
//                 damageDealt: 10000,
//                 damageReceived: 5000,
//                 frags: 10,
//                 spotted: 15,
//                 survivedBattles: 25,
//               },
//             },
//           ],
//         },
//       ],
//     };

//     fetch.mockResolvedValue(mockResponse);
//     const response = await postTanksSnapshots(account_id);

//     expect(response).toEqual(expectedResponse);
//   });


//   it('should return the correct response when account_id is invalid', async () => {
//     // Mock the response from the API
//     const mockStatsResponse = {
//       status: 'ok',
//       meta: {
//         count: 1
//       },
//       json: jest.fn().mockResolvedValue({
//         data: {
//           '1': null
//         },
//       }),
//     };

//     // Mock the fetch function to return the mock response
//     fetch.mockResolvedValueOnce(mockStatsResponse);

//     // Call the postTanksSnapshots function
//     const result = await postTanksSnapshots(1);

//     // Assert the expected response
//     expect(result).toEqual({
//       status: false,
//       account_id: 1,
//       data: [],
//     });

//     // Verify that the fetch function was called with the correct URL
//     expect(fetch).toHaveBeenCalledWith(
//       `https://api.wotblitz.eu/wotb/tanks/stats/?application_id=${application_id}&account_id=1`
//     );
//   });
// });

// tests for postPlayerSnapshots:
describe('postPlayerSnapshots', () => {
  it('should return the correct response when account_id is valid', async () => {
    const account_id = 594859325;

    const mockResponse = {
      status: 200,
      meta: {
        count: 1
      },
      json: jest.fn().mockResolvedValue({
        data: {
          [account_id]: {
            achievements: {
              markOfMastery: 3,
              markOfMasteryI: 2,
              markOfMasteryII: 1,
              markOfMasteryIII: 0,
            },
            created_at: 1621475297,
            nickname: 'Danil2205_',
            account_id: account_id,
            last_battle_time: 1234567890,
            statistics: {
              all: {
                battles: 100,
                wins: 70,
                losses: 30,
                damage_dealt: 20000,
                damage_received: 10000,
                survived_battles: 50,
                spotted: 30,
                frags: 40,
              },
              rating: {
                battles: 50,
                wins: 35,
                damage_dealt: 15000,
              },
            },
          },
        },
      }),
    };

    const expectedResponse = {
      success: true,
      data: {
        createdAt: 1621475297,
        name: 'Danil2205_',
        accountId: account_id,
        snapshots: [
          {
            lastBattleTime: 1234567890,
            regular: {
              battles: 100,
              wins: 70,
              losses: 30,
              damageDealt: 20000,
              damageReceived: 10000,
              survivedBattles: 50,
              spotted: 30,
              frags: 40,
            },
            rating: {
              battles: 50,
              wins: 35,
              damageDealt: 15000,
            },
            mastery: {
              markOfMastery: 3,
              markOfMasteryI: 2,
              markOfMasteryII: 1,
              markOfMasteryIII: 0,
            },
          },
        ],
      },
    };

    fetch.mockResolvedValue(mockResponse);
    const response = await postPlayerSnapshots(account_id);

    expect(response).toEqual(expectedResponse);
  });

  it('should return the correct response when account_id is invalid', async () => {
    const account_id = 123456789;

    const mockResponse = {
      status: 200,
      json: jest.fn().mockResolvedValue({
        data: {
          '123456789': null,
        },
      }),
    };

    fetch.mockResolvedValue(mockResponse);

    const expectedResponse = {
      success: false,
      data: {},
    };

    const response = await postPlayerSnapshots(account_id);

    expect(response).toEqual(expectedResponse);
  });

  it('should handle errors and log them to the console', async () => {
    const account_id = 594859325;
    fetch.mockRejectedValue(new Error('Network error'));
    const response = await postPlayerSnapshots(account_id);

    expect(response).toBeUndefined();

    expect(fetch).toHaveBeenCalledWith(
      `https://api.wotblitz.eu/wotb/account/info/?application_id=${application_id}&account_id=${account_id}&extra=statistics.rating`
    );
  
    expect(console.error).toHaveBeenCalledWith(new Error('Network error'));
  });
});
