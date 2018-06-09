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
    var {path, method, sms} = ctx.request;
    const {arg, doc, collectionName, methodName, options} = sms;
    method = method.toUpperCase();
    if (dbNameReg.test(path) && ['POST', 'GET'].includes(method)) {

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
