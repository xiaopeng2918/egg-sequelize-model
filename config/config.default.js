'use strict';

module.exports = appInfo => {
  const config = exports = {};
  config.keys = appInfo.name + '_1620783032002_1928';
  config.middleware = [];
  /* 取消安全证书验证 */
  config.security = {
    csrf: {
      enable: false,
    },
    domainWhiteList: [ '*' ], // 白名单
  };
  /* 连接mysql配置 */
  config.sequelize = {
    dialect: 'mysql',
    host: 'localhost',
    port: 3306,
    database: 'blog',
    username: 'root',
    password: '123456',
  };
  /* 配置允许跨域 */
  config.cors = {
    credentials: true,
    origin: '*', // 允许任何跨域，若只允许个别IP跨域，则：origin:['http://localhost:8080']
    allowMethods: 'GET,PUT,POST,DELETE', // 被允许的请求方式
  };
  const userConfig = {};

  return {
    ...config,
    ...userConfig,
  };
};
