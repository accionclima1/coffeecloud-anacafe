var mongoose = require('mongoose');

var EnsoSchema = new mongoose.Schema({
  title: String,
  subtitle: String,
  status: String,
  content: String
});

mongoose.model('Enso', EnsoSchema);