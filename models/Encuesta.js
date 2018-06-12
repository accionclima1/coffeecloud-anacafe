var mongoose = require('mongoose');

var EncuestaSchema = new mongoose.Schema({
    PouchDBId: String,
    LastUpdatedDateTime: Number,
    EntityType:String,
    isSync: Boolean,
    isDeleted: Boolean,
    unidad: String,
    preguntas: { type: Array, "default": [] },
    resumenVulne: {type: Array},
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

mongoose.model('Encuesta', EncuestaSchema);
