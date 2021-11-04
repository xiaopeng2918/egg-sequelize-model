'use strict';
module.exports = app => {
  const { STRING, INTEGER } = app.Sequelize;
  const Users = app.model.define(
    'users',
    {
      id: { type: STRING, primaryKey: true },
      username: { type: STRING(255) },
      nickname: STRING(255),
      avatar: STRING(255),
      sex: INTEGER(11),
      age: INTEGER(11),
    },
    {
      timestamps: false, // 自动增加创建时间
      tableName: 'users', // 设置表名称
    }
  );
  return Users;
};
