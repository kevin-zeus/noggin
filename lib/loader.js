/* eslint-disable new-cap */
/* eslint-disable no-param-reassign */
/* eslint-disable global-require */
/* eslint-disable import/no-dynamic-require */
/**
 * 文件加载工具函数库
 */
const fs = require('fs');
const pt = require('path');
const isClass = require('is-class');

const isFile = (path) => fs.existsSync(path)
  && fs.statSync(path).isFile();

const isDir = (path) => fs.existsSync(path)
  && fs.statSync(path).isDirectory();

const dirs = {};

function loader(dir = './', ...args) {
  const _maps = new Map();
  const _root = {};

  _maps.set(_root, {
    path: pt.isAbsolute(dir) ? pt.join(dir, './') : pt.join(pt.dirname(module.parent.filename), dir, './'),
    is_class: false,
  });

  // eslint-disable-next-line no-use-before-define
  return creatLoader(_root);

  function creatLoader(obj) {
    return new Proxy(obj, {
      get: (target, prop) => {
        if (prop in target || typeof prop === 'symbol' || prop === 'inspect') {
          return target[prop];
        }
        const map = _maps.get(target);
        if (map.is_class) {
          if (!map.instance) {
            map.instance = new target(...args);
          }
          if (map.instance[prop]) {
            return map.instance[prop];
          }
          return prop === '$map'
            ? map
            : map.instance[prop];
        }
        if (prop === '$map') {
          return map;
        }
        let child = {};
        const childPath = `${map.path}${prop}/`;
        const childFile = `${map.path}${prop}.js`;
        if (!dirs[childPath]) {
          if (isFile(childFile)) {
            dirs[childPath] = 'file';
          } else if (isDir(childPath)) {
            dirs[childPath] = 'dir';
          } else {
            dirs[childPath] = 'none';
          }
        }
        if (dirs[childPath] === 'file') {
          child = require(childFile);
        } else if (dirs[childPath] !== 'dir') {
          return undefined;
        }
        _maps.set(child, {
          path: childPath,
          is_class: isClass(child),
        });
        target[prop] = creatLoader(child);
        return target[prop];
      },

      set: (target, prop, value) => {
        if (prop in target) {
          target[prop] = value;
          return true;
        }
        const map = _maps.get(target);
        if (map.is_class) {
          if (!map.instance) {
            map.instance = new target(...args);
          }
          map.instance[prop] = value;
          return true;
        }
        target[prop] = value;
        return true;
      },
    });
  }
}

module.exports = loader;
