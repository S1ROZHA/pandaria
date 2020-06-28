const Markup = require('telegraf/markup');
const Stage = require('telegraf/stage');
const WizardScene = require('telegraf/scenes/wizard');
const Composer = require('telegraf/composer');
const session = require('telegraf/session');
const { enter } = Stage;

const Additive = require('../../models/additive');
const { log } = require('telegraf/composer');

const stepHandler = new Composer();

const addAdditive = new WizardScene(
  'addAdditive',
  stepHandler,
  (ctx) => {
    ctx.replyWithMarkdown('Введите название');

    ctx.wizard.next();
  },

  (ctx) => {
    let name = ctx.message.text;
    ctx.replyWithMarkdown('Выберите тип', {
      reply_markup: {
        keyboard: [['Порция', 'Объём']],
        resize_keyboard: true,
      },
    });
    ctx.scene.session.state.name = name;
    ctx.wizard.next();
  },

  new Composer(
    Composer.hears(/Порция/, (ctx) => {
      const { state } = ctx.scene.session;

      ctx.reply(`Введите цену за 1 порцию`);
      ctx.scene.session.state.count = 0;
      ctx.wizard.next().next();
    }),

    Composer.hears(/Объём/, (ctx) => {
      const { state } = ctx.scene.session;

      ctx.reply(`Введите размер 1 порции в мл.`);
      ctx.scene.session.state.size = 0;
      ctx.wizard.next();
    }),
  ),
  (ctx) => {
    const { state } = ctx.scene.session;

    ctx.scene.session.state.sizePortion = ctx.message.text;

    ctx.reply('Введите цену за 1 порцию');
    ctx.scene.session.state.price = ctx.message.text;
    ctx.wizard.next();
  },

  (ctx) => {
    const { state } = ctx.scene.session;

    let price = ctx.message.text;

    if (state.count == 0) {
      const additive = Additive.create({
        name: state.name,
        count: state.count,
        size: null,
        sizePortion: null,
        price: price,
      }).then((additive) => {
        ctx.reply(
          `Создан новый пункт *${additive.name}* в цену за одну порцию *${additive.price}*`,
          {
            parse_mode: 'Markdown',
          },
        );
      });
    }

    if (state.size == 0) {
      const additive = Additive.create({
        name: state.name,
        count: null,
        size: state.size,
        sizePortion: state.sizePortion,
        price: price,
      }).then((additive) => {
        ctx.reply(
          `Создан новый пункт *${additive.name}* в размере одной порции *${additive.sizePortion}* за цену *${additive.price}*`,
          {
            parse_mode: 'Markdown',
          },
        );
      });
    }

    ctx.scene.enter('main');
  },
);

module.exports = addAdditive;
