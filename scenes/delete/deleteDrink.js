const Markup = require('telegraf/markup');
const Stage = require('telegraf/stage');
const WizardScene = require('telegraf/scenes/wizard');
const Composer = require('telegraf/composer');
const session = require('telegraf/session');
const { enter } = Stage;

const { log } = require('telegraf/composer');

const Category = require('../../models/category');
const Drink = require('../../models/drink');

const stepHandler = new Composer();

const getDrink = (drink) => {
  return Markup.keyboard([...drink, 'Отмена'])
    .oneTime()
    .resize()
    .extra();
};

const getDrinkSizes = (coffee) => {
  return Markup.keyboard([...coffee.map((coffee) => coffee.cup), 'Отмена'])
    .oneTime()
    .resize()
    .extra();
};

const getCategoryKeyboard = (stock) => {
  return Markup.keyboard([...stock.map((stock) => stock.name), 'Отмена'])
    .oneTime()
    .resize()
    .extra();
};

const deleteDrink = new WizardScene(
  'deleteDrink',
  stepHandler,
  async (ctx) => {
    const category = await Category.find();
    ctx.replyWithMarkdown('Выбери категорию', getCategoryKeyboard(category));

    ctx.wizard.next();
  },

  async (ctx) => {
    const { state } = ctx.scene.session;
    state.category = ctx.message.text;
    state.cups = [];

    const drink = await Drink.find({ category: state.category }).distinct('name');

    await ctx.replyWithMarkdown('Выбери напиток', getDrink(drink));

    ctx.wizard.next();
  },

  async (ctx) => {
    const { state } = ctx.scene.session;
    state.drink = ctx.message.text;

    const drink = await Drink.find({ name: state.drink });

    drink.map((item) => {
      state.cups.push(item.cup);
    });

    await ctx.replyWithMarkdown(
      'Выбери размер напитка который нужно удалить.\nПри удалении последнего размера, удаляется весь напиток.',
      getDrinkSizes(drink),
    );

    ctx.wizard.next();
  },

  async (ctx) => {
    const { state } = ctx.scene.session;
    state.cup = ctx.message.text;

    if (!state.cups.includes(state.cup)) {
      return ctx.reply(`Выберите существующий размер`);
    }

    await Drink.deleteOne({ name: state.drink, cup: state.cup });

    ctx.reply(`Удалён у ${state.drink} размер ${state.cup}`);

    await ctx.scene.enter('admin');
  },
);

deleteDrink.hears(/Отмена/, async (ctx) => {
  await ctx.scene.enter('admin');
});

module.exports = deleteDrink;
