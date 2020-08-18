require('dotenv').config();

const mongoose = require('mongoose');

const { Telegraf } = require('telegraf');
const session = require('telegraf/session');
const Stage = require('telegraf/stage');

const admin = require('./scenes/admin');
const qrcode = require('./scenes/qrcode');
const user = require('./scenes/user');

const stats = require('./scenes/stats');

const createOrder = require('./scenes/createOrder');

const addScene = require('./scenes/add');
const addCup = require('./scenes/add/addCup');
const addStock = require('./scenes/add/addStock');
const addDrink = require('./scenes/add/addDrink');
const addCategory = require('./scenes/add/addCategory');

const editScene = require('./scenes/edit');

const deleteScene = require('./scenes/delete');
const deleteDrink = require('./scenes/delete/deleteDrink');
const deleteStock = require('./scenes/delete/deleteStock');
const deleteCategory = require('./scenes/delete/deleteCategory');

const MONGODB_URL = process.env.MONGODB_URL;
const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;

const admins = [158742819, 286345380, 373648962, 286139810];

mongoose.connect(MONGODB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
});

mongoose.connection.once('open', () => {
  console.log('Mongoose Connected');

  const bot = new Telegraf(TELEGRAM_TOKEN);
  const stage = new Stage([
    user,
    admin,
    qrcode,
    stats,
    addCup,
    addScene,
    addStock,
    addDrink,
    addCategory,
    createOrder,
    editScene,
    deleteScene,
    deleteDrink,
    deleteStock,
    deleteCategory,
  ]);

  bot.use(session());
  bot.use(stage.middleware());

  bot.start(async (ctx) => {
    let userId = ctx.message.from.id;
    let admin = admins.includes(userId);

    if (admin && !ctx.startPayload) return ctx.scene.enter('admin');
    if (admin && ctx.startPayload) return ctx.scene.enter('qrcode');

    ctx.scene.enter('user');
  });

  bot.launch();
});

mongoose.connection.on('error', function (err) {
  console.log('Mongoose connection error: ' + err);
});

mongoose.connection.on('disconnected', function () {
  console.log('Mongoose connection disconnected');
});
