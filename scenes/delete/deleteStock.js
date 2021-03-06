const Markup = require('telegraf/markup');
const Stage = require('telegraf/stage');
const WizardScene = require('telegraf/scenes/wizard');
const Composer = require('telegraf/composer');
const session = require('telegraf/session');
const { enter } = Stage;

const { log } = require('telegraf/composer');

const Stock = require('../../models/stock');

const stepHandler = new Composer();

const getStockKeyboard = (stock) => {
  return Markup.keyboard([...stock.map((stock) => stock.name), 'Отмена'])
    .oneTime()
    .resize()
    .extra();
};

const deleteStock = new WizardScene(
  'deleteStock',
  stepHandler,
  async (ctx) => {
    const stock = await Stock.find();
    ctx.replyWithMarkdown('Выбери ингредиент который нужно удалить.', getStockKeyboard(stock));

    ctx.wizard.next();
  },

  async (ctx) => {
    const { state } = ctx.scene.session;
    state.name = ctx.message.text;

    await Stock.deleteOne({ name: state.name });

    ctx.reply(`Удалён ингредиент ${state.name}`);

    await ctx.scene.enter('admin');
  },
);

deleteStock.hears(/Отмена/, async (ctx) => {
  await ctx.scene.enter('admin');
});

module.exports = deleteStock;
