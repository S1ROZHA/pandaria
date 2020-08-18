const { Schema, model, Types } = require('mongoose');

const schema = new Schema({
  userId: {
    type: Number,
    required: true,
  },
  firstName: {
    type: String,
    default: null,
  },
  lastName: {
    type: String,
    default: null,
  },
  phoneNumber: {
    type: String,
    default: null,
  },
  qrcode: {
    type: String,
    require: true,
  },
});

module.exports = model('User', schema, 'users');
