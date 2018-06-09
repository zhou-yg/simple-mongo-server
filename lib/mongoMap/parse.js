const ObjectID = require('mongodb').ObjectID;

function generateArg(key, value, arg) {
  var result = {};
  if (key) {
    let keyValue = value ? value : arg;
    if (key === 'id' || key === '_id') {
      keyValue = ObjectID(keyValue);
    }
    result = {
      [key]: keyValue
    }
  } else if (arg && typeof arg !== 'object') {
    result = {
      arg: arg
    }
  } else if (arg) {
    if (arg.id || arg.id === 0) {
      arg.id = ObjectID(arg.id);
    }
    if (arg._id || arg._id === 0) {
      arg._id = ObjectID(arg._id);
    }
    result = arg;
  }

  return result;
}

module.exports = () => {
  return (ctx, next) => {
    var {path, query, body, method} = ctx.request;
    method = method.toUpperCase();
    const [_,collectionName, methodName, key, value] = path.split('/').filter((item) => !!item);
    var arg; // 查询
    var doc; // 设置更新内容
    var options = {};
    console.log(body, query);
    if (method === 'GET') {
      arg = query.arg;
      doc = query.doc;
    } else {
      arg = body.arg;
      doc = body.doc;
    }
    if (typeof arg === 'string') {
      try {
        arg = JSON.parse(arg)
      } catch(e) {
      }
    }
    if (typeof doc === 'string') {
      try {
        doc = JSON.parse(doc)
      } catch(e) {
      }
    }

    console.log('arg:', key, ',',value, ',', arg);

    arg = generateArg(key, value, arg);

    ctx.request.sms = {
      arg,
      doc,
      options,
      collectionName,
      methodName,
    };

    return next();
  }
}
