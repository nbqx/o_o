var mongoose = require('mongoose');
var uri = process.env.MONGOHQ_URL || 'mongodb://localhost/mydata';
var db = mongoose.connect(uri);

module.exports = {
  Code: require('./code')(db)
};