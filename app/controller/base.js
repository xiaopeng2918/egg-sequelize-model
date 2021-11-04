'use strict';

const Controller = require('egg').Controller;

class BaseController extends Controller {
  /* 操作成功，返回数据 */
  async success(data, msg, code = 200) {
    const { ctx } = this;
    ctx.body = {
      code,
      msg,
      data,
    };
  }

  /* 操作失败，返回数据 */
  async error(msg, code = 403) {
    const { ctx } = this;
    ctx.body = {
      code,
      msg,
    };
  }
}

module.exports = BaseController;
