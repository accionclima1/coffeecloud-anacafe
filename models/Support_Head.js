var mongoose = require('mongoose');

var Support_HeadSchema = new mongoose.Schema({
  timestamp: Date,
  subject: String,
  sender: String,
  receiver: String,
  solved: Boolean
});

mongoose.model('Support_Head', Support_HeadSchema);
