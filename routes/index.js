var express = require('express');
var router = express.Router();
var firebaseAdmin = require('../connections/firebase-admin')
const moment = require('moment');
const stringTags = require('striptags');
const pagination = require('../modules/pagination')
var categoriesRef = firebaseAdmin.ref('/blogs/categories/');
var articlesRef = firebaseAdmin.ref('/blogs/articles/');

// const ref = firebaseAdmin.ref('any')
// ref.once('value', function (snap) {
//   console.log(snap.val())
// })

/* GET home page. */
router.get('/', function (req, res, next) {
  let currentPage = Number.parseInt(req.query.page) || 1;
  categories = {};

  categoriesRef.once('value').then(function (snap) {
    categories = snap.val();
    return articlesRef.orderByChild('createdAt').once('value');
  }).then(function (snap) {
    const articles = [];
    snap.forEach(function (child) {
      if ('public' === child.val().status) {
        articles.push(child.val())
      }
    });
    articles.reverse();
    const data = pagination(articles, currentPage);
    //console.log(data);
    res.render('index', {
      title: 'Express',
      articles: data.data,
      categories,
      moment,
      stringTags,
      page: data.page
    });
  })
});

router.get('/post/:id', function (req, res, next) {
  const id = req.param('id');
  let categories = {};
  const messages = req.flash('info')

  categoriesRef.once('value').then(function (snap) {
    categories = snap.val();
    return articlesRef.child(id).once('value');
  }).then(function (snap) {
    const article = snap.val();
    if (!article) {
      return res.render('error', {
        title: '找不到該文章:('
      });
    }
    res.render('post',
      {
        title: 'Express',
        categories: categories,
        messages: messages,
        article,
        moment
      });
  })
});

module.exports = router;
