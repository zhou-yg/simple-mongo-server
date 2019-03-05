const fs = require('fs');
const path = require('path');
const shell = require('shelljs');
const moment = require('moment');

function saveFile(file, targetDir) {
  const fileParse = path.parse(file.path);
  const timing = moment().format('YYYY_MM_DD');

  const timeVersion = path.join(targetDir, timing);

  if (!fs.existsSync(timeVersion)) {
    shell.mkdir(timeVersion);
  }

  const targetPath =  timeVersion + '/' + fileParse.name + path.extname(file.name);
  shell.mv(file.path, targetPath);

  const dir = path.dirname(targetPath).replace('/' + timing, '');

  const r = targetPath.replace(dir, '');
  console.log(file.path);
  console.log(targetPath, path.extname(file.name));
  return r;
}

module.exports = function createCdn(config) {
  const targetDir = config.dir || __dirname;

  return async function cdn(ctx, next) {
    const {method, body, header, files = {}, fields, sms} = ctx.request;
    console.log(header);
    // console.log(method, ctx.is('multipart'), files);
    const keys = Object.keys(files);
    console.log(keys);
    if (method === 'POST' && keys.length > 0) {
      keys.forEach(k => {
        const targetFile = saveFile(files[k], targetDir);
        if (sms.doc) {
          sms.doc[k] = targetFile;
        } else if (sms.arg) {
          sms.arg[k] = targetFile;
        }
      });


      await next();
    } else {
      await next();
    }
  }
}
