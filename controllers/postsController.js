/* eslint-disable no-unused-vars */
const Posts = require("../models/posts");
const User = require('../models/user')
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const jwt = require('jsonwebtoken')

exports.latest = asyncHandler(async (req, res, next) => {
    const published = []
    const latestFive = await Posts.find().limit(5).populate('topic').exec()
    latestFive.map((ting) => {
        if (ting.published) {
            published.push({
                _id: ting._id,
                title: ting.title,
                author: ting.author,
                text: ting.text,
                time: ting.date,
                topic: ting.topic,
                published: ting.published,
                comments: ting.comments
            })
        }
    })
    res.json(published)
})

exports.list_all = asyncHandler(async (req, res, next) => {
    const formatted = []
    const posts = await Posts.find().populate('topic').populate('comments').populate({ path: 'comments', populate: { path: 'sender', select: 'username'}}).exec()
    console.log(posts[0].comments)
    posts.map((ting) => {
        formatted.push({
            _id: ting._id,
                title: ting.title,
                author: ting.author,
                text: ting.text,
                time: ting.date,
                topic: ting.topic,
                published: ting.published,
                comments: ting.comments
        })
    })
    res.json(formatted)
})

exports.list = asyncHandler(async (req, res, next) => {
    const published = [];
    const posts = await Posts.find().populate('topic').populate('comments').exec();
    posts.map((ting) => {
        if (ting.published) {
            published.push({
                _id: ting._id,
                title: ting.title,
                author: ting.author,
                text: ting.text,
                time: ting.date,
                topic: ting.topic,
                published: ting.published,
                comments: ting.comments
            })
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
        .isLength({ min: 1 }),
    body("topic", "must enter topic")
        .trim()
        .isLength({ min: 1 })
        .escape(),
    body("published", "need to specify whether to publish or just store in database")
        .trim()
        .isBoolean()
        .escape(),
    asyncHandler(async (req, res, next) => {
        console.log('here')
        const errors = validationResult(req)
        const bearerHeader = req.headers.authorization
        const bearer = bearerHeader.split(' ')
        const token = bearer[1]
        const decoded = jwt.verify(token, process.env.SECRET)
        const userId = decoded.id
        const maker = await User.findById(userId)
        const name = `${maker.first_name} ${maker.last_name}`
        const post = new Posts({
            title: req.body.title,
            author: name,
            text: req.body.text,
            time: Date.now(),
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
    const copy = comments
    const formatted = []
    copy.map((cmnt) => {
        console.log(cmnt.date)
        formatted.push({
            _id: cmnt._id,
            time: cmnt.date,
            text: cmnt.text,
            sender: cmnt.sender,
            __v: cmnt.__v
        })
    })
    console.log(formatted)
    console.log('cmnts:')
    console.log(comments)
    const bearer = bearerHeader.split(' ')
    const token = bearer[1]
    const decoded = jwt.verify(token, process.env.SECRET)
    const userId = decoded.id
    res.json({ post, userId, formatted });
});

exports.update = [
    body("title", "must enter title")
        .trim()
        .isLength({ min: 1})
        .escape(),
    body("text", "must enter text")
        .trim()
        .isLength({ min: 1}),
    body("topic", "must enter topic")
        .trim()
        .isLength({ min: 1})
        .escape(),
    body("published", "need to specify whether to publish or just store in database")
        .trim()
        .isBoolean()
        .escape(),
    asyncHandler(async (req, res, next) => {
         const errors = validationResult(req);
         const bearerHeader = req.headers.authorization
         const bearer = bearerHeader.split(' ')
         const token = bearer[1]
         const decoded = jwt.verify(token, process.env.SECRET)
         const userId = decoded.id
         const maker = await User.findById(userId)
        const name = `${maker.first_name} ${maker.last_name}`
         const post = new Posts({
            title: req.body.title,
            author: name,
            text: req.body.text,
            time: Date.now(),
            topic: req.body.topic,
            published: req.body.published,
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
   const deleted = await Posts.findByIdAndRemove(req.params.id);
   res.json(deleted);
});