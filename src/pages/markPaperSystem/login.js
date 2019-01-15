import $ from 'jQuery';
import UrlHelper from 'js-url-helper';
import cookie from '../../utils/cookie';
import style from './login.css';
import * as service from '../../services/markPaperSystem/commonServices';
import encrypt from '../../utils/encrypt';

let urlHelper = new UrlHelper(location);
let query = urlHelper.getSearchParam();

(function () {
  "use strict";
  /*------------------------------- VARIABLES ----------------------------------*/
  let configMap = {};
  let stateMap = {
    userName: null,
    passWord: null
  };
  let domMap = {};
  let token;
  /*************** dom method *******************/
  let setDomMap, renderDOM;
  /*************** event method *******************/
  let attachEvent, toggleBackgroundColor, handleStates, onClickLogin, toggleBorderColor, onKeydownLogin;
  /*************** public method *******************/
  let init;
  /*------------------------------- END VARIABLES ----------------------------------*/

  /*------------------------------- DOM ----------------------------------*/
  /**
   * setDomMap
   * 缓存DOM集合
   */
  setDomMap = function () {
    domMap = {
      $login: $("#login"),
      $userName: $("#userName"),
      $passWord: $("#passWord"),
      $input: $(".login .form-group input"),
      $form: $('.login form')
    }
  };
  /**
   * renderDOM
   * 渲染DOM数据
   */
  renderDOM = function () {
  };
  /*------------------------------- END DOM ----------------------------------*/

  /*------------------------------- EVENT ----------------------------------*/
  /**
   * attachEvent
   * 初始化所有事件绑定
   */
  attachEvent = function () {
    domMap.$input.bind('blur', toggleBackgroundColor);
    domMap.$input.bind('focus', toggleBorderColor);
    domMap.$login.bind('click', onClickLogin);
    domMap.$form.bind('keydown', onKeydownLogin)
  };

  /**
   * 输入框失焦添加背景颜色
   */
  toggleBackgroundColor = function () {
    $(this).removeClass("focusborder");
    if ($(this).val() !== "") {
      $(this).addClass("on")
    } else {
      $(this).removeClass("on")
    }
  };
  /**
   * 获取焦点边框
   */
  toggleBorderColor = function () {
    $(this).addClass("focusborder")
  };
  /**
   * 回车登录
   */
  onKeydownLogin = function () {
    if (event.keyCode === 13) {
      domMap.$login.click();
    }
  };
  /**
   * 登录操作
   */
  onClickLogin = function () {
    stateMap.userName = domMap.$userName.val();
    stateMap.passWord = domMap.$passWord.val();
    if (stateMap.userName === "") {
      layer.msg('用户名不能为空');
    } else if (stateMap.passWord === "") {
      layer.msg('密码不能为空');
    } else if (stateMap.passWord.length < 6) {
      layer.msg('密码不能少于6个字符');
    } else if (stateMap.passWord.length > 16) {
      layer.msg('密码不能大于于16个字符');
    } else {
      layer.msg('登录中...', {
        icon: 16
        ,shade: 0.3
    
      });
      service.getSecretKey({
        payload: {
          "UserName": stateMap.userName
        }
      }).then(function (data) {
        
        token = data.ReturnEntity.SecretKey;
        handleStates({
          "UserName": stateMap.userName,
          "PassWord": encrypt.encryptByTripleDES(encrypt.encryptByMD5(stateMap.passWord), token)
        });
      })
    }
  };
  /**
   * 登录状态处理
   */
  handleStates = function (param) {
    service.login({
      payload: param
    }).then(function (data) {
      layer.closeAll();  
      switch (data.ReturnEntity.LoginStatus) {
        case 1:
          layer.msg('登录成功', {
            type: 1
          }, function () {
            urlHelper.jump({
              path: 'task/tasks.html',
            });
          });
          cookie.set("UserName", data.ReturnEntity.UserName, {
            path: "/"
          });
          cookie.set("UserLoginName", stateMap.userName, {
            path: "/"
          });
          break;
        case 2:
          layer.confirm('用户名与密码不匹配!', {
            btn: ['确认'],
            title: '异常信息'
          });
          break;
        case 3:
          layer.confirm('该用户没有阅卷评分权限!', {
            btn: ['确认'],
            title: '异常信息'
          });
          break;
        case 4:
          layer.confirm('该用户已被禁用,请与管理员联系!', {
            btn: ['确认'],
            title: '异常信息'
          });
          break;
      }
    })
  };

  /*------------------------------- END EVENT ----------------------------------*/

  /*------------------------------- PUBLIC ----------------------------------*/
  /**
   * init
   * 业务初始化方法
   */
  init = function () {
    // 用户登录
    $(function () {
      setDomMap();
      attachEvent();
    });
  };
  /*------------------------------- END PUBLIC ----------------------------------*/
  init();
})();
