// get requirements
const express    = require('express'),
      router     = express.Router({mergeParams: true}),
      Contract   = require('../models/contract'),
      Comment    = require('../models/comment'),
      middleware = require('../middleware');

//new comment
router.get('/new', middleware.isLoggedIn, (req,res) => {
    // get contract by ID
    console.log(req.param.id);
    Contract.findById(req.params.id, (err, contract) => {
        if(err) {
            console.log(err);
        } else {
            res.render('comments/new', {contract: contract});
        }
    });
});

// create comment
router.post('/', middleware.isLoggedIn, (req, res) => {
    // check contract id
    Contract.findById(req.params.id, (err, contract) => {
        if(err) {
            console.log(err);
            res.redirect('/');
        } else {
            Comment.create(req.body.comment, (err, comment) => {
                if(err) {
                    req.flash('error', 'Something went wrong');
                    console.log(err);
                } else {
                    // add username and id to comment
                    comment.author.id = req.user._id;
                    comment.author.username = req.user.username;

                    // save comment
                    comment.save();
                    contract.comments.push(comment);
                    contract.save();
                    req.flash('success', 'Comment successfully added');
                    res.redirect('/contracts/' + contract._id);
                }
            });
        }
    });
});

// edit comment
router.get('/:comment_id/edit', middleware.checkCommentOwnership, (req, res) => {
    Comment.findById(req.params.comment_id, (err, foundComment) => {
        if(err) {
            res.redirect('back');
        } else {
            res.render('comments/edit', {contract_id: req.params.id, comment: foundComment});
        }
    });
});

// update comment
router.put('/:comment_id', middleware.checkCommentOwnership, (req,res) => {
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, (err, updatedComment) => {
        if(err){
            res.redirect('back');
        } else {
            res.redirect('/contracts/' + req.params.id);
        }
    });
});

// destroy comment
router.delete('/:comment_id', middleware.checkCommentOwnership, (req,res) => {
    Comment.findByIdAndRemove(req.params.comment_id, (err) => {
        if(err) {
            res.redirect('back');
        } else {
            req.flash('success', 'Comment deleted');
            res.redirect('/contracts/' + req.params.id);
        }
    });
});

module.exports = router;