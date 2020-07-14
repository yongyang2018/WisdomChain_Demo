var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var bodyParser = require('body-parser')
const fs=require('fs');
const Common=require('./routes/countersign/Common')
var common=new Common();

var indexRouter = require('./routes/countersign/index');
var inheritRouter = require('./routes/inherit/index');
var integralRouter = require('./routes/integral/index');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'keystore')));

app.use('/sign', indexRouter);
app.use('/inherit', inheritRouter);
app.use('/integral', integralRouter);

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

global.address=[];
global.undone=[];
global.finish=[];
global.inherit=[];
global.integral=[];


function init(){

  const files = fs.readdirSync(__dirname +'/keystore/');
  files.forEach(function(item,index){
    fs.readFile(__dirname +'/keystore/'+item,async function (err, data){
      if(err){
        console.log("init error");
        return;
      }
      var info=JSON.parse(data);
      var prikey=await common.getprikey(info,"12345678");
      var pubkey=await common.getpubkey(info,"12345678");
      var address={
        'address':item,
        'prikey':prikey,
        'pubkey':pubkey,
        'pubkeyHash':common.getpubkeyHash(item)
      }
      global.address[index]=address;
    });
  })
}

init();
console.log("The program started successfully.");

module.exports = app;
