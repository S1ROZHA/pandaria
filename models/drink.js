const { Schema, model, Types } = require('mongoose');

const schema = new Schema({
  name: {
    type: String,
    required: true,
  },
  size: {
    s: {
      recipe: {
        type: Array,
      },
      price: {
        type: Number,
        required: true,
      },
      default: null,
      required: false,
    },
    m: {
      recipe: {
        type: Array,
      },
      price: {
        type: Number,
        required: true,
      },
      default: null,
      required: false,
    },
    l: {
      recipe: {
        type: Array,
      },
      price: {
        type: Number,
        required: true,
      },
    },
    default: null,
    required: false,
  },
});

module.exports = model('Drink', schema, 'drinks');
