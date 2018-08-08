var mongoose = require('mongoose');

var Campo = new mongoose.Schema({
  fincaid                : String, 
  fecha                :  String,  
  bandolas                :  String,  
  hojastotales           :  String,  
  roya                    :  String,  
  chasparria              :  String,  
  antracnosis             :  String,  
  derrite                 :  String,  
  ojodegallo            :  String,  
  maldehilachas         :  String,  
  otro                    :  String,  
  nudosviejos            :  String,  
  nudosmedios            :  String,  
  nudosjovenes           :  String,  
  frutosnudo5           :  String,  
  frutosnudo6           :  String,  
  brocatotalnudos         :  String,
  presenciacochinilla    :  Boolean,
  floralnueva            :  Boolean,
  vegetativanueva        :  Boolean,
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
},
{
    timestamps: true
});

mongoose.model('Campo', Campo);