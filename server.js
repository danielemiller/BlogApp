if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const Article = require('./models/article');
const articleRouter = require('./routes/articles');
const methodOverride = require('method-override');
const bcrypt = require('bcrypt');
const passport = require('passport');
const flash = require('express-flash');
const session = require('express-session');

const initializePassport = require('./passport-config');
initializePassport(
    passport,
    email => users.find(user => user.email === email),
    id => users.find(user => user.id === id), 
    );

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000

app.use(cors());
app.use(express.json());
app.use(flash());
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize())
app.use(passport.session())

const uri = process.env.ATLAS_URI;
mongoose.connect(uri || 'mongodb://localhost/blog', { 
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true 
})

const connection = mongoose.connection
connection.once("open", () => {
    console.log(('MongoDB database connection established'));
});

const users = []

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: false }));
app.use(methodOverride('_method'));

app.get('/', async (req, res) => {
    const articles = await Article.find().sort({ createdAt: 'desc' });
    res.render('articles/index', { articles: articles });
});

app.get('/login', checkNotAuthenticated, (req, res) => {
    res.render('login')
})

app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}))

app.get('/signup', checkNotAuthenticated, (req, res) => {
    res.render('signup')
})

app.post('/signup', checkNotAuthenticated, async (req, res) => {
    try {
      const hashedPassword = await bcrypt.hash(req.body.password, 10)
      users.push({
          id: Date.now().toString(),
          email : req.body.email,
          password: hashedPassword
      })
      res.redirect('/login')
    } catch {
        res.redirect('/register')
    }
})

app.delete('/logout', (req, res) => {
    req.logOut()
    req.redirect('/login')
})

app.use('/articles', articleRouter);

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

app.listen(PORT, () => {
    console.log('Server is running');
});
