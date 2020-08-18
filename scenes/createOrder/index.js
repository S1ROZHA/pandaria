const Markup = require('telegraf/markup');
const Stage = require('telegraf/stage');
const WizardScene = require('telegraf/scenes/wizard');
const Composer = require('telegraf/composer');
const session = require('telegraf/session');
const { enter } = Stage;

const { log } = require('telegraf/composer');

const Category = require('../../models/category');
const Drink = require('../../models/drink');
const Cup = require('../../models/cup');
const Stock = require('../../models/stock');
const Order = require('../../models/order');

const stepHandler = new Composer();

const getDrink = (drink) => {
  return Markup.keyboard([...drink.map((drink) => drink), 'Отмена'])
    .oneTime()
    .resize()
    .extra();
};

const getDrinkSizes = (coffee) => {
  return Markup.keyboard([[...coffee.map((coffee) => coffee.cup)], ['Отмена']])
    .oneTime()
    .resize()
    .extra();
};

const getCategoryKeyboard = (stock) => {
  return Markup.keyboard([[...stock.map((stock) => stock.name)], ['Отмена']])
    .oneTime()
    .resize()
    .extra();
};

const getStockKeyboard = (stock) => {
  return Markup.keyboard([...stock.map((stock) => stock.name), 'Готово'])
    .resize()
    .extra();
};

const finishOrder = async (ctx) => {
  const { state } = ctx.scene.session;
  let userId = ctx.message.from.id;

  let sum = await state.additives.reduce((total, additive) => {
    return total + additive.count * additive.additive.price;
  }, 0);

  await Cup.updateOne(
    { size: state.cup },
    {
      $inc: {
        count: -1,
      },
    },
  );

  await Drink.findOne({ name: state.drink, cup: state.cup }).then(async (drink) => {
    await drink.ingredients.map(async (ingredient) => {
      await Stock.updateOne(
        { name: ingredient.ingredient },
        {
          $inc: {
            count: -ingredient.value,
          },
        },
      );
    });

    await state.additives.map(async (additive) => {
      if (additive) {
        await Stock.updateOne(
          { name: additive.additive.name },
          {
            $inc: {
              count: -(additive.count * additive.additive.portion),
            },
          },
        );
      }
    });
  });

  await Order.create({
    drink: state.drink,
    size: state.cup,
    additives: state.additives,
    price: state.price + sum,
    userId: state.userId,
    isFree: state.isFree,
  }).then(async (order) => {
    if (order.additives.length == 0) {
      additives = ' - Пусто';
    } else {
      additives = order.additives
        .map((ingredient) => ` - ${ingredient.additive.name}: ${ingredient.count}`)
        .join('\n');
    }
    let isFree;
    if (state.isFree) {
      isFree = 'Бесплатный';
    } else {
      isFree = 'Наличка';
    }
    await ctx.replyWithMarkdown(
      `*Напиток:* ${order.drink}\n*Размер:* ${order.size}\n*Добавки:*\n${additives}\n*Цена:* ${order.price}\nОплата: ${isFree}`,
    );
  });

  await ctx.scene.enter('admin');
};

const createOrder = new WizardScene(
  'createOrder',
  stepHandler,
  async (ctx) => {
    const category = await Category.find();
    ctx.replyWithMarkdown('Выбери категорию', getCategoryKeyboard(category));

    ctx.wizard.next();
  },

  async (ctx) => {
    const { state } = ctx.scene.session;
    state.additives = [];
    let name = ctx.message.text;

    const category = await Category.find({ name: name });
    if (!category) return ctx.reply(`Выбери существующую категорию`);

    state.category = name;

    const drink = await Drink.find({ category: state.category }).distinct('name');

    await ctx.replyWithMarkdown('Выбери напиток', getDrink(drink));

    ctx.wizard.next();
  },

  async (ctx) => {
    const { state } = ctx.scene.session;
    let name = ctx.message.text;

    const drink = await Drink.find({ name: name });

    if (!drink) return ctx.reply(`Выбери существующий напиток`);

    state.drink = name;

    await ctx.replyWithMarkdown('Выбери размер', getDrinkSizes(drink));

    await ctx.wizard.next();
  },

  async (ctx) => {
    const { state } = ctx.scene.session;
    let cup = ctx.message.text;

    const drink = await Drink.findOne({ name: state.drink, cup: cup });

    if (!drink) return ctx.reply(`Выберите существующий стакан`);

    state.cup = cup;
    state.price = drink.price;

    const stock = await Stock.find();

    ctx.replyWithMarkdown(`Выбери добавки или нажми готово`, getStockKeyboard(stock));

    await ctx.wizard.next();
  },

  async (ctx) => {
    const { state } = ctx.scene.session;
    const name = ctx.message.text;

    const stock = await Stock.findOne({ name: name });

    if (!stock) return ctx.reply(`Выбери существуюший ингредиент`);

    state.additive = stock;

    await ctx.reply('Введите количество порций');

    await ctx.wizard.next();
  },

  async (ctx) => {
    const { state } = ctx.scene.session;

    const count = parseInt(ctx.message.text);

    if (!count) return ctx.reply('Введите корректное число');

    state.count = count;

    additive = state.additive;

    state.additives.push({ additive, count });

    await ctx.reply(`Добавлена добавка: ${state.additive.name}\nПорций: ${state.count}`);
    await ctx.wizard.back();
  },
);

createOrder.hears(/Готово/, async (ctx) => {
  const { state } = ctx.scene.session;
  if (state.isFree) return finishOrder(ctx);
  if (state.userId) return finishOrder(ctx);

  ctx.reply('Расчёт', Markup.keyboard(['Наличка', 'Бесплатно']).oneTime().resize().extra());

  await ctx.wizard.next().next();
});

createOrder.hears(/Наличка/, async (ctx) => {
  const { state } = ctx.scene.session;
  state.isFree = false;

  await finishOrder(ctx);
});

createOrder.hears(/Бесплатно/, async (ctx) => {
  const { state } = ctx.scene.session;
  state.isFree = true;

  await finishOrder(ctx);
});

createOrder.hears(/Отмена/, async (ctx) => {
  await ctx.scene.enter('admin');
});

module.exports = createOrder;
