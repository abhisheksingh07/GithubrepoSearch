var express = require('express');
var router = express.Router();
var passport = require('passport');
var path = require('path');
var request = require('request');
var qs = require('querystring');
var LocalStrategy = require('passport-local').Strategy;
var csrf = require('csurf');
var multer = require("multer");
// var csrfProtection = csrf();
// router.use(csrfProtection);

var User = require('../models/users');
var Search = require('../models/search');







router.get('/', (req, res) => {
  res.render('index');
});

 //Login Form
router.get('/login', (req, res,next) => {
  res.render('login',{title:"Login"});
});


router.get('/register', (req, res, next) => {
  res.render('register',{title:"Register"});
});



// Process Register
router.post('/register', (req, res) => {
 var username = req.body.username;
  var email = req.body.email;
  var password = req.body.password;
  var confmPassword = req.body.confmPassword;
   
    
	req.checkBody('username', 'User Name field is required').notEmpty();
	req.checkBody('email', 'Email field is required').notEmpty();
	req.checkBody('email', 'Email must be a valid email address').isEmail();
	req.checkBody('password', 'Password field is required').notEmpty();
	req.checkBody('confmPassword', 'Passwords do not match').equals(req.body.password);

    var newUser = new User({
      username: username,
	    email:email,
	    password: password,
    });
	

    User.registerUser(newUser, (err, user) => {
      
	    
	  if(err) throw err;  
      req.flash('success_msg', 'You are registered and can log in');
	  req.flash('error_msg', 'Something went wrong')
	  res.redirect('/login');
	  
    });
  
});





// Local Strategy
passport.use(new LocalStrategy((username, password, done) => {
  User.getUserByUsername(username, (err, user) => {
    if(err) throw err;
    if(!user){
      return done(null, false, {message: 'No user found'});
    }

    User.comparePassword(password, user.password, (err, isMatch) => {
      if(err) throw err;
      if(isMatch){
        return done(null, user);
      } else {
        return done(null, false, {message: 'Wrong Password'});
      }
    });
  });
}));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.getUserById(id, (err, user) => {
    done(err, user);
  });
});

//Login Processing
router.post('/login', (req, res, next) => {
  passport.authenticate('local', {
    successRedirect:'/dashboard',
    failureRedirect:'/login',
    failureFlash: true,
	error_msg:'Create the account first',
  })(req, res, next);
});

//logedin page or dashboard
router.get('/dashboard',ensureAuthenticated,function(req,res){
  res.render('dashboard',
  {title:"Search Box",
  user:req.user,
  url:'/search', data:null});
});

router.post('/search',ensureAuthenticated,function(req,res){
	var user = req.user; 
	var id = user._id;
	var searchTopic = req.body.topic;
	var options = { method: 'GET',
  url: 'https://api.github.com/search/repositories',
  qs: { q: searchTopic },
  headers:  
   {  'client_id':'56627343c6015368de4a',
   'client_seceret':'3359482192795cf98f478fe60fb2a092811d52fc',
     'Cache-Control': 'no-cache',
	 'User-Agent': 'node.js',
     Accept: 'application/vnd.github.mercy-preview+json' } };

request(options, function (error, response, body) {
  if (error) throw new Error(error);
  console.log(body);
 var d = body.total_count;
 console.log(d);
  res.render('dashboard',{Searchquery:body,title:'search',
  url:'/search', data:body});
});
var SearchItem = new Search({
	stuff:searchTopic,
});
User.findOne({_id:user._id},function(err,data){

	  SearchItem.UserId = data._id;
	  SearchItem.save();
	  //user.search.push(SearchItem);
	  user.save();
  });
});
	
	router.get('/history',ensureAuthenticated,function(req,res){
		var user = req.user;
		User.findOne({_id:user._id}).populate('search').exec(function(err,data){
			if(err) throw err;
			var a = data.search;
			console.log(a);
			var b = a.reverse();
			res.render('history',
			{title:'History',user:user,b:b}
			);
		});
	})

//Logout
router.get('/logout', (req, res, next) => {
  req.logout();
  req.flash('success_msg', 'You are logged out');
  res.redirect('/login');
});

//Access Control
function ensureAuthenticated(req, res, next){
  if(req.isAuthenticated()){
    return next();
  } else {
    req.flash('error_msg', 'You are not authorized to view that page');
    res.redirect('/login');
  }
}


module.exports = router;
