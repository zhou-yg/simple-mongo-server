const request = require('request');
const path = require('path');
const fs = require('fs');
const moment = require('moment');

const testFile = path.join(__dirname, '../package.json');

const stream = fs.createReadStream(testFile);

request({
  url: 'http://localhost:8880/sms/x/insert',
  method: 'POST',
  form: {
    arg: JSON.stringify({
      ke: 0,
    }),
  },
}, function (err, res, body) {
  if (err) {
    console.log(err);
  }

  request({
    url: 'http://localhost:8880/sms/x/find',
    method: 'POST',
    json: {
      cursor: {
        limit: [100],
        toArray: [],
      },
    },
  }, function (err, res, body) {
    if (err) {
      console.log(err);
    }
    console.log(body);


  });
});
