var mongoose = require('mongoose');

var MessageSchema = new mongoose.Schema({
  timestamps: { },
  timestamp: Date,
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reciber: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  bodyMsg: String,
  Msgattachement: String,
  read: false,
  sender_id: String,
  chat: { type: mongoose.Schema.Types.ObjectId, ref: 'Chat' }
});

mongoose.model('Message', MessageSchema);