# EggJS+MySQL（mysql2+egg-sequelize+egg-cors）实现简单的增删改查

```bash
$ npm i
$ npm run dev
$ open http://localhost:7001/
```


# 1. 简介
1. [Egg官方文档](https://eggjs.org/zh-cn/intro/quickstart.html)
2. [sequelize官方文档](https://www.sequelize.com.cn/)
## 2.1 快速初始化
官方推荐直接使用脚手架，只需几条简单指令，即可快速生成项目。
```
创建项目文件夹：mkdir egg-mysql-basic && cd egg-mysql-basic
快速初始化：npm init egg --type=simple
安装依赖：npm i
运行：npm run dev
```
## 2.2 安装所插件及配置
### 2.1 插件介绍
1. `mysql2` 操作mysql的基础库。
2. `egg-sequelize`是一个ORM 框架，在一些较为复杂的应用中，帮助我们管理数据层的代码。
3. `egg-cors`开启跨域访问。
### 2.2 安装
`npm install mysql2 egg-sequelize egg-cors --save`
### 2.3 配置已安装插件
安装插件后，还需到`config/config.default.js`和`config/plugin.js`进行配置才可以使用哦！
```js
// config/plugin.js
'use strict';

module.exports = {
    // 引入egg-sequelize包
    sequelize: {
        enable: true,
        package: 'egg-sequelize',
    },
    //引入egg-cors包
    cors: {
        enable: true,
        package: 'egg-cors',
    }
};
```
```js
// config/config.default.js
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
        domainWhiteList: ["*"], // 白名单
    };
    /* 连接mysql配置 */
    config.sequelize = {
        dialect: 'mysql',
        host: 'localhost',
        port: 3306,
        database: 'blog',
        username: "root",
        password: "123456"
    };
    /* 配置允许跨域 */
    config.cors = {
        credentials: true,
        origin: "*", //允许任何跨域，若只允许个别IP跨域，则：origin:['http://localhost:8080']
        allowMethods: 'GET,PUT,POST,DELETE', // 被允许的请求方式
    };
    const userConfig = {};

    return {
        ...config,
        ...userConfig,
    };
};
```
OK! 以上配置以及项目初始化基本完成

# 3. 编写代码

## 3.1 model层
首先，在`app/model`文件夹中对模型进行定义
```js
// app/model/users.js
'use strict';
module.exports = app => {
    const { STRING, INTEGER } = app.Sequelize;
    const Users = app.model.define('users', {
        id: { type: STRING, primaryKey: true },
        username: STRING(255),
        nickname: STRING(255),
        avatar: STRING(255),
        sex: INTEGER(11),
        age: INTEGER(11)
    }, {
        timestamps: false, //自动增加创建时间
        tableName: 'users' //设置表名称
    });
    return Users;
};
```
## 3.2 service层
其次，在`app/service`文件夹中完成主要的业务逻辑
1. 在`app/service`下，首先新建一个基础的控制层base.js,用于公共方法的编写。
```js
// app/service/base.js

'use strict';

const Service = require('egg').Service;

class BaseService extends Service {
    //查询数据
    async _findAll(modelName) {
        const { ctx, app } = this
        try {
            return await ctx.model[modelName].findAll()
        } catch (error) {
            return "Server error"
        }
    }

    //查询数据总数
    async _count(modelName) {
        const { ctx } = this
        try {
            return await ctx.model[modelName].count();
        } catch (error) {
            return "Server error"
        }
    }

    //根据ID查询数据
    async _findById(modelName, id) {
        const { ctx } = this
        try {
            const result = await ctx.model[modelName].findByPk(id);
            return result
        } catch (error) {
            return "Server error"
        }
    }

    //新增数据
    async _add(modelName, json) {
        const { ctx } = this
        try {
            await ctx.model[modelName].create(json)
            return "新增成功"
        } catch (error) {
            return "Server error"
        }
    }

    //编辑数据
    async _edit(modelName, json) {
        const { ctx } = this
        try {
            const result = await ctx.model[modelName].findByPk(json.id);
            if (!result) return false;
            await result.update({...json });
            return true
        } catch (error) {
            return "Server error"
        }
    }

    //删除数据
    async _delete(modelName, key) {
        const { ctx } = this;
        try {
            const result = await ctx.model[modelName].findByPk(key);
            if (!result) return false;
            await result.destroy();
            return true;
        } catch (error) {
            return "Server error"
        }
    }
}

module.exports = BaseService;
```
2. 在app/service下创建user.js
```js
// app/service/users.js 

'use strict';

const BaseService = require('./base');

class UsersService extends BaseService {
    //查询所有数据
    async findAll() {
        let data = await this._findAll('Users')
        let total = await this._count('Users')
        return { total, data }
    }

    //根据ID查询数据
    async findById(id) {
        return await this._findById('Users', id)
    }

    //新增数据
    async add(json) {
        return await this._add('Users', json)
    }

    //编辑数据
    async edit() {
        let data = await this._edit('Users', json);
        if (!data) return "Id传入有误"
        return data
    }

    //删除数据
    async del(id) {
        let data = await this._delete('Users', id);
        if (!data) return "Id传入有误"
        return data
    }
}

module.exports = UsersService;
```
## 3.3 controller层
再次，在`app/controller`文件夹中编写负责具体的业务模块流程的控制
1. 在`app/controller`下，首先新建一个基础的控制层base.js,用于公共方法的编写。
```js
// app/controller/base.js
'use strict';

const Controller = require('egg').Controller;

class BaseController extends Controller {
    /* 操作成功，返回数据 */
    async success(data, msg, code = 200) {
        const { ctx } = this
        ctx.body = {
            code,
            msg,
            data
        }
    }

    /* 操作失败，返回数据 */
    async error(msg, code = 403) {
        const { ctx } = this
        ctx.body = {
            code,
            msg
        }
    }
}

module.exports = BaseController;
```
2.在`app/controller`下创建user.js

```js
// app/controller/user.js
'use strict';

const BaseController = require('./base');

class UserController extends BaseController {
    //查询所有数据
    async findAll() {
        const { ctx, service } = this;
        let result = await service.user.findAll()
        this.success(result, 'OK');
    }

    //根据ID查数据
    async findById() {
        const { ctx, service } = this;
        let id = ctx.params.id
        let result = await service.user.findById(id)
        this.success(result, 'OK');
    }

    //新增数据
    async add() {
        const { ctx, service } = this;
        let { username, nickname, avatar, sex, age } = ctx.request.body
        let result = await service.user.add({ id: new Date().valueOf(), username, nickname, avatar, sex, age })
        if (result === 'Server error') this.error(0, result);
        this.success(1, result);
    }

    //修改数据
    async edit() {
        const { ctx, service } = this;
        let { id, username, nickname, avatar, sex, age } = ctx.request.body
        let result = await service.user.edit({ id, username, nickname, avatar, sex, age })
        if (result === 'Server error') this.error(0, result);
        this.success(1, result);
    }

    //修改数据
    async del() {
        const { ctx, service } = this;
        let id = ctx.params.id
        let result = await service.user.del(id)
        if (result === 'Server error') this.error(0, result);
        this.success(1, result);
    }
}

module.exports = UserController;
```

## 3.4 路由层
最后，在`app/router.js`中完成接口的编写
```js
// app/router.js

'use strict';
module.exports = app => {
    const { router, controller } = app;
    router.get('/users/findAll', controller.user.findAll);
    router.get('/users/findById/:id', controller.user.findById);
    router.post('/users/add', controller.user.add);
    router.put('/users/edit', controller.user.edit);
    router.delete('/users/del/:id', controller.user.del);
};
```

EggJS+MySQL实现简单的增删改查已经实现了。更多功能查看简介文档

# 4.运行项目
打开控制台：`npm run dev`,即可看到`http://127.0.0.1:7001`
[参考](https://juejin.cn/post/6961266180678123534)
