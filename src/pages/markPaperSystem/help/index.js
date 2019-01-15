import $ from 'jQuery';
import UrlHelper from 'js-url-helper';
import cookie from '../../../utils/cookie';
import style from './index.css';
import * as service from '../../../services/markPaperSystem/commonServices';
import common from '../common';

let urlHelper = new UrlHelper(location);
let query = urlHelper.getSearchParam();

(function () {
  "use strict";
  /*------------------------------- VARIABLES ----------------------------------*/
  let configMap = {};
  let stateMap = {};
  let domMap = {};
  /*************** dom method *******************/
  let setDomMap, renderDOM,renderStatusBar;
  /*************** event method *******************/
  let attachEvent;
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
      $statusBar: $('#status_bar'),
      $showassistance:$(".showassistance")
    };
  };

  /**
   * renderDOM
   * 渲染DOM数据
   */
  renderDOM = function () {
    renderStatusBar();
  };
    /**
   * 渲染状态栏
   * @param {Object} data
   */
  renderStatusBar = function () {
    let template = '<ul class="float-l footer-status">'+
      '  <li class="float-l">用户：${UserName}</li>'+
      '</ul>'+
      '<ul class="float-l">'+
      '  <li class="float-l">当前状态：帮助</li>'+
      '</ul>';

    template = template.replace(/\$\{UserName}/g, cookie.get('UserName'))


    domMap.$statusBar.html('').html(template);
  };
  /*------------------------------- END DOM ----------------------------------*/

  /*------------------------------- EVENT ----------------------------------*/
  /**
   * attachEvent
   * 初始化所有事件绑定
   */
  attachEvent = function () {

  };
  /*------------------------------- END EVENT ----------------------------------*/

  /*------------------------------- PUBLIC ----------------------------------*/
  /**
   * init
   * 业务初始化方法
   */
  init = function () {

    // 查看帮助   
    $(function(){
      setDomMap()
      renderDOM()
       service.getAssistance().then(function(data){                
        domMap.$showassistance.html( data.ReturnEntity.AssistanceInformation)
       })

    })
  };
  /*------------------------------- END PUBLIC ----------------------------------*/

  init();
})();
