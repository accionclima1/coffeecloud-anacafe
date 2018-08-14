var mongoose = require('mongoose');

require('./models/Posts');
require('./models/Comments');
require('./models/Users');
var Unit = require('./models/Units');
require('./models/Fungicida');

require('./config/passport'); mongoose.connect('mongodb://cafenube:Sec03lP1nt0@163.172.154.223/dummyDB', {
  server: {
    socketOptions: {
      socketTimeoutMS: 0,
      connectionTimeout: 0
    }
  }
});

var collSistemicos = {
    opus: "Opus",
    opera: "Opera",
    esferamax: "Esfera Max",
    amistarxtra: "Amistar Xtra",
    alto10: "Alto 10",
    silvacur: "Silvacur",
    verdadero: "Verdadero",
    mancuerna: "Mancuerna",
    caporal: "Caporal",
    halt: "Halt",
    astrostarxtra: "Astro Star Xtra",
    tutela: "Tutela",
    halconextra: "Halcon Extra",
    beken: "beken",
    estrobirulina: "Estrobirulina"
}

var collContacto = {
    caldovicosa: "Caldo Vicosa",
    caldobordeles: "Caldo Bordeles"
}

var collBiological = {
    bacilussutillis: "Bacilus Sutillis",
    verticiliumlecanii: "Verticilium Lecanii"
}


var Unit = mongoose.model('Unit');

var numunidad = 0;


Unit.findById('5b6b39a7641dd768f2f9f58e',function (err, f) {
        if (err) {
            console.log("sucedió un error");
        }

        //units.map(f=>{
            var newFungicidas = {};
            numunidad = numunidad+1;
            console.log("Unidad:"+f.nombre);
            var fungicidasSistemico = f.fungicidas.sistemicoOptionsMonths;
            if(fungicidasSistemico){
                for(var k in fungicidasSistemico){
                    if(Array.isArray(fungicidasSistemico[k])){
                        fungicidasSistemico[k].forEach(function(valor){
                            if(valor!=""){
                                if(newFungicidas[collSistemicos[k]]==null)
                                    newFungicidas[collSistemicos[k]]=[];
                                var arrValor = valor.split(",");
                                if(arrValor.length>1)
                                    newFungicidas[collSistemicos[k]] = newFungicidas[collSistemicos[k]].concat(arrValor);
                                else
                                    newFungicidas[collSistemicos[k]].push(valor);
                            }
                        });
                    }
                }
            }
            fungicidasSistemico = f.fungicidas.contactoOptionsMonths;
            if(fungicidasSistemico){
                for(var k in fungicidasSistemico){
                    if(Array.isArray(fungicidasSistemico[k])){
                        fungicidasSistemico[k].forEach(function(valor){
                            if(valor!=""){
                                if(newFungicidas[collContacto[k]]==null)
                                    newFungicidas[collContacto[k]]=[];
                                var arrValor = valor.split(",");
                                if(arrValor.length>1)
                                    newFungicidas[collContacto[k]] = newFungicidas[collContacto[k]].concat(arrValor);
                                else
                                    newFungicidas[collContacto[k]].push(valor);
                            }
                        });
                    }
                }
            }
            fungicidasSistemico = f.fungicidas.biologicalOptionsMonths;
            if(fungicidasSistemico){
                for(var k in fungicidasSistemico){
                    if(Array.isArray(fungicidasSistemico[k])){
                        fungicidasSistemico[k].forEach(function(valor){
                            if(valor!=""){
                                if(newFungicidas[collBiological[k]]==null)
                                    newFungicidas[collBiological[k]]=[];
                                var arrValor = valor.split(",");
                                if(arrValor.length>1)
                                    newFungicidas[collBiological[k]] = newFungicidas[collBiological[k]].concat(arrValor);
                                else
                                    newFungicidas[collBiological[k]].push(valor);
                            }
                        });
                    }
                }
            }
            console.log(newFungicidas);
            f.newFungicidas = newFungicidas;
            f.save();

        //});
        console.log("termino exitoso");
}).limit(10);

console.log("ejecutando");
