const router = require('express').Router();
const passport = require('passport');
const User = require('../models/user');
const bcrypt = require('bcrypt');

//auth login
router.get('/login', checkNotAuthenticated, (req, res) => {
    res.render('login')
})

router.post('/login', checkNotAuthenticated, passport.authenticate('local', {
    successRedirect: '/profile',
    failureRedirect: '/auth/login',
    failureFlash: true
}))

router.get('/signup', checkNotAuthenticated, (req, res) => {
    res.render('signup')
})

router.post('/signup', checkNotAuthenticated, async (req, res) => {
    try {
      const hashedPassword = await bcrypt.hash(req.body.password, 10)
      new User({
        username: req.body.name,
        email: req.body.email,
        password: hashedPassword
     }).save()
      res.redirect('/auth/login')
    } catch {
       res.redirect('/auth/signup')
    }
})

router.delete('/logout', (req, res) => {
    req.logOut()
    res.redirect('/')
})

router.get('/google', passport.authenticate('google', {
    scope: ['profile']
}))

router.get('/google/redirect', passport.authenticate('google'), (req, res) => {
    console.log(req.user.username)
    res.redirect('/profile');
})

function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()){
        return next()
    }

    res.redirect('/login')
}

function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return res.redirect('/')
        }
    
    next()
}

module.exports = router;