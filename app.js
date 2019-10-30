// requirements
const express        = require("express"),
      app            = express(),
      bodyParser     = require("body-parser"),
      mongoose       = require("mongoose"),
      passport       = require("passport"),
      LocalStrategy  = require("passport-local"),
      methodOverride = require("method-override"),
      flash          = require("connect-flash"),
      User           = require("./models/user"),
      indexRoutes    = require("./routes/index"),
      commentRoutes  = require('./routes/comments'),
      Contract       = require("./models/contract"),
      Comment        = require('./models/comment'),
      PORT           = 8000;
mongoose.Promise     = global.Promise;

// establish db connection
mongoose.connect("mongodb://username:password@ds263367.mlab.com:63367/justbecause", {useMongoClient: true});

// app config
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.use(flash());

// passport config
app.use(require("express-session")({
    secret: "Kalle war der beste Hund",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// global user, flash message
app.use((req, res, next) => {
    res.locals.currentUser   = req.user;
    res.locals.error         = req.flash("error");
    res.locals.success       = req.flash("success");
    next();
});

// use routes
app.use("/", indexRoutes);
app.use("/contracts/:id/comments", commentRoutes);

// send mail if date is closer than expiration date
// Contract.find({}, (err, contracts) => {
//     if (err) {
//         console.log(err);
//     } else {
//         setInterval(() => {
//             contracts.forEach((contract) => {
//                 if(contract.expiration < Date.now) {
//                     mailing.smtpTransporter.sendMail(mailing.mail, (error, response) => {
//                         if(error) {
//                             console.log(error);
//                         } else {
//                             console.log("Message sent: " + response.message);
//                         }
//                         mailing.smtpTransporter.close();
//                     });
//                 }
//             });
//         }, 43200000); // send reminder every 12 hours
//     }
// });

// listen to port
app.listen(PORT, () => {
    console.log(`Server started on ${PORT}.`);
});
