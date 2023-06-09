const mongoose = require('mongoose')

const connectDB = (url) => {
    return mongoose
        .connect(url, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        }).then(()=> console.log('mongodb connected'))
}

module.exports = connectDB