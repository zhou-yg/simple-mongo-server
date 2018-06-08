# simple-mongo-server

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

[localhost]:[port]/[dbName]/[collectionName]/[method] ? arg=[JSON_STRING]

```
{
  arg: arg
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
