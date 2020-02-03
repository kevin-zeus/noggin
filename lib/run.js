const path = require('path');
const helper = require('./helper');
const cfg_app = require('./config').app;
const artTemplate = require('art-template');

const errTemp = `
<style>
#list { line-height: 36px; padding: 0; }
#list li { padding-left: 8px; }
#list li:nth-of-type(odd){ background:#FFCC99;}
#list li:nth-of-type(even){ background:#FFFFCC;}
</style>
<body style="margin:30px; padding: 50px;border: 1px solid #c2c2c2;">
<h3 style="color: red;border-bottom:1px solid red;">错误信息：{{message}}</h3>
<ul id="list">
{{each stack}}
<li>{{$value}}</li>
{{/each}}
</ul>
<p style="color: #989898; text-align: center; font-size: 14px; margin-top: 30px;">zsjs - 一个简单的NodeJS后端MVC框架</p>
</body>
`;

const reg = /^[a-zA-Z]+$/;

async function runAction(ctx, next, type) {
  // 默认应用名只有api和app两个
  if (!reg.test(ctx.application)) {
    throw new Error(`应用名不合法：${ctx.application}`);
  }

  if (!reg.test(ctx.controller)) {
    throw new Error(`控制器名不合法：${ctx.application}/${ctx.controller}`);
  }

  if (!reg.test(ctx.action)) {
    throw new Error(`方法名不合法：${ctx.application}/${ctx.controller}/${ctx.action}`);
  }

  if (!ctx.$zs[ctx.application]) {
    if (cfg_app.debug) {
      throw new Error(`应用${ctx.application}不存在！`);
    }
    return;
  }

  // 类型为模板文件的话就直接输出模板
  if (type === cfg_app.view_folder) {
    const content = await helper.readFile(
      path.join(
        ctx.$zs[ctx.application][type].$path,
        `${ctx.controller}${cfg_app.view_depr}${ctx.action}${cfg_app.view_ext}`
      )
    );
    if (!content && cfg_app.debug) {
      throw new Error(`模板文件${ctx.application}/${ctx.controller}/${ctx.action}${cfg_app.view_ext}不存在！`);
    }
    ctx.body = content;
    return;
  }

  // 判断controller目录是否存在
  if (!ctx.$zs[ctx.application][type]) {
    if (cfg_app.debug) {
      throw new Error(`目录:${ctx.application}/${type}不存在！`);
    }
    return;
  }

  // 判断URL中的控制器类文件是否存在
  if (!ctx.$zs[ctx.application][type][ctx.controller]) {
    if (cfg_app.debug) {
      throw new Error(`控制器类:${ctx.application}/${type}/${ctx.controller}不存在！`);
    }
    return;
  }

  // 判断是否存在URL中的方法
  if (typeof ctx.$zs[ctx.application][type][ctx.controller][ctx.action] != 'function') {
    if (cfg_app.debug) {
      throw new Error(`方法:${ctx.application}/${type}/${ctx.controller}/${ctx.action}不存在！`);
    }
    return;
  }

  //执行控制器方法
  await ctx.$zs[ctx.application][type][ctx.controller][ctx.action]();
}

/**
 * 执行程序
 * @param {Object} ctx 
 * @param {Function} next 
 * @param {String} type 默认为controller，可以为view——直接输出模板
 */
async function run(ctx, next, type = cfg_app.controller_folder) {
  try {
    await runAction(ctx, next, type);
  } catch (error) {
    ctx.status = 500;
    if (cfg_app.debug) {
      ctx.body =artTemplate.render(errTemp, {
        message: error.message,
        stack: error.stack.split('\n').slice(1),
      })
    } else {
      ctx.body = 'Error：服务端错误';
    }
  }
}

module.exports = run;