if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const Article = require('./models/article');
const articleRouter = require('./routes/articles');
const authRouter = require('./routes/auth-routes')
const profileRouter = require('./routes/profile-routes')
const methodOverride = require('method-override');
const bcrypt = require('bcrypt');
const passport = require('passport');
const googleConfig = require('./config/passport-google-config');
const flash = require('express-flash');
const session = require('express-session');
const User = require('./models/user')

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000

const initialize = require('./config/passport-local-config')
initialize(
    passport,
    email => User.findOne({email: email}),
    id => User.findOne({id: id}), 
    );

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

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: false }));
app.use(methodOverride('_method'));

app.get('/', async (req, res) => {
    const articles = await Article.find().sort({ createdAt: 'desc' });
    res.render('articles/index', { articles: articles });
});

app.use('/articles', articleRouter);
app.use('/auth', authRouter)
app.use('/profile', profileRouter)

app.listen(PORT, () => {
    console.log('Server is running');
});
