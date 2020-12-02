module.exports = (sequelize, DataTypes) => {
  // MySQL에는 Post => posts 로 변환되어 생성
  const Post = sequelize.define(
    'Post',
    {
      content: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
    },
    {
      // utf8: 한글, mb4: 이모티콘
      charset: 'utf8mb4',
      collate: 'utf8mb4_general_ci',
    }
  );
  Post.associate = (db) => {
    db.Post.belongsTo(db.User);
    db.Post.belongsToMany(db.Hashtag, { through: 'PostHashtag' });
    db.Post.hasMany(db.Comment);
    db.Post.hasMany(db.Image);
    db.Post.belongsToMany(db.User, { through: 'Like', as: 'Likers' }); // through, 조인테이블 명명
    db.Post.belongsTo(db.Post, { as: 'Retweet' }); // RetweetId
  };
  return Post;
};
