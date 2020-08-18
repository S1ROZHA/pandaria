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

const admin = new Scene('admin');

admin.enter(async (ctx) => {
  await ctx.replyWithMarkdown('Главное меню', mainKeyboard);
});
admin.hears('Новый заказ', async (ctx) => await ctx.scene.enter('createOrder'));
admin.hears('Статистика', async (ctx) => await ctx.scene.enter('stats'));
admin.hears('Редактировать', async (ctx) => await ctx.scene.enter('editScene'));
admin.hears('Добавить', async (ctx) => await ctx.scene.enter('addScene'));
admin.hears('Удалить', async (ctx) => await ctx.scene.enter('deleteScene'));

module.exports = admin;
