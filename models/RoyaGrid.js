var mongoose = require('mongoose');

var RoyaGridSchema = new mongoose.Schema({
	advMode:Boolean,
	bandolas:Boolean,
	resolved:Boolean,
	user:String,
	plantas:[],
	unidad:{},
  loteIndex:Number,
	idunidad: Number,
	incidencia: Number,
	inideanciaPromedioPlanta: Number,
	severidadPromedio: Number,
	Departamento:String,
	Municipio:String
},
{
    timestamps: true
});

mongoose.model('RoyaGrid', RoyaSchema);
