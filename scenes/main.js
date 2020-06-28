const Markup = require('telegraf/markup');
const Stage = require('telegraf/stage');
const session = require('telegraf/session');
const Scene = require('telegraf/scenes/base');
const WizardScene = require('telegraf/scenes/wizard');
const { log } = require('telegraf/stage');

const { enter } = Stage;

const mainKeyboard = Markup.keyboard([
  ['Новый заказ'],
  ['Статистика'],
  ['Редактировать', 'Добавить', 'Удалить'],
])
  .oneTime()
  .resize()
  .extra();

const main = new Scene('main');

main.enter(async (ctx) => {
  await ctx.replyWithMarkdown('Выберите действие', mainKeyboard);
});
main.hears('Новый заказ', async (ctx) => await ctx.scene.enter('createOrder'));
main.hears('Статистика', async (ctx) => await ctx.scene.enter('stats'));
main.hears('Редактировать', async (ctx) => await ctx.scene.enter('editScene'));
main.hears('Добавить', async (ctx) => await ctx.scene.enter('addScene'));
main.hears('Удалить', async (ctx) => await ctx.scene.enter('deleteScene'));

module.exports = main;
