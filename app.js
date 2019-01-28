/**
 * Created by zyg on 17/1/13.
 */
/**
 * Created by zyg on 16/8/8.
 */
var fs = require('fs');
var path = require('path');

var koa = require('koa');
var staticConfigCache = require('koa-static-cache');

var logger = require('koa-logger');
const koaBody = require('koa-body');

const koaSession = require('koa-session');

const parse = require('./lib/mongoMap/parse');
const mongoMap = require('./lib/mongoMap/server');
const cdn = require('./lib/mongoMap/cdn');

var app = new koa();

app.use(logger());

app.use(function (ctx, next) {
  return next();
});

app.use(staticConfigCache(path.resolve(__dirname, './public/'), {
  dynamic: true,
  gzip:true,
}));

app.use(koaBody({
  multipart: true,
  patchKoa: true,
  formidable:{
    uploadDir: path.join(__dirname, './public'),
  }
}));
app.use(function(ctx, next) {
  // if (/\/api\//.test(ctx.url)) {
  //   ctx.set("Access-Control-Allow-Origin", "*");
  //   ctx.set("Access-Control-Allow-Headers", "Content-Type,Content-Length, Authorization, Accept,X-Requested-With");
  //   ctx.set("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
  // }
  ctx.set("Access-Control-Allow-Origin", "*");
  ctx.set("Access-Control-Allow-Headers", "Content-Type,Content-Length, Authorization, Accept,X-Requested-With");
  ctx.set("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");

  var {path, query, body, method} = ctx.request;
  method = method.toUpperCase();

  if (method === 'OPTIONS') {
    ctx.status = 200;
  } else {
    return next();
  }
})

const errorHandler = async (ctx, next) => {
    try {
        await next()
    } catch (err) {
        ctx.response.status = err.statusCode || err.status || 500
        ctx.response.body = {
            message: err.message,
            success: false,
        }
        ctx.app.emit('error', err, ctx)
    }
}

app.on('error', function (err) {
    console.error(err)
    console.error('app.js onError, error: ', err.message)
})

app.use(errorHandler);

app.use(parse());

app.use(cdn({
  dir: path.join(__dirname, './public'),
}));
app.use(mongoMap({
  url: `mongodb://${process.env.MONGO_SERVER || 'localhost:27017'}`,
  dbName: process.env.DB_NAME || 'sms',
}))

app.keys = ['zhouyg','smart'];

app.use(koaSession({
  maxAge:86400*1000,
},app));

//
// app.use(router.routes());
// app.use(router.allowedMethods());


app.use(async function(ctx, next){

  console.log(`path:${ctx.request.path}`);

  ctx.status = 404;
  ctx.body = ctx.request.path + ' NOT FOUND';
});

module.exports = app;
