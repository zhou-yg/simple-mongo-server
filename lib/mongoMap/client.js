import http from './http'
import Ajv from 'ajv'

function createAction (pre, name, method, config, validate) {
  const basePath = `/${pre}/${name}`;

  return function action (actionName, arg = {}) {
    const doc = arg._doc;
    delete arg._doc;
    const result = validate(arg)
    if (!result) {
      console.log(`api error:`, ajv.errorsText(validate.errors))
      return Promise.reject(new Error(ajv.errorsText(validate.errors)))
    } else {
      var path = `${basePath}/${actionName}`

      const argKeys = Object.keys(arg)
      const keysLen = argKeys.length
      var data = {}
      if (keysLen > 0) {
        if (keysLen === 1) {
          path = `${path}/${argKeys[0]}/${encodeURIComponent(arg[argKeys[0]])}`
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

export default function client (pre, schemeConfig, globalConfig) {
  const collectionNames = Object.keys(schemeConfig)

  const op = collectionNames.map(name => {
    const {properties = {}, method, config} = schemeConfig[name]
    const schema = {
      properties,
    }
    const ajv = new Ajv()
    const validate = ajv.compile(schema)

    return {
      [name]: createAction(pre, name, method, Object.assign({}, globalConfig, config), validate),
    }
  })

  return op.reduce((pre, next) => Object.assign(pre, next), {})
}
