'use strict';

const isSameDay = (timestamp1, timestamp2) => {
  const correctTime1 = new Date(timestamp1 * 1000);
  const correctTime2 = new Date(timestamp2 * 1000);
  return correctTime1.toDateString() === correctTime2.toDateString();
};

module.exports = {
  isSameDay
};