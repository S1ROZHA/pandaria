const Markup = require('telegraf/markup');
const Stage = require('telegraf/stage');
const WizardScene = require('telegraf/scenes/wizard');
const Composer = require('telegraf/composer');
const session = require('telegraf/session');
const { log } = require('telegraf/composer');
const { enter } = Stage;

const stepHandler = new Composer();

const addKeyboard = Markup.keyboard([['Напиток', 'Склад', 'Категорию'], ['Отмена']])
  .oneTime()
  .resize()
  .extra();

const deleteScene = new WizardScene(
  'deleteScene',
  stepHandler,
  (ctx) => {
    ctx.replyWithMarkdown('Что будем удалять?', addKeyboard);
    ctx.wizard.next();
  },

  new Composer(
    Composer.hears(/Напиток/, stepHandler, (ctx) => {
      ctx.scene.enter('deleteDrink');
    }),
    Composer.hears(/Склад/, stepHandler, (ctx) => {
      ctx.scene.enter('deleteStock');
    }),
    Composer.hears(/Категорию/, stepHandler, (ctx) => {
      ctx.scene.enter('deleteCategory');
    }),
  ),
);

deleteScene.hears(/Отмена/, async (ctx) => {
  await ctx.scene.enter('admin');
});

module.exports = deleteScene;
