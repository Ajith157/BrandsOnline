const mongoose = require('mongoose')
require("dotenv").config()
mongoose.set('strictQuery',false)
mongoose.connect(process.env.MONGO_URL)
.then(()=>console.log('........DataBase Connected Successfully.........'))
.catch((err)=>console.log(err.message))

