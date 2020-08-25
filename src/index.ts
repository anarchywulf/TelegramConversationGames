import { Conf } from "./conf";
import * as fs from 'fs';
import * as Telegraf from 'telegraf';
import { Rather } from "./games/wouldYouRather/rather.bean";
import { GetGameFromString, Games } from "./games/service-factory";
import { Utils } from "./utils";
import { GeneralService } from "./bot";
import { CommandObject } from "./command-object";
import { RandomGame } from "./random-game";

const confPath = process.argv[2] || './conf';
const conf: Conf = JSON.parse(fs.readFileSync(confPath + '/conf.json', { encoding: 'UTF-8' }));
const bot = new Telegraf.default(conf.token);
const commandList: CommandObject[] = [];
GeneralService.bot = bot;

bot.catch((err) => {
  console.log('Ooops', err)
})

bot.start(showStart);
bot.command('about', ctx => ctx.reply('Bot made by Luis Mayo. Check it out on its Github page: https://github.com/LuisMayo/TelegramConversationGames'));


bot.command('fmk', ctx => ctx.reply('May you want to play /fmkguys or /fmkgirls ?'));
// bot.command('random', RandomGame.initFirstTimeMessage);

registerCommand('wouldyourather', Games.RATHER, 'rather')
registerCommand('neverhaveiever', Games.NEVER, 'never')
registerCommand('tod', Games.TOD)
registerCommand('truth', Games.TOD)
registerCommand('dare', Games.TOD)
registerCommand('fmkguys', Games.FMK, 'fmk')
registerCommand('fmkgirls', Games.FMK, 'fmk')
registerCommand('pressthebutton', Games.PRESSTHEBUTTON, 'pressTheButton')
RandomGame.initRandomHelper(commandList, processGameCommand);

// bot.action(/random.*/, RandomGame.processButtonChange);
bot.action(/.*/, Utils.executeCallback);
bot.use(RandomGame.randomCommand);

function processGameCommand(ctx: Telegraf.Context, game: Games) {
	const date = new Date();
    console.log('[' + date + '] New ' + game + ' command');
    GetGameFromString(game).getGameObject(ctx).then((data: Rather) => {
        data.sendMessage(ctx);
    }).catch((error: Error) => {
        ctx.reply('An error ocurred while trying to get the game\n' + error.name + ': ' +error.message);
    });
}

function registerCommand(command: string | string[], game: Games, callbackHandle?: string) {
    if (typeof command === 'string') {
        commandList.push({command: command, game: game});
    } else {
        for (const singleCommand of command) {
            commandList.push({command: singleCommand, game: game});
        }
    }
    bot.command(command, ctx => processGameCommand(ctx, game));
    if (callbackHandle) {
        Utils.registerHandler(callbackHandle, GetGameFromString(game).handleCallBack)
    }
}

function showStart(ctx: Telegraf.Context) {
    ctx.reply('Welcome to conversation games bot. Let\'s generate some conversation with your friends. Shall we?\n' +
    'Avaiable games:\n' +
    '/wouldyourather - Gimme a would you rather question\n'+
    '/neverhaveiever - Have you ever done this?\n'+
    '/fmk - Who do you want to fuck, marry and kill?\n'+
    '/tod - Play truth or dare\n'+
    '/truth - Only the "truth" questions of Truth or Dare\n'+
    '/dare - Only the dares\n'+
    '/pressTheButton - Would you press the button?');
}
bot.launch();
