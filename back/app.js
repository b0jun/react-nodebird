const express = require('express');
const cors = require('cors');

const userRouter = require('./routes/user');
const postRouter = require('./routes/post');
const db = require('./models');

const app = express();

db.sequelize
  .sync()
  .then(() => {
    console.log('db 연결 성공');
  })
  .catch(console.error);

// Body
app.use(
  cors({
    origin: true,
    credentials: false,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/user', userRouter);
app.use('/post', postRouter);

app.listen(4000, () => {
  console.log('서버 실행 중!');
});
