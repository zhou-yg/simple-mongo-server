const fs = require('fs');
const path = require('path');

global.__DEV__ = process.env.NODE_ENV !== 'production';


const PORT = process.env.PORT || 8880;

const app = require(path.join(__dirname,'../app.js'));

app.listen(PORT);

console.log('listen on '+ PORT);
