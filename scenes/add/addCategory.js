const Markup = require('telegraf/markup');
const Stage = require('telegraf/stage');
const WizardScene = require('telegraf/scenes/wizard');
const Composer = require('telegraf/composer');
const session = require('telegraf/session');
const { enter } = Stage;

const Category = require('../../models/category');

const { log } = require('telegraf/composer');

const addCategory = new WizardScene(
  'addCategory',
  async (ctx) => {
    ctx.reply('Введи название категории');

    ctx.wizard.next();
  },

  async (ctx) => {
    let name = ctx.message.text;

    await Category.create({
      name: name,
    })
      .then((cup) => {
        ctx.replyWithMarkdown(`Создана новая категория : *${name}*`);
      })
      .catch((e) => {
        ctx.replyWithMarkdown(`Ошибка: *${e}*`);
      });

    ctx.scene.enter('admin');
  },
);

module.exports = addCategory;
