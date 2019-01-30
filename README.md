# simple-mongo-server

# using by docker

> docker pull zhouyg/simpel-mongo-server

> docker pull mongo

> docker run -itd mogno

> docker run -itd --link mongo:mongo -p 8880:8880 -p 8081:8081 --name sms zhouyg/simple-mongo-server

# using by nodejs

> npm run start

# use case

> [localhost]:[port]/[dbName]/[collectionName]/[method]/[key]/[value]

```
{
  [key]: value
}
```

> [localhost]:[port]/[dbName]/[collectionName]/[method]/[key] ? arg=[JSON_STRING]



```
{
  [key]: arg
}
```

## methods

[localhost]:[port]/[dbName]/[collectionName]/[method] ? arg=[JSON_STRING]

```
{
  arg: arg
}
```
### update

[localhost]:[port]/[dbName]/[collectionName]/update ? arg=[JSON_STRING]

```
{
  arg: {
    id: 1,
  },
  doc: {
    $set: {
      value: newValue,
    }
  },
}
```

## client api schemeConfig

```
import client from 'simple-mongo-server/lib/mongoMap/client';
const db =client('dbName', {
  collectionName: {
    method: 'post',
    properties: {   // schema @ajv https://ajv.js.org/keywords.html#keywords-for-strings
      mongo_filed_name: {
        type: 'string',
      },
    },
  },
});

db.collectionName(mongo_method, {});

```

## license

GPL
