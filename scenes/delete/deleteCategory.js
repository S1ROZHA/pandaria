const Markup = require('telegraf/markup');
const Stage = require('telegraf/stage');
const WizardScene = require('telegraf/scenes/wizard');
const Composer = require('telegraf/composer');
const session = require('telegraf/session');
const { enter } = Stage;

const { log } = require('telegraf/composer');

const Category = require('../../models/category');

const stepHandler = new Composer();

const getCategoryKeyboard = (stock) => {
  return Markup.keyboard([...stock.map((stock) => stock.name), 'Отмена'])
    .oneTime()
    .resize()
    .extra();
};

const deleteCategory = new WizardScene(
  'deleteCategory',
  stepHandler,
  async (ctx) => {
    const category = await Category.find();
    ctx.replyWithMarkdown('Выбери категорию которую нужно удалить.', getCategoryKeyboard(category));

    ctx.wizard.next();
  },

  async (ctx) => {
    const { state } = ctx.scene.session;
    state.name = ctx.message.text;

    await Category.deleteOne({ name: state.name });

    ctx.reply(`Удалёна категория ${state.name}`);

    await ctx.scene.enter('admin');
  },
);

deleteCategory.hears(/Отмена/, async (ctx) => {
  await ctx.scene.enter('admin');
});

module.exports = deleteCategory;
