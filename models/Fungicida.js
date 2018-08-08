var mongoose = require('mongoose');

var fungicidaSchema = new mongoose.Schema({
	name: String
});

mongoose.model('Fungicida', fungicidaSchema);
