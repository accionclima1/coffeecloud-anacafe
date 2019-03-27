var mongoose = require('mongoose');

var SupportDetailSchema = new mongoose.Schema({
  timestamps: { },
  timestamp: Date,
  sender: String,
  reciber:String,
  message_body: String,
  attachment: String,
  support_head_id:{ type: mongoose.Schema.Types.ObjectId, ref: 'Support_Head'}
  //chat: { type: mongoose.Schema.Types.ObjectId, ref: 'Chat' }
});

mongoose.model('Support_Detail', SupportDetailSchema);
