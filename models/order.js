const { Schema, model, Types } = require('mongoose');

const schema = new Schema({
  drink: {
    type: String,
    required: true,
  },
  size: {
    type: String,
    required: true,
  },
  additives: {
    type: Array,
    default: null,
  },
  price: {
    type: Number,
    required: true,
  },
  isFree: {
    type: Boolean,
    default: false,
  },
  userId: {
    type: Number,
    default: null,
  },
  data: {
    type: Date,
    default: Date.now,
  },
});

module.exports = model('Order', schema, 'orders');
