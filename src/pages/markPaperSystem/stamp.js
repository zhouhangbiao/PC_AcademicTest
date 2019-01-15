import $ from 'jQuery';
import UrlHelper from 'js-url-helper';
import cookie from '../../utils/cookie';
import * as service from '../../services/markPaperSystem/commonServices';
import style from './stamp.css';
import Scoreboard from '../../components/Scoreboard';

let urlHelper = new UrlHelper(location);
let query = urlHelper.getSearchParam();

(function () {
  "use strict";
  /*------------------------------- VARIABLES ----------------------------------*/
  let configMap = {
    type: {
      2: "一评",
      3: "二评"
    }
  };
  let stateMap = {
    loading: null,
  };
  let domMap = {};
  let scoreboard;
  /*************** dom method *******************/
  let setDomMap, renderDOM, renderMarking;
  /*************** event method *******************/
  let attachEvent;
  /*************** public method *******************/
  let init, initScoreboard, showLoading, closeLoading;
  /*------------------------------- END VARIABLES ----------------------------------*/

  /*------------------------------- DOM ----------------------------------*/
  /**
   * setDomMap
   * 缓存DOM集合
   */
  setDomMap = function () {
    domMap = {
      $title: $('title'),
      $titleTab: $('#stamp_title'),
      $marking: $('#marking_show')
    };
  };

  /**
   * renderDOM
   * 渲染DOM数据
   * @param {Object} data
   */
  renderDOM = function (data) {
    domMap.$title.text("查看" + configMap.type[query.reviewerType] + "标记");
    domMap.$titleTab.text("查看" + configMap.type[query.reviewerType] + "标记");
    renderMarking(data);
  };

  /**
   * 渲染答题信息
   * @param {Object} data
   */
  renderMarking = function (data) {
    let image = new Image();

    image.src = data.QuestionJudgementData;
    image.onload = function () {
      domMap.$marking.html('').html(image);
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
      attachEvent();
      showLoading('加载中');
      service.viewScoringMark({
        payload: {
          "BatchId": query.batchId,
          "TaskId": query.taskId,
          "ReviewerType": query.reviewerType
        }
      }).then((data) => {
        closeLoading();
        renderDOM(data.ReturnEntity);
        initScoreboard(data.ReturnEntity.PointInformations);
      });
    });
  };

  /**
   * 初始化计分板
   * @param {Object} data
   */
  initScoreboard = function (data) {
    scoreboard = new Scoreboard({
      wrapper: '#scoreboard_tools',
      resource: {
        title: configMap.type[query.reviewerType] + '评分情况',
        column: [
          {
            "name": "给分点",
            "width": 80
          },
          {
            "name": "分数",
            "width": 80
          }],
        data: data
      },
      stampBtn: false
    });
  };

  /**
   * 显示加载
   * @param {String} msg
   */
  showLoading = function (msg) {
    stateMap.loading = layer.msg(msg, {
      icon: 16,
      shade: 0.3,
      time: 0
    });
  };

  /**
   * 关闭加载
   */
  closeLoading = function () {
    layer.close(stateMap.loading);
  };
  /*------------------------------- END PUBLIC ----------------------------------*/

  init();
})();

