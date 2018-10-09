var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var ejs = require('ejs');
// var csrf = require('csurf');
var helmet = require('helmet');
var socket = require('socket.io');
var nosniff = require('dont-sniff-mimetype');
var xssFilter = require('x-xss-protection');
var expressValidator = require('express-validator');
var flash = require('connect-flash');
var session = require('express-session');
var passport = require('passport');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var LocalStrategy = require('passport-local').Strategy;
var mongoose = require('mongoose');
// var url = require('./config/database');

 
//database connection file
mongoose.connect('mongodb://absingh:ab2407@ds225253.mlab.com:25253/serverguyassignment', { useNewUrlParser: true})
  .then(() =>  console.log('connection succesful'))
  .catch((err) => console.error(err));

  
var index= require('./routes/index');

var app = express();

// app.use(helmet());
// app.use(nosniff());
// app.use(xssFilter());
// app.use(helmet.iexss());
// app.use(helmet.csp());
// app.use(helmet.xframe('someorigin'));
// app.use(helmet.cacheControls());
app.use(logger('dev'));

//Security 

// app.use(helmet());
// app.use(helmet.xssFilter({ setOnOldIE: true }));
// app.use(helmet.frameguard('deny'));
// app.use(helmet.hidePoweredBy());
// app.use(helmet.ieNoOpen());
// app.use(helmet.noSniff());
// app.use(helmet.noCache());



app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// app.set('trust proxy', 1);
// Express Session
app.use(cookieParser())
app.use(session({
    secret: 'NeverLie12345Dolie',
    saveUninitialized:false,
    resave: false 
}));

app.use(passport.initialize());
app.use(passport.session());
app.set('view engine', 'ejs');
app.use("/public", express.static(path.join(__dirname, 'public')));
app.use(flash());
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  res.locals.user = req.user || null;
  next();
});
app.use(expressValidator({
  errorFormatter: (param, msg, value) => {
      let namespace = param.split('.')
      , root    = namespace.shift()
      , formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  }
}));



app.use('/', index);

// Start Server
var server = app.listen('3000',function(){
  console.log("server will start on 3000 port")});
  
