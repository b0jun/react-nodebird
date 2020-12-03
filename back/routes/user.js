const express = require('express');
const bcrypt = require('bcrypt');
const passport = require('passport');
const { User, Post } = require('../models');
const { isLoggedIn, isNotLoggedIn } = require('./middlewares');
const db = require('../models');

const router = express.Router();

// GET /user [로그인 확인]
router.get('/', async (req, res, next) => {
  try {
    if (req.user) {
      const fullUserWithoutPassword = await User.findOne({
        where: { id: req.user.id },
        atttributes: { exclude: ['password'] },
        include: [
          { model: Post, as: 'Posts', attributes: ['id'] }, // id만 가져오는건 길이만 알면 되므로
          { model: User, as: 'Followings', attributes: ['id'] },
          { model: User, as: 'Followers', attributes: ['id'] },
        ],
      });
      res.status(200).json(fullUserWithoutPassword);
    } else {
      res.status(200).json(null); // 로그인 아닐 시 null
    }
  } catch (e) {
    console.error(e);
    next(e);
  }
});

// Post /user/login [로그인]
router.post('/login', isNotLoggedIn, (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    // err,user,info = done 에서 전달받은 것들
    if (err) {
      console.error(err);
      return next(err);
    }
    if (info) {
      return res.status(401).send(info.reason);
    }
    // 패스포트 로그인
    return req.login(user, async (loginErr) => {
      if (loginErr) {
        // 패스포트 로그인 에러 시
        console.error(loginErr);
        return next(loginErr);
      }
      const fullUserWithoutPassword = await User.findOne({
        where: { id: user.id },
        atttributes: { exclude: ['password'] },
        include: [
          { model: Post, as: 'Posts', attributes: ['id'] }, // hasMany라서 model: Post가 복수형이 되어 me.Posts가 됨
          { model: User, as: 'Followings', attributes: ['id'] }, // as 적었던건 반드시 as 명시
          { model: User, as: 'Followers', attributes: ['id'] },
        ],
      });
      return res.status(200).json(fullUserWithoutPassword);
    });
  })(req, res, next); // middleware 확장하는 구조 (next 사용가능)
});

// Post /user [회원가입]
router.post('/', isNotLoggedIn, async (req, res, next) => {
  try {
    const exUser = await User.findOne({
      where: {
        email: req.body.email,
      },
    });
    // res를 2번 보내면, can't set headers already sent 라는 에러메세지가 뜸
    if (exUser) {
      return res.status(403).send('이미 사용중인 아이디입니다.');
    }
    const hashedPassword = await bcrypt.hash(req.body.password, 12);
    await User.create({
      email: req.body.email,
      nickname: req.body.nickname,
      password: hashedPassword,
    });
    res.status(200).send('success'); // res.send('success'); 와 같이 생략이 가능하지만, 꼭 명시해주자.
  } catch (e) {
    console.error(e);
    next(e); // status 500 (서버쪽에서 처리하다가 에러난 것 이므로)
  }
});

// Post /user/logout [로그아웃]
router.post('/logout', isLoggedIn, (req, res) => {
  req.logout();
  req.session.destroy();
  res.send('ok');
});

// PATCH /user/nickname [닉네임 변경]
router.patch('/nickname', isLoggedIn, async (req, res, next) => {
  try {
    await User.update(
      {
        nickname: req.body.nickname,
      },
      { where: { id: req.user.id } }
    );
    res.status(200).json({ nickname: req.body.nickname });
  } catch (e) {
    console.error(e);
    next(e);
  }
});

// PATCH /user/10/follow [팔로우]
router.patch('/:userId/follow', isLoggedIn, async (req, res, next) => {
  try {
    const user = await User.findOne({ where: { id: req.params.userId } });
    if (!user) {
      res.status(403).send('팔로우하시려는 유저는 존재하지 않습니다.');
    }
    await user.addFollowers(req.user.id);
    res.status(200).json({ UserId: parseInt(req.params.userId, 10) });
  } catch (e) {
    console.error(e);
    next(e);
  }
});

// DELETE /user/10/follow [언팔로우]
router.delete('/:userId/follow', isLoggedIn, async (req, res, next) => {
  try {
    const user = await User.findOne({ where: { id: req.params.userId } });
    if (!user) {
      res.status(403).send('언팔로우하시려는 유저는 존재하지 않습니다.');
    }
    await user.removeFollowers(req.user.id);
    res.status(200).json({ UserId: parseInt(req.params.userId, 10) });
  } catch (e) {
    console.error(e);
    next(e);
  }
});

// DELETE /user/follower/10[언팔로우]
router.delete('/follower/:userId', isLoggedIn, async (req, res, next) => {
  try {
    const user = await User.findOne({ where: { id: req.params.userId } });
    if (!user) {
      res.status(403).send('없는 사람을 언팔로우할 수 없습니다.');
    }
    await user.removeFollowings(req.user.id);
    res.status(200).json({ UserId: parseInt(req.params.userId, 10) });
  } catch (e) {
    console.error(e);
    next(e);
  }
});

// GET /user/followers [팔로워 목록]
router.get('/followers', isLoggedIn, async (req, res, next) => {
  try {
    const user = await User.findOne({ where: { id: req.user.id } });
    if (!user) {
      res.status(403).send('없는 사람을 찾을 수 없습니다.');
    }
    const followers = await user.getFollowers();
    res.status(200).json(followers);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

// GET /user/followings [팔로잉 목록]
router.get('/followings', isLoggedIn, async (req, res, next) => {
  try {
    const user = await User.findOne({ where: { id: req.user.id } });
    if (!user) {
      res.status(403).send('없는 사람을 찾으려고 하시네요?');
    }
    const followings = await user.getFollowings();
    res.status(200).json(followings);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

module.exports = router;
