const Markup = require('telegraf/markup');
const Stage = require('telegraf/stage');
const WizardScene = require('telegraf/scenes/wizard');
const Composer = require('telegraf/composer');
const session = require('telegraf/session');
const { enter } = Stage;

const Stock = require('../../models/stock');
const Drink = require('../../models/drink');

const { log } = require('telegraf/composer');

const stepHandler = new Composer();

const getStockKeyboard = (stock) => {
  return Markup.keyboard([...stock.map((stock) => stock.name), 'Готово'])
    .oneTime()
    .resize()
    .extra();
};

const getSizeKeyboard = (size) => {
  return Markup.keyboard([...size.map((size) => size.name), 'Готово'])
    .oneTime()
    .resize()
    .extra();
};

const addDrink = new WizardScene(
  'addDrink',
  stepHandler,
  (ctx) => {
    ctx.replyWithMarkdown('Введите название');

    ctx.wizard.next();
  },

  async (ctx) => {
    const name = ctx.message.text;
    const findName = await Drink.findOne({ name: name });

    if (!findName) {
    }
    ctx.scene.session.state.name = name;

    const stock = await Stock.find();
    ctx.session.stock = stock;

    await ctx.replyWithMarkdown(
      'Выберите из чего состоит напиток',
      getStockKeyboard(ctx.session.stock),
    );

    ctx.wizard.next();
  },

  async (ctx) => {
    const name = ctx.message.text;
    ctx.scene.session.state.name = name;

    const stock = await Stock.find();
    ctx.session.stock = stock;

    await ctx.replyWithMarkdown(
      'Выберите из чего состоит напиток',
      getStockKeyboard(ctx.session.stock),
    );

    ctx.wizard.next();
  },

  (ctx) => {
    const { state } = ctx.scene.session;

    const value = parseInt(ctx.message.text);

    if (!value) {
      return ctx.reply('Введите корректное число');
    }

    ctx.wizard.back();
  },
);

module.exports = addDrink;
