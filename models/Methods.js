var mongoose = require('mongoose');

var MethodSchema = new mongoose.Schema({
  caseInidence10 : {
	  abrilJunio: String,
	  julioSetiembre: String,
	  octubreDiciembre: String,
  },
  caseInidence1120 : {
	  abrilJunio: String,
	  julioSetiembre: String,
	  octubreDiciembre: String,
  },
  caseInidence2150 : {
	  abrilJunio: String,
	  julioSetiembre: String,
	  octubreDiciembre: String,
  },
  caseInidence50 : {
	  abrilJunio: String,
	  julioSetiembre: String,
	  octubreDiciembre: String,
  }
},
{
    timestamps: true
});

mongoose.model('Method', MethodSchema);