const request = require('axios');
const path = require('path');
const fs = require('fs');
const moment = require('moment');

const testFile = path.join(__dirname, '../.gitignore');

const p = fs.readFileSync(testFile);
const stream = fs.createReadStream(testFile);

request({
  url: 'http://localhost:8880/sms/test/insert',
  method: 'POST',
  headers: {
  },
  data: {
    arg: JSON.stringify({
      ke: 123,
    }),
    myfile: p,
  },
}).then(function (res) {
  console.log(res.data);
}).catch(e => {
  console.log(e);
});
