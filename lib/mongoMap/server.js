const MongoClient = require('mongodb').MongoClient;
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
  } else if (typeof arg !== 'object') {
    result = {
      arg: arg
    }
  } else if (arg){
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

module.exports = function (config) {
  const {url, dbName} = config;
  const dbNameReg = new RegExp(`^\/${dbName}\/`);

  var db;

  MongoClient.connect(url, function (err, client) {
    if (err) {
      throw err;
    }
    console.log('config mongo success');

    db = client.db(dbName);
  });


  return async function (ctx, next) {
    var {path, query, body, method} = ctx.request;
    method = method.toUpperCase();
    if (dbNameReg.test(path) && ['POST', 'GET'].includes(method)) {
      const [_,collectionName, methodName, key, value] = path.split('/').filter((item) => !!item);
      var arg; // 查询
      var doc; // 条件
      var options = {};
      if (method === 'GET') {
        arg = query.arg;
        doc = query.doc;
      } else {
        arg = body.arg;
        doc = body.doc;
      }
      try {
        arg = JSON.parse(arg)
      } catch(e) {
      }
      try {
        doc = JSON.parse(doc)
      } catch(e) {
      }

      console.log('arg:', key, ',',value, ',', arg);

      arg = generateArg(key, value, arg);

      console.log('arg:', arg);
      try {
        var result = await new Promise((resolve, reject) => {
          const fn = db.collection(collectionName)[methodName];
          if (!fn) {
            return reject(new Error(`"${methodName}" ist a  function`));
          }
          const args = [arg, doc, options, function (err, result) {
            if (err) {
              reject(err);
            } else {
              if (result.toArray) {
                result = result.toArray().then(docs => {
                  resolve(docs);
                })
              } else {
                resolve(result)
              }
            }
          }];

          if (!/^update/.test(methodName)) {
            args.splice(1, 1);
          }

          fn.apply(db.collection(collectionName), args);
        });

        if (result.length && result.length === 1) {
          result = result[0]
        }
        ctx.body = {
          success: true,
          data: result,
        }
      } catch(err) {
        ctx.status = 500;
        ctx.body = err.message;
      }

    } else {
      await next;
    }
  }
}
