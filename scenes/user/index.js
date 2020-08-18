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

const registrationKeyboard = Markup.keyboard([Markup.contactRequestButton('Зарегистрироваться')])
  .oneTime()
  .resize()
  .extra();

const url = 'https://t.me/pandariabot/?start=';

const user = new WizardScene('user', async (ctx) => {
  let userId = ctx.message.from.id;

  const user = await User.findOne({ userId });
  if (!user)
    return await ctx.replyWithMarkdown(
      `Добро пожаловать в кофейню Pandaria\nЧто бы получать каждый 6-й напиток бесплатно - нажми на кнопку *Зарегистрироваться*`,
      registrationKeyboard,
    );

  ctx.reply(`Привет  ${user.firstName || ``}`);

  ctx.wizard.next();
});

user.on('contact', async (ctx) => {
  let userId = ctx.update.message.contact.user_id;
  const contact = {
    phoneNumber: ctx.update.message.contact.phone_number || null,
    firstName: ctx.update.message.contact.first_name || null,
    lastName: ctx.update.message.contact.last_name || null,
    userId: ctx.update.message.contact.user_id,
  };

  const user = await User.findOne({ userId: contact.userId });

  if (!user) {
    await User.create({
      userId: contact.userId,
      firstName: contact.firstName,
      lastName: contact.lastName,
      phoneNumber: contact.phoneNumber,
    });

    newUrl = url + userId.toString();

    const qrcode = await QRCode.toDataURL(newUrl);

    await ctx.replyWithPhoto({
      source: Buffer.from(qrcode.replace('data:image/png;base64,', ''), 'base64'),
    });

    return ctx.reply(`Покажи бариста этот QR код и получи каждый 6-й стакан кофе бесплатно`);
  }
});

module.exports = user;
