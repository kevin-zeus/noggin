class Controller {
  constructor(ctx, next) {
    this.ctx = ctx;
    this.next = next;
    this._view = null;
    this._init();
  }

  _init() {}

  get view() {
    if(!this._view) this._view = new (require('./view'))(this.ctx, this.next);
    return this._view;
  }
}

module.exports = Controller;
