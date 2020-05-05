const mongoose = require('mongoose')

const campgroundSchema = new mongoose.Schema({
  name: String,
  img: String,
  price: {
    type: Number,
    default: 10.00
  },
  description: String,
  author: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    username: String
  },
  comments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment"
    }
  ],
  created_at: {
    type: Date,
    default: new Date()
  },
})

module.exports = Campground = mongoose.model("Campground", campgroundSchema);