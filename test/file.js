const request = require('request');
const path = require('path');
const fs = require('fs');
const moment = require('moment');

const testFile = path.join(__dirname, '../package.json');

const p = fs.readFileSync(testFile);

request({
  url: 'http://localhost:8880/sms/test/insert',
  method: 'POST',
  header: {
    'Content-Type': 'multipart/form-data',
  },
  formData: {
    file: p,
  },
}, function (err, res, body) {
  if (err) {
    console.log(err);
  }
  console.log(body);
});
