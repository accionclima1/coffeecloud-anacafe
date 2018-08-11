var mongoose = require('mongoose');

var fungicidaSchema = new mongoose.Schema({
	categoria: String,
	fungicidas: { type: Array, "default": [] }
});

mongoose.model('Fungicida', fungicidaSchema);
