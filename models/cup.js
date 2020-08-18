const { Schema, model, Types } = require('mongoose');

const schema = new Schema({
  size: {
    type: String,
    required: true,
  },
  count: {
    type: Number,
    default: 0,
    required: true,
  },
});

module.exports = model('Cup', schema, 'cups');
