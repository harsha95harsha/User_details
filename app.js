const express = require('express')
const multer = require('multer')
const xlsx = require('xlsx')
const mongoose = require('mongoose')
const User = require('./models/users')

const app = express()

const uri =
  'mongodb+srv://Harsha:Nodedevpycube@nodeexpressprojetcs.lhoxcb4.mongodb.net/User_details?retryWrites=true&w=majority'

// Replace <username>, <password>, <cluster>, and <database> with your actual values

mongoose
  .connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to MongoDB Atlas')
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB Atlas:', error)
  })

// Set up Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads') // Choose the directory to store the uploaded file
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname)
  },
})

// Set up Multer upload
const upload = multer({ storage: storage })

// Handle file upload
app.post('/upload', upload.single('file'), (req, res) => {
  const workbook = xlsx.readFile('./User_details.xlsx')

  const sheetName = workbook.SheetNames[0] // Assuming the data is in the first sheet
  const worksheet = workbook.Sheets[sheetName]
  const jsonData = xlsx.utils.sheet_to_json(worksheet, { header: 1 })

  console.log(jsonData)

  // Remove the header row if present
  if (jsonData.length > 0 && Array.isArray(jsonData[0])) {
    jsonData.shift()
  }
  // Create an array of data objects to be inserted
  const dataToInsert = jsonData.map((row) => ({
    user_id: row[0], // Replace with the appropriate column index for each field
    user_name: row[1],
    Phone: row[2],
    location: row[3],
  }))

  console.log(dataToInsert)
  // Insert the data into the database

  User.insertMany(dataToInsert)
    .then(() => {
      console.log('Data inserted successfully')
      res.status(200).send('File uploaded and data inserted successfully')
    })
    .catch((error) => {
      console.error('Error inserting data:', error)
      res.status(500).send('Error inserting data')
    })

  const validUserData = dataToInsert.filter((user, index) => {
    if (!user.user_id || !user.user_name) {
      console.log(
        `Validation failed for user at index ${
          index + 2
        }. Missing mandatory fields.`
      )
      return false
    }
    return true
  })

  if (validUserData.length !== dataToInsert.length) {
    console.log('Some users failed validation.')
  } else {
    console.log(validUserData)
  }
})

// Start the server
app.listen(3000, () => {
  console.log('Server listening on port 3000')
})
