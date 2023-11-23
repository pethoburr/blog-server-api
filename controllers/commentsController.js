/* eslint-disable no-unused-vars */
const Posts = require("../models/posts");
const User = require("../models/user")
const Comment = require("../models/comments");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const jwt = require('jsonwebtoken')
require('dotenv').config();

exports.posts_comments = asyncHandler(async (req, res, next) => {
    const post = await Posts.findById(req.params.id).populate('topic').populate([{ path: 'comments', populate: [{ path: 'sender'}]}]).exec();
    const comments = post.comments;
    res.json({comments});
});

exports.add_post =
    [
        body("text", "Must enter text")
            .trim()
            .isLength({ min: 1 })
            .escape(),
        asyncHandler(async (req, res, next) => {
                const errors = validationResult(req);
                const cook = req.cookies.token
                console.log('cook')
                console.log(cook)
                const bearerHeader = req.headers.authorization
                const bearer = bearerHeader.split(' ')
                const token = bearer[1]
                const decoded = jwt.verify(token, process.env.SECRET)
                const comment = new Comment({
                    time: Date.now(),
                    text: req.body.text,
                    sender: decoded.id,
                })
                if (!errors.isEmpty()) {
                    res.status(500).json(errors);
                    return;
                } else {
                    await comment.save();
                    const updatedPost = await Posts.findOneAndUpdate({ _id: req.params.id}, { $push: { comments: comment}}, { new: true })
                    const commenter = await User.findById(decoded.id).exec()
                    const newComment = {
                        _id: comment._id,
                        time: comment.date,
                        text: comment.text,
                        sender: {
                            _id: comment.sender._id,
                            username: commenter.username
                        }
                    }
                    console.log(newComment)
                    return res.json({ newComment, updatedPost });
                }
            })
    ];

exports.update_get = asyncHandler(async (req, res, next) => {
    const comment = Comment.findById(req.params.commentId).populate('sender').exec();
    if (comment === null) {
        const err = new Error("comment not found");
        err.status = 404;
        return next(err);
    }
    res.json(comment);
});

exports.update_post = [
    body("text", "must enter valid text")
        .trim()
        .isLength({ min: 1 })
        .escape(),

    asyncHandler(async (req, res, next) => {
        const errors = validationResult(req);
        const bearerHeader = req.headers.authorization
        const bearer = bearerHeader.split(' ')
        const token = bearer[1]
        const decoded = jwt.verify(token, process.env.SECRET)
        const userId = decoded.id
        console.log(userId)
        const comment = new Comment({
            time: Date.now(),
            text: req.body.text,
            sender: userId,
            _id: req.params.commentsId
        })
        console.log('first here')
        if (!errors.isEmpty()) {
            const comment = Comment.findById(req.params.commentId).populate('sender').exec();
            res.json(comment);
            return;
        } else {
            await Comment.findByIdAndUpdate(req.params.commentsId, comment, {});
            res.json(comment);
        }
    })
];

exports.delete_get = asyncHandler(async (req, res, next) => {
    const comment = await Comment.findById(req.params.commentId).populate('sender').exec();
    if (comment === null) {
        res.status(500);
    }
    res.json(comment);
});

exports.delete_post = asyncHandler(async (req, res, next) => {
    await Comment.findByIdAndRemove(req.body.commentId);
    await Posts.updateOne(
        { _id: req.params.id },
        { $pull: { comments: req.body.commentId } },
    )
    res.json({ status: 'success'});
});

exports.user_id = asyncHandler(async (req, res, next) => {
    const bearerHeader = req.headers.authorization
    const bearer = bearerHeader.split(' ')
    const token = bearer[1]
    const decoded = jwt.verify(token, process.env.SECRET)
    const userId = decoded.id
    res.json(userId)
})