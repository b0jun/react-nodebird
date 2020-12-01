module.exports = (sequelize, DataTypes) => {
  // MySQL에는 User => users 로 변환되어 생성
  const User = sequelize.define(
    'User',
    {
      email: {
        type: DataTypes.STRING(30),
        allowNull: false, // 필수
        unique: true, // 고유한 값
      },
      nickname: {
        type: DataTypes.STRING(30),
        allowNull: false,
      },
      password: {
        type: DataTypes.STRING(100), // 해쉬 값 대비 100
        allowNull: false,
      },
    },
    {
      // utf8: 한글, mb4: 이모티콘
      charset: 'utf8',
      collate: 'utf8_general_ci',
    }
  );
  User.associatge = (db) => {
    db.User.hasMany(db.Post);
    db.User.hasMany(db.Comment);
    db.User.belongsToMany(db.Post, { through: 'Like', as: 'Liked' }); // through, 조인테이블 명명
    db.User.belongsToMany(db.User, {
      through: 'Follow',
      as: 'Followers',
      foreignKey: 'FollowingId', // UserId 가 중복되니까 foreignKey를 명명해줘야한다.
    });
    db.User.belongsToMany(db.User, {
      through: 'Follow',
      as: 'Followerings',
      foreignKey: 'FollowerId',
    });
  };
  return User;
};
