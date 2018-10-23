var mongoose = require('mongoose');

var ChatSchema = new mongoose.Schema({
  timestamps: {  },
  timestamp: String,
  sender: String,
  reciber: String,
  read: false,
  chatid: String,
  messages: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Message' }]
});


mongoose.model('Chat', ChatSchema);