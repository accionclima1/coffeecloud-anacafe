var mongoose = require('mongoose');

var EncuestaSchema = new mongoose.Schema({
    PouchDBId: String,
    LastUpdatedDateTime: Number,
    EntityType:String,
    isSync: Boolean,
    isDeleted: Boolean,
    unidad: String,
    createdAt: Date,
    preguntas: { type: Array, "default": [] },
    resumenVulne: {type: Array},

    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
},
{ toJSON: { virtuals: true } },
{
    timestamps: true
}
);

EncuestaSchema.virtual('myunit', {
    ref: 'Unit', // The model to use
    localField: 'unidad', // Find people where `localField`
    foreignField: 'PouchDBId' // is equal to `foreignField`
    // If `justOne` is true, 'members' will be a single doc as opposed to
    // an array. `justOne` is false by default.
    //justOne: false,
    //options: { sort: { name: -1 }, limit: 5 } // Query options, see http://bit.ly/mongoose-query-options
  });

mongoose.model('Encuesta', EncuestaSchema);
