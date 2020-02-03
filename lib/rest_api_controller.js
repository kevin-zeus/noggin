class ApiController {
  constructor(ctx, next) {
    this.ctx = ctx;
    this.next = next;
    this._init();
  }

  _init() {}

  index() {
    this.error(0, 'Not Found', 404);
  }

  show() {
    this.error(0, 'Not Found', 404);
  }

  create() {
    this.error(0, 'Not Found', 404);
  }

  update() {
    this.error(0, 'Not Found', 404);
  }

  destroy() {
    this.error(0, 'Not Found', 404);
  }

  /**
   * 成功返回的数据
   * @param {*} data json数据内容
   * @param {*} status Http状态码，默认为200
   */
  success(data, status = 200, error_code = 0) {
    this.status = status;
    const res = {
      error_code,
      message: 'success',
      result: data,
    }
    this.body = res;
  }

  /**
   * 出错返回的数据
   * @param {Number} error_code 自定义错误码
   * @param {String} message 错误说明
   * @param {Number} status Http状态码，默认为500
   */
  error(error_code, message, status = 500, ) {
    this.status = status;
    const res = {
      error_code,
      message,
    }
    this.body = res;
  }

  /**
   * 直接返回Json数据
   * @param {Object} data 需要返回的Json数据
   * @param {Number} status HTTP状态码，默认为200
   */
  json(data, status) {
    this.status = status;
    this.body = data;
  }

  set status(value) {
    this.ctx.status = value;
  }

  set body(data) {
    this.ctx.body = data;
  }
}

module.exports = ApiController;
