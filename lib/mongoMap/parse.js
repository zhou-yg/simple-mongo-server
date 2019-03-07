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
      cursor = query.cursor;
    } else {
      arg = body.arg;
      doc = body.doc;
      cursor = body.cursor;
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

    if (methodName === 'find') {
      if ( cursor === undefined) {
        cursor = {
          toArray: [],
        };
      }
      if (arg && typeof arg === 'object') {
        arg = Object.keys(arg).map(k => {
          let v = arg[k];
          if (/^\/[\s\S]*?\/(g|i)?$/.test(v)) {
            let tags = v.match(/[ig]+?$/) || '';
            if (tags) {
              tags = tags[0];
            }

            v = v.replace(new RegExp(`${tags}$`), '').replace(/^\//, '').replace(/\/$/, '');
            v = new RegExp(v, tags);
          }
          return {
            [k]: v,
          };
        }).reduce((p, n) => Object.assign(p, n), {});
        console.log(`arg:`, arg);
      }
    }

    ctx.request.sms = {
      arg,
      doc,
      cursor,
      options,
      collectionName,
      methodName,
    };

    return next();
  }
}
