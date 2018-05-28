var mongoose = require('mongoose');

var varietySchema = new mongoose.Schema({
	name: String
});

mongoose.model('Variety', varietySchema);