import $ from 'jQuery';
import UrlHelper from 'js-url-helper';
import cookie from '../../utils/cookie';
import * as service from '../../services/markPaperSystem/commonServices';

let urlHelper = new UrlHelper(location);
let query = urlHelper.getSearchParam();

(function () {
  "use strict";
  /*------------------------------- VARIABLES ----------------------------------*/
  let configMap = {};
  let stateMap = {};
  let domMap = {};
  /*************** dom method *******************/
  let setDomMap, renderDOM;
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
      $main: $('#main')
    };
  };

  /**
   * renderDOM
   * 渲染DOM数据
   */
  renderDOM = function () {
    let image = new Image();

    if (sessionStorage.getItem('stem') !== '') {
      image.src = sessionStorage.getItem('stem');
    } else {
      service.viewQuestion({
        payload: {
          "TaskId": query.taskId
        }
      }).then((data) => {
        image.src = data.ReturnEntity.QuestionPicture;
      });
    }

    image.onload = function () {
      domMap.$main.html(image);
    };
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
    $(function () {
      setDomMap();
      renderDOM();
    });
  };
  /*------------------------------- END PUBLIC ----------------------------------*/

  init();
})();

