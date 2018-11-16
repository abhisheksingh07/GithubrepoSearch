const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
 
 var  Search = require('./search');

// User Schema
const UserSchema = mongoose.Schema({
  username:{type:String, require:true, unique: true},
  email:{type:String,unique: true,require:true},
  password:String,
  search:[{ type:mongoose.Schema.Types.ObjectId, ref: 'Search'}],
  dateCreated:Date
});

const User = module.exports = mongoose.model('User', UserSchema);

module.exports.registerUser = function(newUser, callback){
  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(newUser.password, salt, (err, hash) => {
      if(err){
        console.log(err);
      }
      newUser.password = hash;
      newUser.save(callback);
    });
  });
}

module.exports.getUserByUsername = function(email, callback){
  const query = {email: email}
  User.findOne(query, callback);
}

module.exports.getUserById = function(id, callback){
  User.findById(id, callback);
}

module.exports.comparePassword = function(candidatePassword, hash, callback){
  bcrypt.compare(candidatePassword, hash, (err, isMatch) => {
    if(err) throw err;
    callback(null, isMatch);
  });
}
