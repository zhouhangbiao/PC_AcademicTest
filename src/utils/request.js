import axios from 'axios';

export default function request(options) {
  let statusCode;
  let errCode;
  let formData;
  let defaults = {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded; charset=utf-8"
    },
    withCredentials: true,
    validateStatus: function (status) {
      if (status >= 200 && status < 300) {
        return true
      } else {
        statusCode = status;
        return false;
      }
    }
  };

  /**
   * 检查接口返回状态（业务）
   * @param response
   */
  function checkResultType(response) {
    if (response.data.ResultType !== 1) {
      errCode = response.data.ResultType;
    }

    return response;
  }

  options = Object.assign(defaults, options);
  formData = options.data;
  options.data = "param=" + JSON.stringify(formData);

  return axios.request(options)
    .then(checkResultType)
    .then(response => response.data)
    .catch(() => {
      console.log(statusCode)
    });
}
