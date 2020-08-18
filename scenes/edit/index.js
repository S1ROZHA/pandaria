const Markup = require('telegraf/markup');
const Stage = require('telegraf/stage');
const WizardScene = require('telegraf/scenes/wizard');
const Composer = require('telegraf/composer');

const session = require('telegraf/session');
const { enter } = Stage;

const { log } = require('telegraf/composer');

const Stock = require('../../models/stock');
const Cup = require('../../models/cup');

const stepHandler = new Composer();

const getStockKeyboard = (stock) => {
  return Markup.keyboard([...stock.map((stock) => stock.name), 'Отмена'])
    .oneTime()
    .resize()
    .extra();
};

const editScene = new WizardScene(
  'editScene',
  stepHandler,
  async (ctx) => {
    const { state } = ctx.scene.session;

    const stock = await Stock.find();
    const cup = await Cup.find();

    let stocks = stock.map((stock) => `${stock.name}: ${stock.count}`).join('\n');
    let cups = cup.map((cup) => `${cup.size}: ${cup.count}`).join('\n');

    await ctx.replyWithMarkdown(`*Сейчас на складе:*\n${stocks}\n\n*Стаканчиков:*\n${cups}`);
    await ctx.replyWithMarkdown('Выбери ингредиент', getStockKeyboard(stock));

    await ctx.wizard.next();
  },

  async (ctx) => {
    const { state } = ctx.scene.session;
    const selectStock = ctx.message.text;
    state.selectStock = selectStock;

    const stock = await Stock.findOne({ name: state.selectStock });
    if (!stock) return ctx.reply(`Выбери существующий ингредиент`);

    await ctx.reply(`В данный момент ${stock.name}: ${stock.count}`);

    await ctx.reply('Введи сколько прибавить');

    await ctx.wizard.next();
  },

  async (ctx) => {
    const { state } = ctx.scene.session;
    const count = parseInt(ctx.message.text);

    if (!count) return ctx.reply('Введите корректное число');

    await Stock.updateOne(
      { name: state.selectStock },
      {
        $inc: {
          count: count,
        },
      },
    );

    const stock = await Stock.findOne({ name: state.selectStock });

    await ctx.reply(`Теперь ${state.selectStock}: ${stock.count}`);

    await ctx.scene.enter('admin');
  },
);

editScene.hears(/Отмена/, async (ctx) => {
  await ctx.scene.enter('admin');
});

module.exports = editScene;
