/* eslint-disable no-unused-vars */
const User = require("../models/user");
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
            console.log('req:' + JSON.stringify(req.body))
            bcrypt.hash(req.body.password, 10, async (err, hashedPassword) => {
                if (err) {
                    console.log('ye here') 
                    return next(err)
                }
                const errors = validationResult(req);
                const user = new User({
                    first_name: req.body.first_name,
                    last_name: req.body.last_name,
                    username: req.body.username,
                    password: hashedPassword,
                    admin: false
                })
        
                if (!errors.isEmpty()) {
                    console.log('uhm here')
                    res.status(400).json(errors.array());
                    return;
                } else {
                    const checker = await User.findOne({ username: req.body.username }).exec();
                    if (checker) {
                        res.status(500).json({ message: 'Username already in use'});
                        return;
                    }
                    await user.save();
                    res.status(200).json(user)
                }
            })
        })
    ];
