var mongoose = require('mongoose');

var GalloSchema = new mongoose.Schema({
	advMode:Boolean,
	bandolas:Boolean,
	resolved:Boolean,
	user:String,
	plantas:[],
	unidad:{},
	idunidad: Number,
	loteIndex:Number,
	incidencia: Number,
	inideanciaPromedioPlanta: Number,
	severidadPromedio: Number
},
{
    timestamps: true
});

mongoose.model('Gallo', GalloSchema);
