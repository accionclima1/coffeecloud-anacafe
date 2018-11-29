var mongoose = require('mongoose');

var UnitSchema = new mongoose.Schema({
    PouchDBId: String,
    LastUpdatedDateTime: Number,
    EntityType:String,
    isSync: Boolean,
    isDeleted: Boolean,
    nombre: String,
    altitud: String,
    departamento: String,
    municipio: String,
    ubicacion: String,
    areaTotal: String,
    areaCafe: String,
    lote: { type: Array, "default": [] },
    variedad: { type: Array, "default": [] },
    typeOfCoffeProducessOptionSelected: { type: Array, "default": [] },
    typeOfSourceWaterOptionSelected: { type: Array, "default": [] },
    typeOfPodaOptionSelected: { type: Array, "default": [] },
    distanciamiento: String,
    distanciamientoAvenida: String,
    distanciamientoCalle: String,
    sombra: Boolean,
    certificadoorganico: Boolean,
    muestreo: Boolean,
    muestreoMes: { type: Array, "default": [] },
    fertilizaSuelo: Boolean,
    fertilizaSueloMes: { type: Array, "default": [] },
    fertilizaFollaje: Boolean,
    fertilizaFollajeMes: { type: Array, "default": [] },
    enmiendasSuelo: Boolean,
    enmiendasSueloMes: { type: Array, "default": [] },
    manejoTejido: Boolean,
    manejoTejidoMes: { type: Array, "default": [] },
    fungicidasRoya: Boolean,
    fungicidas: {
        contacto: Boolean,
        biologico: Boolean,
        sistemico: Boolean,
        bourbon: Boolean,
        catuai: Boolean,
        contactoOptionsMonths: {
            caldovicosa: { type: Array, "default": [] },
            caldobordeles: { type: Array, "default": [] },
            otrocual: { type: Array, "default": [] },
        },
        contactoOptions: {
            caldovicosa: Boolean,
            caldobordeles: Boolean,
            otrocual: Boolean,
            cual: String,
        },
        biologicalOptionsMonths: {
            verticiliumlecanii: { type: Array, "default": [] },
            bacilussutillis: { type: Array, "default": [] },
            otrocual: { type: Array, "default": [] },
        },
        biologicalOptions: {
            verticiliumlecanii: Boolean,
            bacilussutillis: Boolean,
            otrocual: Boolean,
            cual: String,
        },

        sistemicoOptionsMonths: {
            opus: { type: Array, "default": [] },
            opera: { type: Array, "default": [] },
            esferamax: { type: Array, "default": [] },
            amistarxtra: { type: Array, "default": [] },
            alto10: { type: Array, "default": [] },
            silvacur: { type: Array, "default": [] },
            verdadero: { type: Array, "default": [] },
            otrocual: { type: Array, "default": [] },
            mancuerna: { type: Array, "default": [] },
            caporal: { type: Array, "default": [] },
            halt: { type: Array, "default": [] },
            astrostarxtra: { type: Array, "default": [] },
            tutela: { type: Array, "default": [] },
            halconextra: { type: Array, "default": [] },
            beken: { type: Array, "default": [] },
            estrobirulina: { type: Array, "default": [] },
            otro: { type: Array, "default": [] }
        },
        sistemicoOptions: {
            opus: Boolean,
            opera: Boolean,
            esferamax: Boolean,
            amistarxtra: Boolean,
            alto10: Boolean,
            silvacur: Boolean,
            verdadero: Boolean,
            otrocual: Boolean,
            mancuerna: Boolean,
            caporal: Boolean,
            halt: Boolean,
            astrostarxtra: Boolean,
            tutela: Boolean,
            halconextra: Boolean,
            beken: Boolean,
            estrobirulina: Boolean,
            otro: Boolean,
            cual: String,
        }
    },
    newFungicidas: { type: Object, "default": {} },
    fungicidasFechas: String,
    verificaAgua: Boolean,
    verificaAguaTipo: {
        ph: Boolean,
        dureza: Boolean,
    },
    rendimiento: String,
    rendimientoAnterior: String,
    floracionPrincipal: String,
    inicioCosecha: String,
    finalCosecha: String,
    epocalluviosa: String,
    FinEpocalluviosa: String,
    recomendaciontecnica: String,
    nitrogeno: Boolean,
    nitrorealiza: { type: Array, "default": [] },
    sacos: String,
    realizapoda: Boolean,
    realizamonth: String,
    quetipo: String,
    enfermedades: Boolean,
    cyprosol: Boolean,
    cyprosoldate: String,
    atemi: Boolean,
    atemidate: String,
    esfera: Boolean,
    esferadate: String,
    opera: Boolean,
    operadate: String,
    opus: Boolean,
    opusdate: String,
    soprano: Boolean,
    sopranodate: String,
    hexalon: Boolean,
    hexalondate: String,
    propicon: Boolean,
    propicondate: String,
    hexil: Boolean,
    hexildate: String,
    otros: String,
    otrosdate: String,
    fungicidasmonth: String,
    realizamanejoTejidoMes: String,
    produccionhectarea: String,
    tipoCafe: {
        estrictamenteDuro: Boolean,
        duro: Boolean,
        semiduro: Boolean,
        prime: Boolean,
        extraprime: Boolean
    },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
},
{
    timestamps: true
});

mongoose.model('Unit', UnitSchema);
