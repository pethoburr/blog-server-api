/* eslint-disable no-unused-vars */
const Topics = require("../models/topics");
const Posts = require("../models/posts");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");

exports.list = asyncHandler(async (req, res, next) => {
    const topics = await Topics.find().exec()
    const posts = await Posts.find().populate('topic').exec()
    res.json({topics, posts});
});

exports.create = [
    body("title", "must enter topic name")
        .trim()
        .isLength({ min: 1})
        .escape(),
    body("description", "must describe topic")
        .trim()
        .isLength({ min: 1})
        .escape(),

    asyncHandler(async (req, res, next) => {
        const errors = validationResult(req);
        const topic = new Topics({
            title: req.body.title,
            description: req.body.description
        })

        if (!errors.isEmpty()) {
            res.status(500);
            return;
        } else {
            const topicExists = await Topics.findOne({ title: req.body.title }).exec();
            if (topicExists) {
                res.status(500);
            } else {
                await topic.save();
                res.json(topic);
            }
        }
    })
];

exports.update = [
    body("title", "must enter topic title")
        .trim()
        .isLength({ min: 1})
        .escape(),
    body("description", "must enter topic description")
        .trim()
        .isLength({ min: 1})
        .escape(),
    asyncHandler(async (req, res, next) => {
        const errors = validationResult(req);
        const topic = new Topics({
            title: req.body.title,
            description: req.body.description,
            _id: req.params.id
        })

        if (!errors.isEmpty()) {
            const topic = await Topics.findById(req.params.id).exec();
            res.status(500).json(topic);
        } else {
            const updatedTopic = await Topics.findByIdAndUpdate(req.params.id, topic, {});
            res.json(updatedTopic);
        }
    })
];

exports.delete_post = asyncHandler(async (req, res, next) => {
    console.log('here')
    const [posts, topic] = await Promise.all([
        Posts.find({ topic: req.params.id}).exec(),
        Topics.findById(req.params.id).exec()
    ])
    console.log('here')
    console.log(posts)
    if (posts.length > 0) {
        res.status(500).json({ message: 'need to delete all posts before you can delete topic'});
        return;
    } else {
        await Topics.findByIdAndRemove(req.params.id);
        res.json(topic);
    }
})

exports.topic_get = asyncHandler(async (req, res, next) => {
    const topic = await Topics.findById(req.params.id).exec();
    const relevantPosts = await Posts.find({ topic:  req.params.id }).exec();
    res.json({topic, relevantPosts});
});