const passport = require('passport');
const { Strategy: LocalStrategy } = require('passport-local');
const bcrypt = require('bcrypt');
const { User } = require('../models');

module.exports = () => {
  passport.use(
    new LocalStrategy(
      {
        usernameField: 'email',
        passwordField: 'password',
      },
      async (email, password, done) => {
        try {
          const user = await User.findOne({
            where: { email },
          });
          // 사용자가 존재하지 않을 때
          if (!user) {
            // done(서버에러, 성공, 클라이언트에러)
            return done(null, false, { reason: '존재하지 않는 사용자입니다.!' });
          }
          const result = bcrypt.compare(password, user.password);
          // 비밀번호 일치 시
          if (result) {
            return done(null, user);
          }
          // 비밀번호 일치하지않는 경우
          return done(null, false, { reason: '비밀번호가 틀렸습니다.' });
        } catch (e) {
          console.error(e);
          // 서버 에러인 경우
          return done(error);
        }
      }
    )
  );
};
