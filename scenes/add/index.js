const Markup = require('telegraf/markup');
const Stage = require('telegraf/stage');
const WizardScene = require('telegraf/scenes/wizard');
const Composer = require('telegraf/composer');
const session = require('telegraf/session');
const { log } = require('telegraf/composer');
const { enter } = Stage;

const stepHandler = new Composer();

const addKeyboard = Markup.keyboard([['Склад', 'Напиток', 'Категорию', 'Стаканчик'], ['Отмена']])
  .oneTime()
  .resize()
  .extra();

const addScene = new WizardScene(
  'addScene',
  stepHandler,
  (ctx) => {
    ctx.replyWithMarkdown('Что будем добавлять?', addKeyboard);
    ctx.wizard.next();
  },

  new Composer(
    Composer.hears(/Склад/, stepHandler, (ctx) => {
      ctx.scene.enter('addStock');
    }),

    Composer.hears(/Напиток/, stepHandler, (ctx) => {
      ctx.scene.enter('addDrink');
    }),

    Composer.hears(/Категорию/, stepHandler, (ctx) => {
      ctx.scene.enter('addCategory');
    }),

    Composer.hears(/Стаканчик/, stepHandler, (ctx) => {
      ctx.scene.enter('addCup');
    }),
  ),
);

addScene.hears(/Отмена/, async (ctx) => {
  await ctx.scene.enter('admin');
});

module.exports = addScene;
