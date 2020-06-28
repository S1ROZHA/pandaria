const Markup = require('telegraf/markup');
const Stage = require('telegraf/stage');
const WizardScene = require('telegraf/scenes/wizard');
const Composer = require('telegraf/composer');
const session = require('telegraf/session');
const { enter } = Stage;

const Stock = require('../../models/stock');

const stepHandler = new Composer();

const addStock = new WizardScene(
  'addStock',
  stepHandler,
  (ctx) => {
    ctx.replyWithMarkdown('Введите название');
    ctx.wizard.next();
  },

  (ctx) => {
    let name = ctx.message.text;
    ctx.replyWithMarkdown('Выберите тип', {
      reply_markup: {
        keyboard: [['Количество', 'Объём']],
        resize_keyboard: true,
      },
    });
    ctx.scene.session.state.name = name;
    ctx.wizard.next();
  },

  new Composer(
    Composer.hears(/Количество/, stepHandler, (ctx) => {
      const { state } = ctx.scene.session;

      const stock = Stock.create({
        name: state.name,
        count: 0,
      }).then((stock) => {
        ctx.reply(`Создан новый пункт *${stock.name}* в параметре количество`, {
          parse_mode: 'Markdown',
        });
        ctx.scene.enter('main');
      });
    }),

    Composer.hears(/Объём/, stepHandler, (ctx) => {
      const { state } = ctx.scene.session;

      const stock = Stock.create({
        name: state.name,
        size: 0,
      }).then((stock) => {
        ctx.reply(`Создан новый пункт *${stock.name}* в параметре размер`, {
          parse_mode: 'Markdown',
        });
        ctx.scene.enter('main');
      });
    }),
  ),
);

module.exports = addStock;
