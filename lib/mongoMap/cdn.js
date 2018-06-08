const fs = require('fs');
const path = require('path');

function saveFile(file, dir) {
  const reader = fs.createReadStream(file.path);
  console.log(file);
}

module.exports = function createCdn(config) {
  const targetDir = config.dir;

  return async function cdn(ctx, next) {
    const {method, body} = ctx.request;

    console.log(method);
    console.log(body.files);
    if (method === 'POST' && body.files.file) {

      saveFile(body.files.file, targetDir);

      this.body = {
        success: true,
      };
    } else {
      await next();
    }
  }
}
