const express = require('express')
const multer = require('multer')
const xlsx = require('xlsx')
const mongoose = require('mongoose')
const Joi = require('joi')
const User = require('./models/users')
require('dotenv').config()
const app = express()

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: false,
    useUnifiedTopology: false,
  })
  .then(() => {
    console.log('Connected to MongoDB Atlas')
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB Atlas:', error)
  })

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads')
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname)
  },
})

const upload = multer({ storage: storage })

app.post('/upload', upload.single('file'), (req, res) => {
  const workbook = xlsx.readFile('./User_details.xlsx')
  const sheetName = workbook.SheetNames[0]
  const worksheet = workbook.Sheets[sheetName]
  const jsonData = xlsx.utils.sheet_to_json(worksheet, { header: 1 })

  if (jsonData.length > 0 && Array.isArray(jsonData[0])) {
    jsonData.shift()
  }

  const dataToInsert = jsonData.map((row) => ({
    user_id: row[0],
    user_name: row[1],
    Phone: row[2],
    location: row[3],
    status: row[4],
  }))

  const validUserData = dataToInsert.filter((user, index) => {
    if (!user.user_id || !user.user_name) {
      console.log(
        `Validation failed for user at index ${
          index + 2
        }. Missing mandatory fields.`
      )

      user.status = `This user failed validation `
    } else {
      user.status = 'This user passed the validation'
    }
    return user
  })

  if (validUserData.length !== dataToInsert.length) {
    console.log('Some users failed validation.')
  } else {
    console.log(validUserData)
  }
  User.insertMany(validUserData)
    .then((result) => {
      console.log('Data inserted successfully:')
      res.status(200).json({ msg: result })
    })
    .catch((error) => {
      console.error('Error inserting data:')
      res.status(500).json({ msg: error })
    })
  // const schema = Joi.object().keys({
  //   user_id: Joi.number().required(),
  //   user_name: Joi.string().required(),
  //   Phone: Joi.number(),
  //   location: Joi.string(),
  //   status: Joi.string().allow(''),
  // })
})

app.listen(3000, () => {
  console.log('Server listening on port 3000')
})
