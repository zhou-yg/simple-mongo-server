/**
 * Created by lsy on 2017/1/3.
 */
const qs = require('query-string');
const axios = require('axios');

module.exports = function http (path, data = {}, method = 'GET', config = {}) {
  const cancelToken = data.cancelToken;
  delete data.cancelToken;

  method = method.toUpperCase();

  const {useFormData, progress, host} = config;

  return new Promise((resolve, reject) => {
    const option = {
      method: method,
      credentials: 'include',
      headers: {},
    };
    if (method === 'GET') {
      const queryString = Object.keys(data).filter(key => {
        return data[key] !== undefined && data[key] !== null;
      }).map(key => {
        return `${key}=${encodeURIComponent(data[key])}`;
      }).join('&');

      if (/\?|&/.test(path)) {
        throw new Error('you can\' do it');
      }

      path = `${path}?${queryString}`;
    } else {
      if (useFormData) {
        option.body = data;
      } else {
        option.headers['Content-Type'] = 'application/json;charset=utf-8';
        option.body = typeof data === 'string' ? data : JSON.stringify(data);
      }
    }

    if (host) {
      if (/\/$/.test(host) && /^\//.test(path)) {
        path = path.replace(/^\//, '');
      }
      path = `${host}` + path;
    }

    // 防止傻逼ie缓存ajax请求
    if (path.indexOf('?') === -1) {
      path += `?fuckie=${Date.now()}`;
    } else {
      path += `&fuckie=${Date.now()}`;
    }

    option.data = option.body;
    option.url = path;
    option.cancelToken = cancelToken;

    if (progress) {
      Object.assign(option, progress);
    }

    console.log(option);

    axios(option).then(res => {
      if (res.status >= 200 && res.status < 300) {
        Object.assign(res.data, {
          _arg: data,
        });
        resolve(res.data);
      } else {
        let e = new Error(path + (res.statusText || res.status));
        e.response = res;
        reject(e);
      }
    }, function (e) {
      reject(e);
    });
  });
};
