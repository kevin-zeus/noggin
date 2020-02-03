const router = require('koa-router')();
const run = require('./run');
const cfg = require('./config');

const { app: cfg_app, routes } = cfg;

// 注册用户路由 path: 控制器名/方法名
if (routes && routes.length !== 0) {
  const methods = ['get', 'post', 'put', 'patch', 'delete', 'del'];
  routes.forEach(route => {
    if (!route.method || !methods.includes(route.method)) {
      route.method = 'all';
    }
    // 当路由是一个函数时
    if (typeof route.path === 'function') {
      router[route.method](route.url, route.path);
    }
    // 当路由是路径时
    const paths = route.path.trim('/').split('/');
    router[route.method](route.url, async (ctx, next) => {
      ctx.controller = paths[0] || cfg_app.default_controller;
      ctx.action = paths[1] || cfg_app.default_action;
      await run(ctx, next, route.type);
    });
  });
}

/**
 * API 路由解析
 */
// 获取内容列表
router.get('/api/:controller', async (ctx, next) => {
  setCtx(ctx, true, 'index');
  await run(ctx, next);
});
// 展示内容
router.get('/api/:controller/:id', async (ctx, next) => {
  setCtx(ctx, true, 'show');
  await run(ctx, next);
});
// 创建一条内容
router.post('/api/:controller', async (ctx, next) => {
  setCtx(ctx, true, 'create');
  await run(ctx, next);
});
// 更新内容
router.put('/api/:controller/:id', async (ctx, next) => {
  setCtx(ctx, true, 'update');
  await run(ctx, next);
});
// 删除内容
router.delete('/api/:controller/:id', async (ctx, next) => {
  setCtx(ctx, true, 'destroy');
  await run(ctx, next);
});


/**
 * 普通控制器下的路由默认解析
 */
// 控制器名+方法名
router.all('/:controller/:action', async (ctx, next) => {
  setCtx(ctx);
  await run(ctx, next);
});

// 控制器名
router.all('/:controller', async (ctx, next) => {
  setCtx(ctx);
  await run(ctx, next);
});

router.all('/', async (ctx, next) => {
  setCtx(ctx);
  await run(ctx, next);
});

function setCtx(ctx, isApi = false, action) {
  if (isApi) { // 当是API应用的时候
    ctx.isApi = isApi;
    ctx.application = 'api';
    ctx.controller = ctx.params.controller;
    if (!action) {
      throw new Error('在Router核心文件中，setCtx函数缺少action实参');
    }
    ctx.action = action;
  } else {
    ctx.application = 'app';
    ctx.controller = ctx.params.controller || cfg_app.default_controller;
    ctx.action = ctx.params.action || cfg_app.default_action;
  }
  delete ctx.params.controller;
  delete ctx.params.action;
}

module.exports = router;