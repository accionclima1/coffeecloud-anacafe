var mongoose = require('mongoose');

var PostSchema = new mongoose.Schema({
  title: String,
  content: String,
  upvotes: {type: Number, default: 0},
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }]
},
{
    timestamps: true
});

PostSchema.methods.upvote = function(cb) {
  this.upvotes += 1;
  this.save(cb);
};



mongoose.model('Post', PostSchema);