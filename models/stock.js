const { Schema, model, Types } = require('mongoose');

const schema = new Schema({
  name: {
    type: String,
    required: true,
  },
  portion: {
    type: Number,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  count: {
    type: Number,
    required: true,
  },
});

module.exports = model('Stock', schema, 'stocks');
