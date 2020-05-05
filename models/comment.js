const mongoose = require('mongoose')

const commentSchema = new mongoose.Schema({
  text: String,
  author: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    username: String
  },
  created_at: {
    type: Date,
    default: new Date()
  },
  camp_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Campground"
  }
})

module.exports = Comment = mongoose.model("Comment", commentSchema);