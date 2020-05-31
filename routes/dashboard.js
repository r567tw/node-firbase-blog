var express = require('express');
var router = express.Router();
const moment = require('moment');
const stringTags = require('striptags');
const pagination = require('../modules/pagination')
var firebaseAdmin = require('../connections/firebase-admin');
var categoriesRef = firebaseAdmin.ref('/blogs/categories/');
var articlesRef = firebaseAdmin.ref('/blogs/articles/');

// const ref = firebaseAdmin.ref('any')
// ref.once('value', function (snap) {
//   console.log(snap.val())
// })

/* GET users listing. */

router.get('/archives', function (req, res, next) {
  const status = req.query.status || 'public';
  let currentPage = Number.parseInt(req.query.page) || 1;

  categories = {};

  categoriesRef.once('value').then(function (snap) {
    categories = snap.val();
    return articlesRef.orderByChild('createdAt').once('value');
  }).then(function (snap) {
    const articles = [];
    snap.forEach(function (child) {
      if (status === child.val().status) {
        articles.push(child.val())
      }
    });
    articles.reverse();
    const result = pagination(articles, currentPage);
    res.render('dashboard/archives', {
      title: 'archives',
      articles: result.data,
      categories,
      moment,
      stringTags,
      status,
      page: result.page
    });
  })
});

router.get('/article', function (req, res, next) {
  const messages = req.flash('info')
  categoriesRef.once('value', function (snap) {
    categories = snap.val();
    article = {};
    res.render('dashboard/article', { title: 'Express', categories: categories, messages: messages, article });
  })
});

router.post('/article', function (req, res, next) {
  const data = {
    title: req.body.title,
    content: req.body.content,
    category: req.body.category,
    status: req.body.status,
    createdAt: Math.floor(Date.now() / 1000),
  };
  const articleRef = articlesRef.push();
  data.id = articleRef.key
  articleRef.set(data).then(function () {
    req.flash('info', '文章已新增');
    res.redirect(`/dashboard/article/${data.id}`);
  });
});

router.get('/article/:id', function (req, res, next) {
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
    res.render('dashboard/article',
      {
        title: 'Express',
        categories: categories,
        messages: messages,
        article
      });
  })
});

router.post('/article/:id', function (req, res, next) {
  const data = {
    title: req.body.title,
    content: req.body.content,
    category: req.body.category,
    status: req.body.status,
    createdAt: Math.floor(Date.now() / 1000),
  };
  const id = req.param('id');
  let categories = {};
  const messages = req.flash('info')

  categoriesRef.once('value').then(function (snap) {
    categories = snap.val();
    return articlesRef.child(id).set(data)
  }).then(function (snap) {
    req.flash('info', '文章已更新');
    res.redirect(`/dashboard/article/${id}`);
  })
});

router.post('/article/delete/:id', function (req, res, next) {
  const id = req.param('id');
  console.log(id);
  articlesRef.child(id).remove();
  res.send('文章已刪除');
  res.end();
});

router.get('/categories', function (req, res, next) {
  const messages = req.flash('info')
  console.log(messages);
  categoriesRef.once('value', function (snap) {
    categories = snap.val()
    // console.log(categories);
    res.render('dashboard/categories', { title: 'categories', categories: categories, messages: messages });
  })
});

router.post('/category', function (req, res) {
  const data = { name: req.body.name, path: req.body.path };
  categoriesRef.orderByChild('path').equalTo(data.path).once('value').then(function (snap) {
    // console.log(snap.val());
    if (snap.val() !== null) {
      req.flash('info', '路徑不可以重複');
      res.redirect('/dashboard/categories')
    } else {
      const categoryRef = categoriesRef.push();
      data.id = categoryRef.key
      categoryRef.set(data).then(function () {
        res.redirect('/dashboard/categories')
      });
    }
  });
});

router.post('/category/delete', function (req, res) {
  const id = req.body.id
  categoriesRef.child(id).remove()
  req.flash('info', '分類已刪除');
  res.redirect('/dashboard/categories')
});

module.exports = router;
