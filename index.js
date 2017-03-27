/* PACKAGES */
var express = require('express');
var bodyParser = require('body-parser');
var passport = require('passport');
var session = require('express-session');
var config = require('./config.js');
var exec = require('child_process').execFile;
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var LocalStrategy = require('passport-local').Strategy;
var less = require('less');
var fs = require('fs');
var port = 3000;

var app = module.exports = express();

app.use(session({ secret: config.secret, saveUninitialized: false, resave: false }));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());

/* MONGO */
var url = 'mongodb://localhost:27017/budget_v1';
exec('./mongo/mongod.exe');
exec('./mongo/mongo.exe');

/* AUTH */
passport.serializeUser(function(user, done) { done(null, user); });
passport.deserializeUser(function(obj, done) { done(null, obj); });

/* LOCAL STRATEGY */
passport.use('local', new LocalStrategy(
  function(username, password, done) {
    MongoClient.connect(url, function(err, db) {
      var collection = db.collection("users");
      collection.findOne({
        "username": username,
        "password": password
      }, (err, user) => {
        assert.equal(err, null);
        done(null, user);
        db.close();
      });
    });
  }
));

app.post('/auth/local', passport.authenticate('local'), function(req, res) {
  res.status(200).send(req.user);
});

app.get('/auth/me', function(req, res) {
  if (!req.session.passport.user) { return res.sendStatus(404); }
  else { res.status(200).send(req.session.passport.user); }
});

app.get('/logout', function(req, res) {
  req.logout();
  res.redirect('/#!/login');
});

/* ENDPOINTS */
app.get('/getData', function(req, res) {
  MongoClient.connect(url, function(err, db) {
    var incomes = db.collection("incomes").find();
    var loans = db.collection("loans").find();
    var expenses = db.collection("expenses").find();
    incomes.each(function(err, item) {
      if (item === null) {
        db.close();
        return;
      }
      else {
        console.log(item);
      }
    });
  });
});

app.post('/addIncome', function(req, res) {
  MongoClient.connect(url, function(err, db) {
    var collection = db.collection("incomes");
    collection.insertOne({
      source: req.body.source,
      amount: req.body.amount,
      length: req.body.length,
      hours: req.body.hours,
      first: req.body.first,
      pattern: req.body.pattern,
      deduction: req.body.deduction,
      percent: req.body.percent
    }, function(err, result) {
      assert.equal(err, null);
      res.status(200).send("Added Income");
      db.close();
    });
  });
});

app.post('/addLoan', function(req, res) {
  MongoClient.connect(url, function(err, db) {
    var collection = db.collection("loans");
    collection.insertOne({
      payee: req.body.payee,
      balance: req.body.balance,
      payment: req.body.payment,
      rate: req.body.rate,
      term: req.body.term,
      first: req.body.first
    }, function(err, result) {
      assert.equal(err, null);
      res.status(200).send("Added Loan");
      db.close();
    });
  });
});

/* SERVER */
app.listen(port, function() {
  console.log('port ' + port + ' is listening');
});

/* LESS MANAGEMENT */
fs.readFile('styles.less', function(err, styles) {
    less.render(styles.toString(), function(er, css) {
        fs.writeFile('./public/styles/styles.css', css.css, function(e) {
            console.log('Compiled CSS');
        });
    });
});
