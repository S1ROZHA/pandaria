const Markup = require('telegraf/markup');
const Stage = require('telegraf/stage');
const WizardScene = require('telegraf/scenes/wizard');
const Composer = require('telegraf/composer');
const session = require('telegraf/session');
const { log } = require('telegraf/composer');
const { enter } = Stage;

const moment = require('moment');

const stepHandler = new Composer();

const Orders = require('../../models/order');

const addKeyboard = Markup.keyboard([
  ['Сегодня', 'Вчера', 'Неделя', 'Месяц', 'Всё время'],
  ['Отмена'],
])
  .resize()
  .extra();

const stats = new WizardScene(
  'stats',
  stepHandler,
  (ctx) => {
    ctx.replyWithMarkdown('Выбери за какой промежуток показать статистику', addKeyboard);
    ctx.wizard.next();
  },

  new Composer(
    Composer.hears(/Сегодня/, stepHandler, async (ctx) => {
      let start = moment().startOf('day').format();
      let end = moment().endOf('day').format();

      const orders = await Orders.find({ isFree: false, data: { $gte: start, $lt: end } });

      if (!orders) return ctx.reply(`Сегодня не было продаж.`);

      const earnings = orders.reduce((total, order) => {
        return total + order.price;
      }, 0);

      await ctx.replyWithMarkdown(
        `Статистика за сегодня:\nКоличество продаж: ${orders.length}\nСумма выручки: ${earnings}`,
      );
    }),

    Composer.hears(/Вчера/, stepHandler, async (ctx) => {
      let start = moment().subtract(1, 'day').startOf('day').format();
      let end = moment().subtract(1, 'day').endOf('day').format();

      const orders = await Orders.find({ isFree: false, data: { $gte: start, $lt: end } });

      if (!orders) return ctx.reply(`Сегодня не было продаж.`);

      const earnings = orders.reduce((total, order) => {
        return total + order.price;
      }, 0);

      await ctx.replyWithMarkdown(
        `Статистика за сегодня:\nКоличество продаж: ${orders.length}\nСумма выручки: ${earnings}`,
      );
    }),

    Composer.hears(/Неделя/, stepHandler, async (ctx) => {
      let start = moment().startOf('isoweek').format();
      let end = moment().endOf('day').format();

      const orders = await Orders.find({ isFree: false, data: { $gte: start, $lt: end } });

      if (!orders) return ctx.reply(`Сегодня не было продаж.`);

      const earnings = orders.reduce((total, order) => {
        return total + order.price;
      }, 0);

      await ctx.replyWithMarkdown(
        `Статистика за сегодня:\nКоличество продаж: ${orders.length}\nСумма выручки: ${earnings}`,
      );
    }),

    Composer.hears(/Месяц/, stepHandler, async (ctx) => {
      let start = moment().startOf('month').format();
      let end = moment().endOf('day').format();

      const orders = await Orders.find({ isFree: false, data: { $gte: start, $lt: end } });

      if (!orders) return ctx.reply(`Сегодня не было продаж.`);

      const earnings = orders.reduce((total, order) => {
        return total + order.price;
      }, 0);

      await ctx.replyWithMarkdown(
        `Статистика за сегодня:\nКоличество продаж: ${orders.length}\nСумма выручки: ${earnings}`,
      );
    }),

    Composer.hears(/Всё время/, stepHandler, async (ctx) => {
      const orders = await Orders.find({ isFree: false });

      if (!orders) return ctx.reply(`Сегодня не было продаж.`);

      const earnings = orders.reduce((total, order) => {
        return total + order.price;
      }, 0);

      await ctx.replyWithMarkdown(
        `Статистика за сегодня:\nКоличество продаж: ${orders.length}\nСумма выручки: ${earnings}`,
      );
    }),

    Composer.hears(/Отмена/, stepHandler, async (ctx) => {
      await ctx.scene.enter('admin');
    }),
  ),
);

module.exports = stats;
