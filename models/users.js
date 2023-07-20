// const Joi = require('joi')
// const joi = require('joi')
const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  user_id: Number,
  user_name: String,
  Phone: Number,
  location: String,
  status: String,
})

// const schema = Joi.object().keys({
//   user_id: Joi.number().required(),
//   user_name: Joi.string().required(),
//   Phone: Joi.number(),
//   location: Joi.string(),
//   status: Joi.string().allow(''),
// })

module.exports = mongoose.model('User', userSchema)
