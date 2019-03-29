var mongoose = require('mongoose');

var SupportDetailSchema = new mongoose.Schema({
  timestamp: Date,
  sender: String,
  receiver:String,
  message: String,
  attachment: String,
  support_head_id:{ type: mongoose.Schema.Types.ObjectId, ref: 'Support_Head'}
});

mongoose.model('Support_Detail', SupportDetailSchema);
