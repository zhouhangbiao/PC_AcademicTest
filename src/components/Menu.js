import $ from 'jQuery';
import style from './Menu.css';
import * as service from '../services/markPaperSystem/commonServices';
import encrypt from '../utils/encrypt';
import cookie from '../utils/cookie';
import UrlHelper from 'js-url-helper';

let urlHelper = new UrlHelper(location);
/**
 * 系统菜单
 * @constructor
 */
function Menu() {
  "use strict";
  /*------------------------------- VARIABLES ----------------------------------*/
  let domMap = {};
  let token;
  /*************** dom method *******************/
  let setDomMap, renderDOM, renderLink;
  /*************** event method *******************/
  let attachEvent, logout, onKeyDownForm, focusInput, blurInput, showMyModal, hideMyModal, confirmChange;
  /*************** public method *******************/
  let init, closeAllWindow;
  /*------------------------------- END VARIABLES ----------------------------------*/
  setDomMap = function () {
    domMap = {
      $navLogin: $('.nav-login'),
      $form: $('.changepassword form'),
      $login: $("#login"),
      $inputPassWord: $(".changepassword input[type=password]"),
      $passWord: $('.nav-password'),
      $changePassword: $('.changepassword'),
      $changeForm: $('.changeform'),
      $cancel: $('#cancel'),
      $myModal: $('#myModal'),
      $oldPassword: $("#oldPassword"),
      $newPassword: $("#newPassword"),
      $reNewPW: $("#reNewPassword"),
    }
  };
  let defaults = {
    dom: {
      password: document.querySelector('.nav-password'),
      task: document.querySelector('.nav-task'),
      marking: document.querySelector('.nav-marking'),
      history: document.querySelector('.nav-history'),
      help: document.querySelector('.nav-help')
    },
    link: {
      task: '/markPaperSystem/task/tasks.html',
      marking: '/markPaperSystem/arbitration/arbitrations.html',
      history: '/markPaperSystem/history/historys.html',
      help: '/markPaperSystem/help/index.html'
    }
  };

  /**
   * 渲染DOM
   */
  renderDOM = function () {
    renderLink();
  };

  /**
   * 渲染链接
   */
  renderLink = function () {
    let dom = defaults.dom,
      link = defaults.link;

    Object.keys(dom).forEach(function (key) {
      if (key !== 'password') {
        dom[key].setAttribute('href', link[key]);
      }
    });
  };

  /*------------------------------- EVENT ----------------------------------*/
  /**
   * attachEvent
   * 初始化所有事件绑定
   */
  attachEvent = function () {
    domMap.$navLogin.bind('click', logout);
    domMap.$form.bind('keydown', onKeyDownForm);
    domMap.$inputPassWord.bind('focus', focusInput);
    domMap.$inputPassWord.bind('blur', blurInput);
    domMap.$passWord.bind('click', showMyModal);
    domMap.$cancel.bind('click', hideMyModal);
    domMap.$login.bind('click', confirmChange);

    $('.nav-task').bind('click', closeAllWindow);
    $('.nav-marking').bind('click', closeAllWindow);
    $('.nav-history').bind('click', closeAllWindow);
    $('.nav-help').bind('click', closeAllWindow);
  };

  /**
   * 退出功能
   */
  logout = function () {
    layer.confirm('是否确认退出当前用户？', {
      btn: ['确认', '取消'],
      title: '是否退出'
    }, function () {
      service.logout({}).then(function (data) {
        if (data.ReturnEntity === true) {
          closeAllWindow();
          urlHelper.jump({
            path: '/markPaperSystem/login.html',
          });
        } else {
          layer.msg('退出失败');
        }
      })
    });
  };
  /**
   * 回车确认
   */
  onKeyDownForm = function () {
    if (event.keyCode === 13) {
      domMap.$login.click();
    }
  };
  /**
   * 输入框获焦
   */
  focusInput = function () {
    $(this).addClass("focusborder")
  };
  /**
   * 输入框失焦
   */
  blurInput = function () {
    $(this).removeClass("focusborder");
    if ($(this).val() !== "") {
      $(this).addClass("on")
    } else {
      $(this).removeClass("on")
    }
  };
  /**
   * 显示修改框
   */
  showMyModal = function () {
    domMap.$inputPassWord.removeClass("on");
    domMap.$inputPassWord.val("");
    domMap.$changePassword.show();
    domMap.$changeForm.show()
  };
  /**
   * 关闭修改框
   */
  hideMyModal = function () {
    domMap.$myModal.modal('hide')
  };
  /**
   * 确认修改
   */
  confirmChange = function () {
    let oldPW = domMap.$oldPassword.val();
    let newPW = domMap.$newPassword.val();
    let reNewPW = domMap.$reNewPW.val();
    if (oldPW === "") {
      layer.msg('旧密码不能为空');
    } else if (newPW === "") {
      layer.msg('新密码不能为空');
    } else if (reNewPW === "") {
      layer.msg('确认密码不能为空');
    } else if (newPW !== reNewPW) {
      layer.msg('两次输入的新密码不一致，请确认!');
    } else if (newPW.length < 6) {
      layer.msg('新密码长度不能少于6个字符!');
    } else if (newPW.length > 16) {
      layer.msg('新密码长度不能大于16个字符!');
    } else if (oldPW.length < 6) {
      layer.msg('旧密码长度不能少于6个字符!');
    } else if (oldPW.length > 16) {
      layer.msg('旧密码长度不能大于16个字符!');
    } else {
      layer.msg('修改中...', {
        icon: 16,
        shade: 0.3
      });
      service.getSecretKey({
        payload: {
          "UserName": cookie.get('UserLoginName')
        }
      }).then(function (data) {
        token = data.ReturnEntity.SecretKey;
        let param = {
          "OldPassword": encrypt.encryptByTripleDES(encrypt.encryptByMD5(oldPW), token),
          "NewPassword": encrypt.encryptByTripleDES(encrypt.encryptByMD5(newPW), token)
        };
        service.changePassWord({
          payload: param
        }).then(function (data) {
          layer.closeAll();
          let PWStatus = data.ReturnEntity.PasswordChangeStatus;
          switch (PWStatus) {
            case 1:
              layer.msg('密码修改成功，下次登录请输入新密码!', {
                type: 1
              }, function () {
                domMap.$myModal.modal('hide');
              });
              break;
            case 2:
              layer.msg('旧密码输入错误，请输入正确的旧密码!');
              break;
            default:
              layer.msg('修改密码失败，请重试!');
          }
        })
      })
    }
  };

  init = function () {
    setDomMap();
    renderDOM();
    attachEvent();
  };

  /**
   * 关闭所有弹窗
   */
  closeAllWindow = function () {
    window.windowsGroup && Object.keys(window.windowsGroup).forEach(function (key) {
      window.windowsGroup[key] && window.windowsGroup[key].close();
    });
  };

  init();
}

export default Menu;
