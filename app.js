// requirements
const express        = require("express");
const app            = express();
const bodyParser     = require("body-parser");
const mongoose       = require("mongoose");
mongoose.Promise     = global.Promise;
const passport       = require("passport");
const LocalStrategy  = require("passport-local");
const methodOverride = require("method-override");
const flash          = require("connect-flash");
const User           = require("./models/user");
const indexRoutes    = require("./routes/index");
const mailing        = require("./mailer/index");
const Contract       = require("./models/contract");

// establish db connection
mongoose.connect("mongodb://oppoi1:13371337@ds263367.mlab.com:63367/justbecause", {useMongoClient: true});

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
app.use(indexRoutes);

// initialize mailing
mailing;

// send mail if date is closer than expiration date
Contract.find({}, (err, contracts) => {
    if (err) {
        console.log(err);
    } else {
        setInterval(() => {
            contracts.forEach((contract) => {
                if(contract.expiration < Date.now) {
                    mailing.smtpTransporter.sendMail(mailing.mail, (error, response) => {
                        if(error) {
                            console.log(error);
                        } else {
                            console.log("Message sent: " + response.message);
                        }
                        mailing.smtpTransporter.close();
                    });
                }
            });
        }, 43200000); // send reminder every 12 hours
    }
});

// seed db with dummy data
/*Contract.create(
    {
        title: "Contract #1",
        contactPerson: "Mike",
        inCharge: "Sam"
    },
    (err, contract) => {
        if(err) {
            console.log(err);
        } else {
            console.log("new contract: ");
            console.log(contract);
        }
    });
*/

// listen to port
app.listen(8080, () => {
    console.log("Server started.");
});