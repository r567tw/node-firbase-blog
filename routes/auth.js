var express = require('express');
var router = express.Router();
var firebase = require('../connections/firebase-client');
var fireAuth = firebase.auth();

router.get('/', function (req, res) {
  const message = req.flash('message');
  const error = req.flash('error');
  res.render('dashboard/index', { title: 'auth', message, error });
});

router.get('/signin', function (req, res) {
  res.render('dashboard/signin', { title: 'auth' });
});

router.post('/signin', function (req, res) {
  fireAuth.signInWithEmailAndPassword(req.body.email, req.body.password)
    .then(function (result) {
      user = result.user;
      req.session.uid = user.uid;
      req.flash('message', '歡迎光臨');
      res.redirect('/auth');
    })
    .catch(function (error) {
      console.log(error);
      var errorMessage = error.message;
      req.flash('error', errorMessage);
      req.flash('message', '登入失敗');
      res.redirect('/auth')
    })
});

router.get('/signout', function (req, res) {
  req.session.uid = null;
  req.flash('message', '已登出');
  res.redirect('/auth');
});

router.get('/signup', function (req, res) {
  res.render('dashboard/signup', { title: 'auth', error: req.flash('error') });
})

router.post('/signup', function (req, res) {
  var email = req.body.email;
  var password = req.body.password;
  var nickname = req.body.nickname;
  fireAuth.createUserWithEmailAndPassword(email, password)
    .then(function (user) {
      var saveUser = {
        'email': email,
        'nickname': nickname,
        'uid': user.uid
      }
      req.flash('message', '註冊成功');
      res.redirect('/auth');
    })
    .catch(function (error) {
      console.log(error);
      var errorMessage = error.message;
      req.flash('error', errorMessage);
      req.flash('message', '註冊失敗');
      res.redirect('/auth');
    })
})

module.exports = router;