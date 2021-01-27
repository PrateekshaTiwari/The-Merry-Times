require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

let publisher = null;

const app = express();

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));


app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false
}));


app.use(passport.initialize());
app.use(passport.session());

mongoose.connect('mongodb://localhost:27017/theMerryTimesDB', { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.set("useCreateIndex", true);

const articleSchema = new mongoose.Schema({
    title: String,
    content: String,
    imageLink: String,
    source: String,
    date: Date,
    publisherMail: String
});

const userSchema = new mongoose.Schema({
    email: String,
    password: String
});

userSchema.plugin(passportLocalMongoose);

const User = mongoose.model("User", userSchema);
const Article = mongoose.model("Article", articleSchema);

passport.use(User.createStrategy());

passport.serializeUser(function (user, done) {
    done(null, user);
});

passport.deserializeUser(function (user, done) {
    done(null, user);
});

app.get("/", function (req, res) {
    Article.find({}, null, { limit: 10, sort: { date: -1 } }, function (err, foundArticles) {
        if (err) {
            console.log(err);
        }
        else {
            res.render("home", { newsArticles: foundArticles });
        }
    });
});

app.get("/about", function(req, res){
    res.render("about");
})


app.get("/all", function (req, res) {
    Article.find({}, null, { sort: { date: -1 } }, function (err, foundArticles) {
        if (err) {
            console.log(err);
        }
        else {
            res.render("all", { newsArticles: foundArticles });
        }
    });
});


app.get("/login", function (req, res) {
    res.render("login");
});

app.get("/signup", function (req, res) {
    res.render("signup");
});

app.get("/publish", function (req, res) {
    if (req.isAuthenticated()) {
        res.render("publish", { name: publisher });
    }
    else {
        res.redirect("/login");
    }
});

app.get("/publisherArticles", function (req, res) {
    Article.find({ publisherMail: publisher }, function (err, foundArticles) {
        if (err) {
            console.log(error);
        }
        else {
            res.render("publisherArticles", { newsArticles: foundArticles });
        }
    });
});

app.get("/articles/:articleId", function (req, res) {
    id = req.params.articleId;
    Article.findById({ _id: id }, function (err, foundArticle) {
        if (err) {
            console.log(err);
        }
        else {
            res.render("article", { newsArticle: foundArticle });
        }
    });
});

app.post("/publish", function (req, res) {

    const newArticle = new Article({
        title: req.body.title,
        content: req.body.content,
        imageLink: req.body.image,
        source: req.body.source,
        date: new Date(),
        publisherMail: publisher
    });

    newArticle.save();

    res.redirect("/publish");
});


app.post("/login", function (req, res) {

    const user = new User({
        email: req.body.username,
        password: req.body.password
    });

    req.login(user, function (err) {
        if (err) {
            console.log(err);
            res.render("login");
        }
        else {
            publisher = req.body.username;
            passport.authenticate("local")(req, res, function () {
                res.redirect("/publish");
            });
        }
    });
});

app.post("/signup", function (req, res) {

    User.register({ username: req.body.username }, req.body.password, function (err, user) {
        publisher = req.body.username;
        if (err) {
            publisher = null;
            console.log("error found");
            res.redirect("/signup");
        }
        else {
            passport.authenticate("local")(req, res, function () {
                res.redirect("/publish");
            });
        }
    });
});


app.listen(3000, function () {
    console.log("Server is running at port 3000");
});