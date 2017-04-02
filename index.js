/* PACKAGES */
var express = require('express');
var bodyParser = require('body-parser');
var passport = require('passport');
var session = require('express-session');
var config = require('./config.js');
var exec = require('child_process').execFile;
var MongoClient = require('mongodb').MongoClient;
var mongodb = require('mongodb');
var assert = require('assert');
var async = require('async');
var queue = require('queue');
var LocalStrategy = require('passport-local').Strategy;
var less = require('less');
var fs = require('fs');
var port = 3000;

var app = module.exports = express();
var q = queue();

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
    var data = {
      incomes: [],
      loans: [],
      expenses: []
    }
    incomes.each(function(err, inc) {
      if (inc === null) {
        loans.each(function(err, loan) {
          if (loan === null) {
            expenses.each(function(err, exp) {
              if (exp === null) {
                res.status(200).send(data);
                db.close();
              } else {
                data.expenses.push(exp);
              }
            });
          } else {
            data.loans.push(loan);
          }
        });
      } else {
        data.incomes.push(inc);
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

var q = async.queue(function(task, callback) {
  var doc = task.doc;
  MongoClient.connect(url, function(err, db) {
    var collection = db.collection("expenses");
    collection.insertOne({
      description: doc.description,
      amount: doc.amount,
      date: doc.date,
      category: doc.category,
      subcategory: doc.subcategory,
      keyword: doc.keyword,
      condition: doc.condition,
      conditionAmount: doc.conditionAmount
    }, function(err, result) {
      assert.equal(err, null);
      callback();
      db.close();
    });
  });
});

app.post('/addExpenses', function(req, res) {
  if (req.body.expenses.length === 0) {
    res.status(200).send('No Expenses To Add');
  }
  for (var doc in req.body.expenses) {
    q.push({ doc: req.body.expenses[doc] }, function(err) {
      if (err) console.log(err);
    });
  }
  q.drain = function() {
    res.status(200).send('Added Expenses');
  }
});

app.delete('/removeRule/:id', function(req, res) {
  MongoClient.connect(url, function(err, db) {
    var collection = db.collection("expenses");
    collection.updateOne({
      '_id': new mongodb.ObjectID(req.params.id)
    }, { $set: {
      'keyword': null,
      'condition': null,
      'conditionAmount': null
    }}, function(err, result) {
      assert.equal(err, null);
      res.status(200).send("Deleted Rule");
      db.close();
    });
  });
});

app.delete('/removeIncome/:source', function(req, res) {
  MongoClient.connect(url, function(err, db) {
    var collection = db.collection("incomes");
    collection.remove({
      source: req.params.source
    }, function(err, result) {
      assert.equal(err, null);
      res.status(200).send("Removed Income");
      db.close();
    });
  });
});

app.delete('/removeLoan/:payee', function(req, res) {
  MongoClient.connect(url, function(err, db) {
    var collection = db.collection("loans");
    collection.remove({
      payee: req.params.payee
    }, function(err, result) {
      assert.equal(err, null);
      res.status(200).send("Removed Loan");
      db.close();
    });
  });
});

app.put('/updateIncome', function(req, res) {
  MongoClient.connect(url, function(err, db) {
    var collection = db.collection("incomes");
    collection.updateOne({
      '_id': new mongodb.ObjectID(req.body._id)
    }, { $set: {
      'source': req.body.source,
      'amount': req.body.amount,
      'length': req.body.length,
      'hours': req.body.hours,
      'first': req.body.first,
      'deduction': req.body.deduction,
      'percent': req.body.percent
    }}, function(err, result) {
      assert.equal(err, null);
      res.status(200).send("Updated Income");
      db.close();
    });
  });
});

app.put('/updateLoan', function(req, res) {
  MongoClient.connect(url, function(err, db) {
    var collection = db.collection("loans");
    collection.updateOne({
      '_id': new mongodb.ObjectID(req.body._id)
    }, { $set: {
      'payee': req.body.payee,
      'balance': req.body.balance,
      'payment': req.body.payment,
      'rate': req.body.rate,
      'term': req.body.term,
      'first': req.body.first
    }}, function(err, result) {
      assert.equal(err, null);
      res.status(200).send("Updated Loan");
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
