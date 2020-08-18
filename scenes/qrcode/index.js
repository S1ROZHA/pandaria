const QRCode = require('qrcode');
const Markup = require('telegraf/markup');
const Stage = require('telegraf/stage');
const WizardScene = require('telegraf/scenes/wizard');
const Composer = require('telegraf/composer');
const session = require('telegraf/session');
const { log } = require('telegraf/composer');
const { enter } = Stage;

const moment = require('moment');

const stepHandler = new Composer();

const User = require('../../models/user');
const Order = require('../../models/order');

const registrationKeyboard = Markup.keyboard([Markup.contactRequestButton('Зарегаться')])
  .oneTime()
  .resize()
  .extra();

const qrcode = new WizardScene('qrcode', async (ctx) => {
  const { state } = ctx.scene.session;
  const user = await User.findOne({ userId: ctx.startPayload });

  if (!user) {
    await ctx.reply(`Данный юзер не зарегистрирован`);
    return ctx.scene.enter('admin');
  }

  const order = await Order.find({ userId: ctx.startPayload });

  if (order.length % 6 == 0 && order.length > 0) {
    ctx.reply(`Данный напиток выбрать бесплатно`);
    ctx.telegram.sendMessage(ctx.startPayload, `Этот напиток для вас бесплатный`);
    return ctx.scene.enter('createOrder', { userId: ctx.startPayload, isFree: true });
  }

  if (order.length % 5 == 0 && order.length > 0) {
    ctx.telegram.sendMessage(ctx.startPayload, `Следующий напиток будет для вас бесплатным`);
    return ctx.scene.enter('createOrder', { userId: ctx.startPayload, isFree: false });
  }

  if (order.length % 4 == 0 && order.length > 0) {
    ctx.telegram.sendMessage(ctx.startPayload, `Ещё 2 напитка и 6-й будет бесплатным`);
    return ctx.scene.enter('createOrder', { userId: ctx.startPayload, isFree: false });
  }

  if (order.length % 3 == 0 && order.length > 0) {
    ctx.telegram.sendMessage(ctx.startPayload, `Ещё 3 напитка и 6-й будет бесплатным`);
    return ctx.scene.enter('createOrder', { userId: ctx.startPayload, isFree: false });
  }

  if (order.length % 2 == 0 && order.length > 0) {
    ctx.telegram.sendMessage(ctx.startPayload, `Ещё 4 напитка и 6-й будет бесплатным`);
    return ctx.scene.enter('createOrder', { userId: ctx.startPayload, isFree: false });
  }

  if (order.length % 1 == 0 && order.length > 0) {
    ctx.telegram.sendMessage(ctx.startPayload, `Ещё 5 напитков и 6-й будет бесплатным`);
    return ctx.scene.enter('createOrder', { userId: ctx.startPayload, isFree: false });
  }

  if (order.length === 0) {
    ctx.telegram.sendMessage(ctx.startPayload, `Привет, это твой первый напиток у нас!`);
    return ctx.scene.enter('createOrder', { userId: ctx.startPayload, isFree: false });
  }

  await ctx.scene.enter('createOrder', { userId: ctx.startPayload, isFree: false });
});

module.exports = qrcode;
