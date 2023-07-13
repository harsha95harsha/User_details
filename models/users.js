const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  user_id: {
    type: Number,
  },
  user_name: {
    type: String,
  },
  Phone: {
    type: Number,
  },
  location: {
    type: String,
  },
})

module.exports = mongoose.model('User', userSchema)
