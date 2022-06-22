'use strict';

const { Telegraf } = require('telegraf');
const { getAccountID, getAccessToken, getPublicInfo, getPrivateInfo } = require('./index');

const bot = new Telegraf('5496845376:AAH7zS__L_cnF2eHP3K93WB768lzgrN0vn8');
bot.start((ctx) => ctx.reply('Есть пробитие!'));

bot.command('accountID', async (ctx) => {
  try {
    const input = ctx.update.message.text.split(' ').slice(1).join('');
    const text = await getAccountID(input);
    await ctx.replyWithMarkdown(text);
  } catch (e) {
    console.log(e);
  }
})

bot.command('accessToken', async (ctx) => {
  try {
    const input = ctx.update.message.text.split(' ').slice(1).join('');
    const [email, password] = input.split(':')
    const text = await getAccessToken(email, password);
    await ctx.replyWithMarkdown(`Access Token: \`\`\`${text}\`\`\``);
  } catch (e) {
    console.log(e);
  }
})

bot.command('publicInfo', async (ctx) => {
  try {
    const input = ctx.update.message.text.split(' ').slice(1).join('');
    const text = await getPublicInfo(input);
    await ctx.reply(text.join('\n'));
  } catch (e) {
    console.log(e);
  }
})

bot.command('privateInfo', async (ctx) => {
  try {
    const input = ctx.update.message.text.split(' ').slice(1).join('');
    const [nick, email, password] = input.split(':')
    const publicInfo = await getPublicInfo(nick)
    const privateInfo = await getPrivateInfo(email, password);
    const playerInfo = await publicInfo.concat(privateInfo);
    await ctx.reply(playerInfo.join('\n'));
  } catch (e) {
    console.log(e);
  }
})

// bot.telegram.setMyCommands([
//   { command: '/start', description: 'To start bot' },
//   { command: '/accountID', description: 'Find account_id by nickname' },
// ]);

bot.launch();
