var mongoose = require('mongoose');

var widgetSchema = new mongoose.Schema({
	title : String,
	content : String,
	user : {type: mongoose.Schema.Types.ObjectId, ref: 'User'}
});

mongoose.model('Widget', widgetSchema);