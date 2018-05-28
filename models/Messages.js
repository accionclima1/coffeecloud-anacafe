var mongoose = require('mongoose');

var MessageSchema = new mongoose.Schema({
  timestamps: { },
  timestamp: String,
  sender: String,
  reciber: String,
  bodyMsg: String,
  Msgattachement: String,
  read: false,
  sender_id: String,
  chat: { type: mongoose.Schema.Types.ObjectId, ref: 'Chat' }
});

mongoose.model('Message', MessageSchema);