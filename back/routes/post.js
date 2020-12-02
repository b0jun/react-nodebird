const express = require('express');
const { Post, Image, Comment, User } = require('../models');
const { isLoggedIn } = require('./middlewares');

const router = express.Router();

// Post /post [포스트 작성]
router.post('/', isLoggedIn, async (req, res, next) => {
  try {
    const post = await Post.create({
      content: req.body.content,
      UserId: req.user.id,
    });
    const fullPost = await Post.findOne({
      where: { id: post.id },
      include: [{ model: Image }, { model: Comment }, { model: User }],
    });
    res.status(201).json(post);
  } catch (e) {
    console.error(error);
    next(e);
  }
});

// Post /post/:postId/comment
router.post('/:postId/comment', isLoggedIn, async (req, res, next) => {
  try {
    const post = await Post.findOne({
      where: { id: req.params.postId },
    });
    // 없는 포스트에는 댓글을 달 수 없어야하므로
    if (!post) {
      return res.status(403).send('존재하지 않는 게시글입니다.');
    }
    const comment = await Comment.create({
      content: req.body.content,
      postId: req.params.postId,
      UserId: req.user.id,
    });
    res.status(201).json(comment);
  } catch (e) {
    console.error(error);
    next(e);
  }
});

router.delete('/', (req, res) => {});

module.exports = router;
