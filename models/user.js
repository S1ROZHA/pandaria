const { Schema, model, Types } = require('mongoose');

const schema = new Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  number: {
    type: String,
    required: true,
  },
  qrcode: {
    type: String,
    require: true,
  },
  orders: Array,
});

module.exports = model('User', schema, 'users');
