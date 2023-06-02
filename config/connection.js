const mongoose = require('mongoose')
mongoose.set('strictQuery',false)
mongoose.connect('mongodb://127.0.0.1:27017/E-Commerce')
.then(()=>console.log('........DataBase Connected Successfully.........'))
.catch((err)=>console.log(err.message))

