const Markup = require('telegraf/markup');
const Stage = require('telegraf/stage');
const WizardScene = require('telegraf/scenes/wizard');
const Composer = require('telegraf/composer');
const session = require('telegraf/session');
const { enter } = Stage;

const Cup = require('../../models/cup');

const { log } = require('telegraf/composer');

const stepHandler = new Composer();

const addCup = new WizardScene(
  'addCup',
  stepHandler,
  async (ctx) => {
    ctx.reply('Введи название');

    ctx.wizard.next();
  },

  async (ctx) => {
    let size = ctx.message.text;

    await Cup.create({
      size: size,
      count: 0,
    })
      .then((cup) => {
        ctx.replyWithMarkdown(`Создан новый стаканчик : *${cup.size}*`);
      })
      .catch((e) => {
        ctx.replyWithMarkdown(`Ошибка: *${e}*`);
      });

    ctx.scene.enter('admin');
  },
);

module.exports = addCup;
