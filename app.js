/**
 * Created by zyg on 17/1/13.
 */
/**
 * Created by zyg on 16/8/8.
 */
var fs = require('fs');
var path = require('path');

var koa = require('koa');
var ejsConfig = require('koa-ejs');
var staticConfigCache = require('koa-static');

var logger = require('koa-logger');
const koaBody = require('koa-body');

const koaSession = require('koa-session');

const mongoMap = require('./lib/mongoMap/server');

var app = new koa();

app.use(logger());

ejsConfig(app,{
  root: path.join(__dirname, 'views'),
  layout: '',
  viewExt: 'html',
  cache: false,
  debug: true
});

app.use(function (ctx, next) {
  return next();
})

// app.use(staticConfigCache(path.resolve(__dirname,'./public/'), {
//   maxAge: 24 * 60 * 60,
//   gzip:true,
// }));

app.use(koaBody({
  formidable:{
    uploadDir: __dirname
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

app.use(mongoMap({
  url: 'mongodb://localhost:27017',
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
