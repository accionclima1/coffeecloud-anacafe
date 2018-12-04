var mongoose = require('mongoose');

var ChatSchema = new mongoose.Schema({
  timestamps: {  },
  timestamp: String,
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reciber: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  read: false,
  chatid: String,
  messages: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Message' }]
});


mongoose.model('Chat', ChatSchema);