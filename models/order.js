const { Schema, model, Types } = require('mongoose');

const schema = new Schema({
  number: {
    type: String,
    required: true,
  },
  drink: {
    type: String,
    required: true,
  },
  size: {
    type: Number,
    required: true,
  },
  additives: {
    type: Array,
    default: null,
  },
  isFree: {
    type: Boolean,
    default: false,
  },
  data: {
    type: Date,
    default: Date.now,
  },
});

module.exports = model('Order', schema, 'orders');
