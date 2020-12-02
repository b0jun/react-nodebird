const express = require('express');
const bcrypt = require('bcrypt');
const { User } = require('../models');

const router = express.Router();

// Post /user/login
router.post('/login', (req, res, next) => {});

// Post /user/
router.post('/', async (req, res, next) => {
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

module.exports = router;
