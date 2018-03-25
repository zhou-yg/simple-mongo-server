import http from './http'
import Ajv from 'ajv'
const ajv = new Ajv()

function createAction (pre, name, method, config, validate) {
  var path = `/${pre}/${name}`

  return function action (actionName, arg) {
    const result = validate(arg)
    if (!result) {
      console.log(`api error:`, ajv.errorsText(validate.errors))
      return Promise.reject(new Error(ajv.errorsText(validate.errors)))
    } else {
      path = `${path}/${actionName}`

      const argKeys = Object.keys(arg)
      const keysLen = argKeys.length
      var data = {}
      if (keysLen === 1) {
        path = `${path}/${argKeys[0]}/${encodeURIComponent(arg[argKeys[0]])}`
      } else {
        data = {
          arg: arg,
        }
      }
      return http(path, data, method, config)
    }
  }
}

export default function client (pre, schemeConfig) {
  const collectionNames = Object.keys(schemeConfig)

  const op = collectionNames.map(name => {
    const {properties, method, config} = schemeConfig[name]
    const schema = {
      properties,
    }

    const validate = ajv.compile(schema)

    return {
      [name]: createAction(pre, name, method, config, validate),
    }
  })

  return op.reduce((pre, next) => Object.assign(pre, next), {})
}
