const http = require('./http')
const Ajv = require('ajv')

const ajvOrigin = new Ajv();

function createAction (pre, name, method, config, validate) {
  const basePath = `/${pre}/${name}`;

  return function action (actionName, arg = {}) {
    arg = typeof arg === 'string' ? JSON.parse(arg) : arg;
    const doc = arg._doc;
    delete arg._doc;
    const result = validate(arg)
    if (!result) {
      console.error(`api error:`, ajvOrigin.errorsText(validate.errors))
      return Promise.reject(new Error(ajvOrigin.errorsText(validate.errors)))
    } else {
      var path = `${basePath}/${actionName}`

      const argKeys = Object.keys(arg)
      const keysLen = argKeys.length
      var data = {}
      if (keysLen > 0) {
        if (keysLen === 1 && typeof arg[argKeys[0]] !== 'object') {
          path = `${path}/${argKeys[0]}/${encodeURIComponent(arg[argKeys[0]])}`
          if (doc) {
            data = {
              doc
            }
          }
        } else {
          data = {
            arg,
            doc,
          }
        }
      }
      return http(path, data, method, config)
    }
  }
}

module.exports = function client (pre, schemeConfig, globalConfig) {
  const collectionNames = Object.keys(schemeConfig)

  const op = collectionNames.map(name => {
    const {properties = {}, method, config} = schemeConfig[name]
    const schema = {
      properties,
    }
    const ajv = new Ajv();
    const validate = ajv.compile(schema)

    return {
      [name]: createAction(pre, name, method, Object.assign({}, globalConfig, config), validate),
    }
  })

  return op.reduce((pre, next) => Object.assign(pre, next), {})
}
