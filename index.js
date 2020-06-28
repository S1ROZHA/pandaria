const mongoose = require('mongoose');

const { Telegraf } = require('telegraf');
const session = require('telegraf/session');
const Stage = require('telegraf/stage');

const main = require('./scenes/main');

//const stats = require('./scenes/stats');

//const createOrder = require('./scenes/createOrder');

const addScene = require('./scenes/add/addScene');
const addDrink = require('./scenes/add/addDrink');
const addStock = require('./scenes/add/addStock');
const addAdditive = require('./scenes/add/addAdditive');

//const editDrink = require('./scenes/edit/editDrink');
//const editStock = require('./scenes/edit/editStock');
//const editAdditive = require('./scenes/edit/editAdditive');

//const deleteDrink = require('./scenes/delete/deleteDrink');
//const deleteStock = require('./scenes/delete/deleteStock');
//const deleteAdditive = require('./scenes/delete/deleteAdditive');

const mongoUrl =
  'mongodb+srv://s1rozha:TF7GRgWkj5ZljaBJ@cluster0-p8rqe.mongodb.net/pandaria?retryWrites=true&w=majority';

mongoose.connect(mongoUrl, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
});

mongoose.connection.once('open', () => {
  console.log('Mongoose Connected');

  const bot = new Telegraf('1217247332:AAGtm5M8rFCuX-r2bxJP9wtunOigNzfBsHw');
  const stage = new Stage([
    main,
    // stats,
    // createOrder,
    addScene,
    addStock,
    addDrink,
    addAdditive,
    // editScene,
    // editDrink,
    // editStock,
    // editAdditive,
    // deleteScene,
    // deleteDrink,
    // deleteStock,
    // deleteAdditive,
  ]);

  bot.use(session());
  bot.use(stage.middleware());

  bot.start((ctx) => ctx.scene.enter('main'));
  bot.launch();
});

mongoose.connection.on('error', function (err) {
  console.log('Mongoose connection error: ' + err);
});

mongoose.connection.on('disconnected', function () {
  console.log('Mongoose connection disconnected');
});
