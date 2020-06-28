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
  count: {
    type: Number,
    default: null,
  },
});

module.exports = model('Stock', schema, 'stocks');
