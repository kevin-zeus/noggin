const fs = require('fs');
// 判断是否是文件
const isFileSync = (path) => fs.existsSync(path) && fs.statSync(path).isFile();
// 判断是否是目录
const isDirSync = (path) => fs.existsSync(path) && fs.statSync(path).isDirectory();

const readFile = (path, type = 'string') => {
  return new Promise(function (resolve, reject) {
    fs.readFile(path, function (err, data) {
      if (err) reject(type == 'string' ? err.toString() : err);
      else resolve(type == 'string' ? data.toString().replace(/^\uFEFF/, '') : data);
    });
  });
}

module.exports = {
  isFileSync,
  isDirSync,
  readFile,
  zs: require('noader'),
}