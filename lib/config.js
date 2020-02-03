const path = require('path');
const user_cfg = require('noader')(
  path.join(path.dirname(module.parent.parent.parent.filename)), // 这里是框架根目录
  './config'
);

const app = {
  debug: true, // 是否开启调试模式，默认开启

  app_dir: './app', // 应用目录
  api_dir: './api', // API应用目录

  controller_folder: 'controller', // 默认控制器目录名

  default_controller: 'index', // 默认控制器名
  default_action: 'index', // 默认方法名

  view_folder: 'view',
  view_engine: 'art', // 模板引擎
  view_depr: '/', // 模板文件分隔符
  view_ext: '.htm', // 模板后缀名

  static_dir: './public/static', // 静态文件目录名
}

const database = {

}

module.exports = {
  app: {...app, ...user_cfg.app},
  route: {...user_cfg.route},
  database: {...database, ...user_cfg.database},
};

// module.exports = {
//   app,
//   database,
// }