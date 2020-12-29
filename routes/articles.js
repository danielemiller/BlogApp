const express = require('express');
const Article = require('./../models/article'); 
const router = express.Router(); 

router.get('/new', (req, res) => {
    res.render('articles/new', { article: new Article(), user: req.user });
})
router.get('/edit/:id', async (req, res) => {
    const article = await Article.findById(req.params.id);
    res.render('articles/edit', { article: article, user: req.user });
})

router.get('/:slug', async (req, res) => {
    const article = await Article.findOne({ slug: req.params.slug });
    if (article == null) res.redirect('/');
    res.render('articles/show', { article: article, user: req.user });
})

router.post('/', async (req, res, next) => {
    req.article = new Article();
    next();
}, saveArticleAndRedirect('new'))

router.put('/:id', async (req, res, next) => {
    req.article = await Article.findById(req.params.id);
    next();
}, saveArticleAndRedirect('edit'))

router.delete('/:id', async (req, res) => {
    await Article.findByIdAndDelete(req.params.id);
    if (!req.user) {  
      res.redirect('/');  
    } else { 
      res.redirect('/profile')  
    }
    
})

function saveArticleAndRedirect(path) {
    return async (req, res) => {
        let article = req.article
        article.title = req.body.title
        article.description = req.body.description
        article.markdown = req.body.markdown
        try {
            article = await article.save();
            res.redirect(`/articles/${article.slug}`)
        } catch (e) {
            res.render(`articles/${path}`, { article: article });
        }    
    }
}

module.exports = router