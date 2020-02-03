const path = require('path');
const Koa = require('koa');
const cfg_app = require('./config').app;

// 实例化koa对象
const app = new Koa();

// 当在开发环境下，控制台输出路由访问的基本信息
cfg_app.debug && app.use(async (ctx, next) => {
  const start = new Date();
  await next();
  const ms = new Date() - start;
  console.log(`${ctx.method} ${ctx.status} ${ctx.url} - ${ms} ms`);
});

// 加载静态文件
cfg_app.static_dir && app.use(require('koa-static')(
  path.join(
    path.dirname(module.parent.parent.filename),
    cfg_app.static_dir
  )
));

// 支持post参数获取
app.use(require('koa-bodyparser')());

// TODO：封装$zs对象，$zs对象是从根目录开始的
app.use(async (ctx, next) => {
  ctx.$zs = require('noader')(
    path.dirname(module.parent.parent.filename),
    ctx,
    next
  );
  ctx.$zs.config === undefined && (ctx.$zs.config = {});
  ctx.$zs.config.app = cfg_app;
  await next();
})

// TODO：封装路由
const router = require('./router');
app.use(router.routes());
app.use(router.allowedMethods());

// 监听错误处理
app.on('error', (err, ctx) => {
  console.log('server error:', err, ctx);
});

module.exports = app;