const express = require('express');
const cors = require('cors');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const passport = require('passport');
const dotenv = require('dotenv');
const passportConfig = require('./passport');
const userRouter = require('./routes/user');
const postRouter = require('./routes/post');
const db = require('./models');

dotenv.config();
const app = express();

db.sequelize
  .sync()
  .then(() => {
    console.log('db 연결 성공');
  })
  .catch(console.error);
passportConfig();

// Body
app.use(
  cors({
    origin: 'http://localhost:4000', // true 도 가능
    credentials: true, // 쿠키 전달 시
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  session({
    saveUninitialized: false,
    resave: false,
    secret: process.env.COOKIE_SECRET,
  })
);
app.use(passport.initialize());
app.use(passport.session());

app.use('/user', userRouter);
app.use('/post', postRouter);

// 에러처리 미들웨어 : 기본적으로 들어있지만 특정 에레피이지같은 커스텀이 필요하면 아래와 같이 따로 만들어 줘야함
// app.use((err, req, res, next) => {});

app.listen(4000, () => {
  console.log('서버 실행 중!');
});
