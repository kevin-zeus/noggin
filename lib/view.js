const path = require('path');
const helper = require('./helper');
const cfg_app = require('./config').app;

const engine = {};

class View {
  constructor(ctx, next) {
    this.ctx = ctx;
    this.next = next;
    this._engine = cfg_app.view_engine;
    this._data = {};
  }

  /**
   * 渲染文件输出
   * @param {String} template 模板文件位置，一般按controller/action命名
   * @param {Object} data 对象字面量
   * @param {Boolean} capture 为true直接返回渲染后的文本内容，默认为false将内容返回前端
   */
  async fetch(template, data, capture = false) {
    this._data = {...this._data, ...data};
    const templateFile = this.parsePath(template);
    const content = await this[this._engine]['renderFile'](
      templateFile,
      this._data,
      {
        filename: templateFile,
        cache: cfg_app.debug,
      }
    );
    if (capture) return content;
    else this.ctx.body = content;
  }

  /**
   * 渲染内容输出
   * @param {String} content 字符串内容
   * @param {Boolean} capture 为true直接返回渲染后的内容，默认为false将内容返回前端
   */
  async render(content, capture = false) {
    content = await this[this._engine]['render'](content, this._data);
    if(html) return content;
    else this.ctx.body = content;
  }

  /**
   * 直接输出内容
   * @param {String} content 文本内容，可以为html文本
   */
  async display(content) {
    this.ctx.body = content;
  }

  /**
   * 直接输出文件内容
   * @param {String} template 模板文件位置，一般按controller/action命名
   * @param {Boolean} capture 为true直接返回文件内容，默认为false将内容返回前端
   */
  async load(template, capture = false) {
    const templateFile = this.parsePath(template);
    const content = await helper.readFile(template);
    if(html) return content;
    else this.ctx.body = content;
  }

  /**
   * 赋值模板数据
   * @param {String} key 模板数据变量名
   * @param {Any} value 模板数据值
   */
  async assign(key, value){
    this._data[key] = value;
  }

  /**
   * 获取模板数据
   * @param {String} key 模板数据变量名
   */
  data(key) {
    return this._data[key];
  }

  /**
   * 获取模板引擎
   */
  get engine() {
    return this._engine;
  }

  /**
   * 设置模板引擎
   */
  set engine(value) {
    this._engine = value;
  }

  /**
   * 解析模板地址
   * @param {String} template 模板地址
   */
  parsePath(template = '') {
    let view_file = '';
    template = (template && template.trim('/')) || this.ctx.action;

    if (path.extname(template)) {
      view_file = template;
    } else {
      const temp = template.split('/');
      switch (temp.length) {
        case 1:
          view_file = `${this.ctx.application}/${cfg_app.view_folder}/${this.ctx.controller}${cfg_app.view_depr}${temp[0]}`;
          break;
        case 2:
          view_file = `${this.ctx.application}/${cfg_app.view_folder}/${temp[0]}${cfg_app.view_depr}${temp[1]}`;
          break;
        default:
          view_file = template;
      }
      view_file += cfg_app.view_ext;
    }
    view_file = path.join(this.ctx.$zs.$path, './', view_file);
    return view_file;
  }

  get art() {
    if (!engine.art) {
      engine.art = {
        renderFile: require('art-template')
      };
    }
    engine.art.render = engine.art.renderFile.render;
    return engine.art;
  }

  // 获取md引擎
  get md() {
    if(!engine.md) engine.md = require('markdown-it')();
    return engine.md;
  }
}

module.exports = View;
