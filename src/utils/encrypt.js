import * as CryptoJS from 'crypto-js';

const encrypt = {
  /**
   * TripleDES 加密
   * @param {String} message 待加密字符串
   * @param {String} key 秘钥
   * @return {string}
   */
  encryptByTripleDES: function (message, key) {
    let encrypted = CryptoJS.TripleDES.encrypt(
      CryptoJS.enc.Utf8.parse(message),
      CryptoJS.enc.Utf8.parse(key),
      {
        iv: CryptoJS.enc.Utf8.parse('ruanyun*'),
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7
      });

    return encrypted.toString();
  },
  /**
   * MD5 加密
   * @param {String} message 待加密字符串
   */
  encryptByMD5: function (message) {
    return CryptoJS.MD5(message).toString();
  }
};

export default encrypt;
