const { Schema, model, Types } = require('mongoose');

const schema = new Schema({
  name: {
    type: String,
    required: true,
  },
  size: {
    type: Number,
    default: null,
  },
  sizePortion: {
    type: Number,
    default: null,
  },
  count: {
    type: Number,
    default: null,
  },
  price: {
    type: Number,
    required: true,
  },
});

module.exports = model('Additive', schema, 'additives');
