const MongoClient = require('mongodb').MongoClient;

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
    if (dbNameReg.test(path)) {
      const [_,collectionName, methodName, key, value] = path.split('/').filter((item) => !!item);
      var {arg} = query;
      try {
        arg = JSON.parse(arg)
      } catch(e) {}

      if (key) {
        if (value) {
          arg = {
           [key]: value
         }
        } else {
          arg = {
           [key]: arg
         }
        }
      } else if (typeof arg !== 'object') {
        arg = {
          arg: arg
        }
      }

      console.log('mthod:', method);
      console.log('body:', body);
      try {
        var result = await new Promise((resolve, reject) => {
          const fn = db.collection(collectionName)[methodName];
          if (!fn) {
            return reject(new Error(`"${methodName}" ist a  function`));
          }

          db.collection(collectionName)[methodName](arg, function (err, result) {
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
          })
        });
        if (result.length && result.length === 1) {
          result = result[0]
        }
        console.log(result);
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
