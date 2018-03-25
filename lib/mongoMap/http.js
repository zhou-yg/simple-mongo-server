/**
 * Created by lsy on 2017/1/3.
 */
// import 'whatwg-fetch';
import qs from 'query-string';
import axios from 'axios';

export default function http (path, data = {}, method = 'GET', config = {}) {
  const cancelToken = data.cancelToken;
  delete data.cancelToken;

  method = method.toUpperCase();

  const {useFormData, progress, address} = config;

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
      if (typeof data === 'object') {
        var handedData = Object.keys(data).filter(key => {
          return (data[key] !== undefined && data[key] !== null) || data[key] === 0;
        }).map(key => {
          var v = data[key];
          if (Array.isArray(data[key])) {
            v = v.toString();
          }
          return {
            [key]: v,
          };
          // fd.append(key, v);
        }).reduce((pre, next) => {
          return Object.assign(pre, next);
        }, {});

        const postStr = qs.stringify(handedData);

        if (useFormData) {
          // option.headers['Content-Type'] = 'multipart/form-data';
          option.body = data;
        } else {
          option.headers['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8';
          option.body = postStr;
        }
      } else {
        option.headers['Content-Type'] = 'application/json;charset=utf-8';
        option.body = data;
      }
    }

    if (address) {
      if (/\/$/.test(address) && /^\//.test(path)) {
        path = path.replace(/^\//, '');
      }
      path = `${address}` + path;
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
