const router = require('express').Router();
const Article = require('../models/article')

const authCheck = (req, res, next) => {
  if(!req.user) {
    res.redirect('/auth/login')
  } else {
      next();
  }
}

router.get('/', authCheck, async (req, res) => {
  const articles = await Article.find().sort({ createdAt: 'desc' });
  res.render('profiles/profile', { articles: articles, user: req.user })  
})

module.exports = router;