'use strict';
const { getVehicleStats, fetchPlayerStats, fetchAllPlayerStats, application_id } = require('./serverStatistic.js');
const fetch = require('node-fetch');
const accountId = 594859325;

jest.mock('node-fetch');

describe('getVehicleStats', () => {
  it('should return the vehicle stats for the specified account_id', async () => {
    const mockStatsResponse = {
      status: 200,
      json: jest.fn().mockResolvedValueOnce({
        data: {
          [accountId]: [
            {
              tank_id: 123,
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
              battle_life_time: 100,
            }
          ]
        }
      })
    };

    const mockAchievementsResponse = {
      status: 200,
      json: jest.fn().mockResolvedValueOnce({
        data: {
          [accountId]: [
            {
              tank_id: 123,
              achievements: {
                markOfMastery: 3,
                markOfMasteryI: 2,
                markOfMasteryII: 1,
                markOfMasteryIII: 0,
              },
            }
          ]
        }
      })
    };

    const expectedStats = [
      {
        wotId: 123,
        regular: {
          battles: 100,
          wins: 70,
          losses: 30,
          damage_dealt: 20000,
          damage_received: 10000,
          frags: 40,
          spotted: 30,
          survived_battles: 50,
        },
        battleLifeTime: 100,
        mastery: {
          markOfMastery: 3,
          markOfMasteryI: 2,
          markOfMasteryII: 1,
          markOfMasteryIII: 0,
        },
      }
    ];

    fetch.mockResolvedValueOnce(mockStatsResponse)
      .mockResolvedValueOnce(mockAchievementsResponse);
    const stats = await getVehicleStats(accountId);

    expect(stats).toEqual(expectedStats);
  });

  it('should return undefined when account_id is not found in the responses', async () => {
    const accountId = 1;
    const mockStatsResponse = {
      status: 200,
      json: jest.fn().mockResolvedValueOnce({
        data: {
          [accountId]: null
        }
      })
    };

    const mockAchievementsResponse = {
      status: 200,
      json: jest.fn().mockResolvedValueOnce({
        data: {
          [accountId]: null
        }
      })
    };

    fetch.mockResolvedValueOnce(mockStatsResponse)
      .mockResolvedValueOnce(mockAchievementsResponse);
    const stats = await getVehicleStats(accountId);

    expect(stats).toBeUndefined();
  });

  it('should handle errors and log them to the console', async () => {
    const mockError = new Error('API request failed');
    console.error = jest.fn();
    fetch.mockRejectedValueOnce(mockError);

    const stats = await getVehicleStats(accountId);

    expect(stats).toBeUndefined();
    expect(console.error).toHaveBeenCalledWith(mockError);
  });
});