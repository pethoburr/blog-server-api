/* eslint-disable no-unused-vars */
const Posts = require("../models/posts");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const jwt = require('jsonwebtoken')

exports.latest = asyncHandler(async (req, res, next) => {
    const published = []
    const latestFive = await Posts.find().limit(5).populate('topic').exec()
    latestFive.map((ting) => {
        if (ting.published) {
            published.push(ting)
        }
    })
    res.json(published)
})

exports.list_all = asyncHandler(async (req, res, next) => {
    const posts = await Posts.find().populate('topic').populate('comment').exec()
    res.json(posts)
})

exports.list = asyncHandler(async (req, res, next) => {
    const published = [];
    const posts = await Posts.find().populate('topic').populate('comments').exec();
    posts.map((ting) => {
        if (ting.published) {
            published.push(ting)
        }
    })
    res.json(published);
});

exports.create_get = asyncHandler(async (req, res, next) => {
    res.send({ message: 'post create'});
});

exports.create_post = [
    body("title", "must enter title")
        .trim()
        .isLength({ min: 1 })
        .escape(),
    body("text", "must enter text")
        .trim()
        .isLength({ min: 1 })
        .escape(),
    body("topic", "must enter topic")
        .trim()
        .isLength({ min: 1 })
        .escape(),
    body("published", "if not published post will be saved in database")
        .trim()
        .isBoolean()
        .escape(),
    asyncHandler(async (req, res, next) => {
        const errors = validationResult(req);
        const post = new Posts({
            title: req.body.title,
            text: req.body.text,
            topic: req.body.topic,
            published: req.body.published
        })

        if (!errors.isEmpty()) {
            res.status(500);
            return;
        } else {
            post.save();
            res.json(post);
        }
    })
];

exports.post_get = asyncHandler(async (req, res, next) => {
    const post = await Posts.findById(req.params.id).populate('topic').populate([{ path: 'comments', populate: [{ path: 'sender'}]}]).exec();
    const bearerHeader = req.headers.authorization
    const comments = post.comments
    const bearer = bearerHeader.split(' ')
    const token = bearer[1]
    const decoded = jwt.verify(token, process.env.SECRET)
    const userId = decoded.id
    res.json({ post, userId, comments });
});

exports.update = [
    body("title", "must enter title")
        .trim()
        .isLength({ min: 1})
        .escape(),
    body("text", "must enter text")
        .trim()
        .isLength({ min: 1})
        .escape(),
    body("topic", "must enter topic")
        .trim()
        .isLength({ min: 1})
        .escape(),
    asyncHandler(async (req, res, next) => {
         const errors = validationResult(req);
         const post = new Posts({
            title: req.body.title,
            text: req.body.text,
            topic: req.body.topic,
            published: true,
            _id: req.params.id
         });

         if (!errors.isEmpty()) {
            const oldPost = await Posts.findById(req.params.id).populate('topic').exec();
            res.status(500).json(oldPost);
         } else {
            const updatedPost = await Posts.findByIdAndUpdate(req.params.id, post, {} );
            res.json(updatedPost);
         }
    })
];

exports.delete = asyncHandler(async (req, res, next) => {
    await Posts.findByIdAndRemove(req.params.id);
    res.redirect('/posts');
});