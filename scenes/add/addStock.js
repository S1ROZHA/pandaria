const Markup = require('telegraf/markup');
const Stage = require('telegraf/stage');
const WizardScene = require('telegraf/scenes/wizard');
const Composer = require('telegraf/composer');
const session = require('telegraf/session');
const { enter } = Stage;

const Stock = require('../../models/stock');

const stepHandler = new Composer();

const addStock = new WizardScene(
  'addStock',
  stepHandler,
  async (ctx) => {
    await ctx.replyWithMarkdown('Введите название');
    await ctx.wizard.next();
  },

  async (ctx) => {
    const { state } = ctx.scene.session;
    state.name = ctx.message.text;

    await ctx.reply(`Введи размер порции`);

    await ctx.wizard.next();
  },

  async (ctx) => {
    const { state } = ctx.scene.session;
    let portion = parseInt(ctx.message.text);

    if (!portion) {
      return ctx.reply(`Введите корректное число`);
    }

    state.portion = portion;

    await ctx.reply(`Введи цену за порцию`);

    await ctx.wizard.next();
  },

  async (ctx) => {
    const { state } = ctx.scene.session;
    let price = parseInt(ctx.message.text);

    if (!price) {
      return ctx.reply(`Введите корректное число`);
    }

    await Stock.create({
      name: state.name,
      portion: state.portion,
      price: price,
      count: 0,
    }).then(async (stock) => {
      await ctx.replyWithMarkdown(`Создан новый пункт *${stock.name}*`);
      await ctx.scene.enter('admin');
    });
  },
);

module.exports = addStock;
