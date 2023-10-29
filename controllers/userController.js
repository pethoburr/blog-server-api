const User = require("../models/user");
const Comments = require("../models/comments");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");

exports.sign_up_get = asyncHandler(async (req, res, next) => {
    res.render('sign_up', );
});

exports.sign_up_post =
    [
        body("first_name", "Must enter name")
            .trim()
            .isLength({ min: 1 })
            .escape(),
        body("last_name", "Enter last name")
            .trim()
            .isLength({ min: 1 })
            .escape(),
        body("username", "Username required")
            .trim()
            .isLength({ min: 1 })
            .escape(),
        body("password", "enter password")
            .trim()
            .isLength({ min: 1 })
            .escape(),
        asyncHandler(async (req, res, next) => {
            bcrypt.hash(req.body.password, 10, async (err, hashedPassword) => {
                if (err) { return next(err)};
                const errors = validationResult(req);
                const user = new User({
                    first_name: req.body.first_name,
                    last_name: req.body.last_name,
                    username: req.body.username,
                    password: hashedPassword,
                    member_status: false,
                    admin: false
                })
        
                if (!errors.isEmpty()) {
                    res.status(500);
                    return;
                } else {
                    const checker = await User.findOne({ username: req.body.username }).exec();
                    if (checker) {
                        res.status(500);
                        return;
                    }
                    await user.save();
                    res.redirect('http://localhost:5173/log-in')
                }
            })
        })
    ];

// exports.log_in_get = asyncHandler(async (req, res, next) => {
//     if (req.isAuthenticated()) {
//         console.log('auth success')
//         res.json(req.user)
//     } else {
//         console.log('auth no success')
//         res.json(1)
//     }
// });