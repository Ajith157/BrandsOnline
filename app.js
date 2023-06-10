const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const expressLayout = require('express-ejs-layouts')
const dataBase = require('./config/connection')
const ConnectMongodbSession = require('connect-mongodb-session')
const session = require("express-session");
const mongodbSession = new ConnectMongodbSession(session)
const multer = require('multer')
const connectDB = require('./config/connection')
//const session= require('express-session')




var usersRouter = require('./routes/users');
var adminRouter = require('./routes/admin');

var app = express();

// view engine setup

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
                 
// app.use(logger('dev'));
app.use(express.json());






app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public/backend')));
app.use(expressLayout)

app.use(session({
  saveUninitialized: false,
  secret: 'sessionkey',
  resave: false,
  store: new mongodbSession({
    uri: "mongodb://127.0.0.1:27017/E-Commerce",
    collection: "session"
  }),
  maxAge: 1000 * 60 * 24 * 10,//10 days,
}))
//app.use(session({secret:"Key",cookie:{maxAge:600000}}))
app.use('/', usersRouter);
app.use('/admin', adminRouter);

const start = function () {  
  try {
    connectDB("mongodb+srv://ajithpr:nikhil@cluster0.6coep9u.mongodb.net/?retryWrites=true&w=majority").then((re)=> console.log(re)).catch((err) => console.log('érror ahnu',err))
  }
  catch (err) {
    console.log(err);
  }
}
start() 




// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});



module.exports = app;