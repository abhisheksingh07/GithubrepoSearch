const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

const User = require('./users');


var SearchSchema = mongoose.Schema({
  UserId : { type:mongoose.Schema.Types.ObjectId, ref: 'User' },
  stuff    : String
});


const Search = module.exports = mongoose.model('Search', SearchSchema);
