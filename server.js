const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const Article = require('./models/article');
const articleRouter = require('./routes/articles');
const methodOverride = require('method-override');

require('dotenv').config();

const app = express();
const PORT = process.env.port || 5000

app.use(cors());
app.use(express.json());

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

// if (process.env.NODE_ENV === 'production') {
//     app.use(express.static('build'));
// }

app.listen(PORT, () => {
    console.log('Server is running');
});
