var mongoose = require('mongoose');

var Support_HeadSchema = new mongoose.Schema({
  timestamp: Date,
  subject: String,
  sender: String,
  reciber: String,
  solved: Boolean,
  support_id:{ type: mongoose.Schema.Types.ObjectId}
});

mongoose.model('Support_Head', Support_HeadSchema);
