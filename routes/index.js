/* eslint-disable no-unused-vars */
var express = require('express');
var router = express.Router();
const passport = require('passport');
const user_controller = require("../controllers/userController");
const posts_controller = require("../controllers/postsController");
const comment_controller = require("../controllers/commentsController");
const topics_controller = require("../controllers/topicsController");
const jwt = require('jsonwebtoken')
require('dotenv').config();

// flyctl: C:\Users\mpaha\.fly\bin\flyctl.exe

router.get('/', posts_controller.latest);

router.get('/posts', passport.authenticate('jwt', {session: false}), posts_controller.list);

router.get('/admin/posts', passport.authenticate('jwt', {session: false}), posts_controller.list_all);

router.route('/posts/create').get(posts_controller.create_get).post(posts_controller.create_post);

router.get('/posts/:id', passport.authenticate('jwt', {session: false}), posts_controller.post_get);

router.post('/posts/:id/update', posts_controller.update);

router.post('/posts/:id/delete', posts_controller.delete);

router.get('/topics', passport.authenticate('jwt', {session: false}), topics_controller.list);

router.get('/topics/:id', topics_controller.topic_get);

router.post('/topics/create', topics_controller.create);

router.post('/topics/:id/update', topics_controller.update);

router.post('/topics/:id/delete', topics_controller.delete_post);

router.route('/sign-up').get(user_controller.sign_up_get).post(user_controller.sign_up_post);


router.get('/comments/id', comment_controller.user_id)

router.post('/posts/:id/comments/:commentsId/delete', comment_controller.delete_post);

router.route('/posts/:id/comments/:commentsId/update').get(comment_controller.update_get).post(comment_controller.update_post);

router.post('/posts/:id/comments/add', comment_controller.add_post);

router.post('/admin/log-in', (req, res, next) => {
  passport.authenticate('local', function (err, user, info) {
    if (err) { 
      return next(err)
    }
    if (!user.admin) {
      if (info === undefined) {
        return res.json("Must be admin user")
      }
      return res.json(info)
    }
    const userId = user._id.toString() 
    const token = jwt.sign({ id: userId}, process.env.SECRET, { expiresIn: 60 * 60 * 24 * 30})
    return res
      .cookie('token', token, { httpOnly: true, secure: false, path: '/', sameSite: 'lax'})
      .status(200)
      .json({ user, token })
  })(req, res, next)
})

router.post('/log-in', function(req, res, next) {
    passport.authenticate('local', function(err, user, info) {
        if (err) { return next(err)}
        if (!user) {
          console.log(info)
          return res.status(400).json(info)
        }
        const userId = user._id.toString()
        const token = jwt.sign({ id: userId}, process.env.SECRET)
        res.status(200).json({ user, token })
    })(req, res, next)
});

module.exports = router;