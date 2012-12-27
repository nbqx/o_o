var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var codeSchema = new Schema({
  name: String,
  body: String
});

// middlewareぽくhookです afterにhookはpostみたいです
codeSchema.pre('init',function(next){
  // console.log('initされた');
  next();
});

codeSchema.pre('save',function(next){
  // console.log('save hookでうごくよ');
  next();
});

module.exports = function(db){
  return db.model('Code', codeSchema);
};

