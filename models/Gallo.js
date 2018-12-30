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
	severidadPromedio: Number,
	createdAt: Date
},
{
	 toJSON: { virtuals: true },  timestamps: true
});

GalloSchema.virtual('myunit', {
    ref: 'Unit', // The model to use
    localField: 'idunidad', // Find people where `localField`
    foreignField: 'PouchDBId' // is equal to `foreignField`
    // If `justOne` is true, 'members' will be a single doc as opposed to
    // an array. `justOne` is false by default.
    //justOne: false,
    //options: { sort: { name: -1 }, limit: 5 } // Query options, see http://bit.ly/mongoose-query-options
  });

mongoose.model('Gallo', GalloSchema);
