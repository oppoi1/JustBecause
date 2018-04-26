// requirements
const express = require("express"),
     passport = require("passport"),
       router = express.Router(),
         User = require("../models/user"),
   middleware = require("../middleware/index"),
     Contract = require("../models/contract");

// restful routes
router.get("/", (req, res) => {
    res.redirect("/contracts");
});

// show all contracts
router.get("/contracts", (req, res) => {
    Contract.find({}, (err, contracts) => {
        if (err) {
            console.log(err);
        } else {
            res.render("index", {contracts: contracts});
        }
    });
});

// create route
router.post("/contracts", middleware.isLoggedIn, (req, res) => {
    
    // create contract
    let title           = req.body.contract.title;
    let contactPerson   = req.body.contract.contactPerson;
    let inCharge        = req.body.contract.inCharge;
    let expiration      = req.body.contract.expiration;
    let reminderDate    = req.body.contract.reminderDate;
    let author          = {
                            id: req.user._id,
                            username: req.user.username
                          };
                          
    let newContract     = {title: title, contactPerson: contactPerson, inCharge: inCharge, expiration: expiration, createdBy: author, reminderDate: reminderDate};
    
    Contract.create(newContract, (err, newlyContract) => {
        if (err) {
            req.flash("error", "Vertrag konnte nicht erstellt werden. Bitte versuchen Sie es später.");
            console.log(err);
        } else {
            // redirect
            req.flash("success", "Vertrag hinzugefügt");
            res.redirect("back");
        }
    });
});

// new route
router.get("/contracts/new", (req, res) => {
    User.find({}, (err, user) => {
        Contract.find({}, (err, contracts) => {
            if (err) {
                console.log(err);
            } else {
                res.render("new", {user: user, contracts: contracts});
            }
        });
    });
});

// show route
router.get("/contracts/:id", (req, res) => {
    // find contract with id
    Contract.findById(req.params.id).populate('comments').exec((err, foundContract) => {
        if(err) {
            console.log(err);
        } else {
            res.render("show", {contract: foundContract});
        }
    });
});

// edit route
router.get("/contracts/:id/edit", middleware.isLoggedIn, (req, res) => {
    Contract.findById(req.params.id, (err, foundContract) => {
       res.render("edit", {contract: foundContract}); 
    });
});

// update contracts
router.put("/contracts/:id", middleware.isLoggedIn, (req, res) => {
    Contract.findByIdAndUpdate(req.params.id, req.body.contract, (err, updatedContract) => {
        if(err) {
            console.log(err);
            res.redirect("back");
        } else {
            req.flash("success", "Vertrag erfolgreich bearbeitet.");
            res.redirect("/contracts/" + req.params.id);
        }
    });
});

// destroy route
router.delete("/contracts/:id", middleware.isLoggedIn, (req,res) => {
    Contract.findByIdAndRemove(req.params.id, (err) => {
        if(err) {
            res.redirect("back");
        } else {
            res.redirect("/contracts");
        }
    });
});

// auth routes
// show register form
router.get("/register", (req, res) => {
    res.render("register");
});

// sign up logic
router.post("/register", (req, res) => {
    let newUser = new User({username: req.body.username});
    User.register(newUser, req.body.password, (err, user) => {
        if(err) {
            req.flash("error", err.message);
            return res.render("register");
        } else {
            passport.authenticate("local")(req, res, () => {
                req.flash("success", "Willkommen auf JustBecause " + user.username);
                res.redirect("/");
            });
        }
    });
});

// show login form
router.get("/login", (req, res) => {
    res.render("login");
});

// login logic
router.post("/login", passport.authenticate("local",
    {
        successRedirect: "/contracts",
        failureRedirect: "/login",
    }), (req, res) => {
    req.flash("success", "Login erfolgreich.");
});

// show login form
router.get("/profile", (req, res) => {
    Contract.find({}, (err, contracts) => {
        if(err) {
            console.log(err);
        } else {
            res.render("profile", {contract: contracts});
        }
    });
});

// logout route
router.get("/logout", (req, res) => {
    req.logout();
    req.flash("success", "Logout erfolgreich.");
    res.redirect("/contracts");
});

module.exports = router;