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

const stepHandler = new Composer();

const getCategoryKeyboard = (category) => {
  return Markup.keyboard([[...category.map((category) => category.name)], ['Отмена']])
    .oneTime()
    .resize()
    .extra();
};

const getStockKeyboard = (stock) => {
  return Markup.keyboard([...stock.map((stock) => stock.name), 'Готово'])
    .oneTime()
    .resize()
    .extra();
};

const getCupKeyboard = (cup) => {
  return Markup.keyboard([[...cup.map((cup) => cup.size)], ['Отмена']])
    .oneTime()
    .resize()
    .extra();
};

const addDrink = new WizardScene(
  'addDrink',
  stepHandler,
  async (ctx) => {
    const { state } = ctx.scene.session;
    const category = await Category.find();

    state.cups = [];
    state.stocks = [];
    state.categorys = [];
    state.ingredients = [];

    category.map((item) => {
      state.categorys.push(item.name);
    });

    await ctx.replyWithMarkdown('Выбери категорию', getCategoryKeyboard(category));

    await ctx.wizard.next();
  },

  async (ctx) => {
    const { state } = ctx.scene.session;
    const category = ctx.message.text;

    if (!state.categorys.includes(category)) {
      return ctx.reply(`Выберите существующую категорию`);
    }

    state.category = category;

    await ctx.reply(`Выбрана категория ${state.category}`);
    await ctx.reply('Введи название напитка');

    await ctx.wizard.next();
  },

  async (ctx) => {
    const { state } = ctx.scene.session;
    const name = ctx.message.text;

    state.name = name;

    const cup = await Cup.find();

    cup.map((item) => {
      state.cups.push(item.size);
    });

    await ctx.replyWithMarkdown('Выбери стакан', getCupKeyboard(cup));

    await ctx.wizard.next();
  },

  async (ctx) => {
    const { state } = ctx.scene.session;
    const cup = ctx.message.text;

    if (!state.cups.includes(cup)) {
      return ctx.reply(`Выберите существующий стакан`);
    }

    const drink = await Drink.findOne({ name: state.name, cup: cup });

    if (drink) {
      return ctx.reply(`У напитка ${state.name} уже есть размер ${cup}`);
    }

    state.cup = cup;

    const stock = await Stock.find();

    stock.map((item) => {
      state.stocks.push(item.name);
    });

    if (state.ingredients.length !== 0) {
      ctx.replyWithMarkdown(`Текущие ингредиенты: ${state.ingredients}`);
    }

    await ctx.replyWithMarkdown('Выбери ингредиент', getStockKeyboard(stock));

    await ctx.wizard.next();
  },

  async (ctx) => {
    const { state } = ctx.scene.session;
    const ingredient = ctx.message.text;

    if (!state.stocks.includes(ingredient)) {
      return ctx.reply(`Выберите существующий ингредиент`);
    }

    let filter = state.ingredients.map((item) => item.ingredient);

    if (filter.includes(ingredient)) {
      return ctx.reply(`Данный ингредиент уже добавлен`);
    }

    state.ingredient = ingredient;

    await ctx.reply('Введите количество');

    await ctx.wizard.next();
  },

  async (ctx) => {
    const { state } = ctx.scene.session;

    const value = parseInt(ctx.message.text);

    if (!value) {
      return ctx.reply('Введите корректное число');
    }

    state.value = value;
    ingredient = state.ingredient;

    state.ingredients.push({ ingredient, value });

    await ctx.reply(`Добавлен ингредиент ${state.ingredient} в количестве ${state.value}`);
    await ctx.wizard.back();
  },

  async (ctx) => {
    const { state } = ctx.scene.session;

    price = ctx.message.text;

    if (!price) {
      return ctx.reply('Введите корректное число');
    }

    state.price = price;

    Drink.create({
      name: state.name,
      category: state.category,
      cup: state.cup,
      ingredients: state.ingredients,
      price: price,
    }).then((drink) => {
      ctx.replyWithMarkdown(
        `*Создан напиток:* ${drink.name}\n*Категория:* ${drink.category}\n*Стакан:* ${
          drink.cup
        }\n*Ингредиенты:*\n${drink.ingredients
          .map((ingredient) => `- ${ingredient.ingredient}: ${ingredient.value}`)
          .join('\n')}\n*Цена:* ${drink.price}`,
      );
      ctx.scene.enter('admin');
    });
  },
);

addDrink.hears(/Готово/, async (ctx) => {
  await ctx.reply('Введи цену напитка', Markup.removeKeyboard().extra());

  await ctx.wizard.next().next();
});

addDrink.hears(/Отмена/, async (ctx) => {
  await ctx.scene.enter('admin');
});

module.exports = addDrink;
