'use strict';

const BaseController = require('./base');

class UserController extends BaseController {
  // 查询所有数据
  async findAll() {
    const { service } = this;
    const result = await service.user.findAll();
    this.success(result, 'OK');
  }

  // 根据ID查数据
  async findById() {
    const { ctx, service } = this;
    const id = ctx.params.id;
    const result = await service.user.findById(id);
    this.success(result, 'OK');
  }

  // 新增数据
  async add() {
    const { ctx, service } = this;
    const { username, nickname, avatar, sex, age } = ctx.request.body;
    const result = await service.user.add({ id: new Date().valueOf(), username, nickname, avatar, sex, age });
    if (result === 'Server error') this.error(0, result);
    this.success(1, result);
  }

  // 修改数据
  async edit() {
    const { ctx, service } = this;
    const { id, username, nickname, avatar, sex, age } = ctx.request.body;
    const result = await service.user.edit({ id, username, nickname, avatar, sex, age });
    if (result === 'Server error') this.error(0, result);
    this.success(1, result);
  }

  // 修改数据
  async del() {
    const { ctx, service } = this;
    const id = ctx.params.id;
    const result = await service.user.del(id);
    if (result === 'Server error') this.error(0, result);
    this.success(1, result);
  }
}

module.exports = UserController;
