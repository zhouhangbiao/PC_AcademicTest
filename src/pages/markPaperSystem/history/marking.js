import $ from 'jQuery';
import UrlHelper from 'js-url-helper';
import cookie from '../../../utils/cookie';
import * as service from '../../../services/markPaperSystem/historyServices';
import * as commonService from '../../../services/markPaperSystem/commonServices';
import DrawPaper from '../../../components/DrawPaper';
import Scoring from '../../../components/Scoring';
import common from '../common';

let urlHelper = new UrlHelper(location);
let query = urlHelper.getSearchParam();

(function () {
  "use strict";
  /*------------------------------- VARIABLES ----------------------------------*/
  let configMap = {};
  let stateMap = {
    loading: null
  };
  let domMap = {};
  let drawPaper, scoring;
  /*************** dom method *******************/
  let setDomMap, renderDOM, renderStatusBar;
  /*************** event method *******************/
  let attachEvent, onClickViewStem, onClickViewPoint;
  /*************** public method *******************/
  let init, initDrawPaper, initScoring, closeAllWindow, showLoading, closeLoading, storeWindow;
  /*------------------------------- END VARIABLES ----------------------------------*/

  /*------------------------------- DOM ----------------------------------*/
  /**
   * setDomMap
   * 缓存DOM集合
   */
  setDomMap = function () {
    domMap = {
      $main: $('#main'),
      $statusBar: $('#status_bar'),
      $btnViewStem: $('#view_stem'),
      $btnViewPoint: $('#view_point'),
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
   */
  renderStatusBar = function () {
    let template = '<ul class="float-l footer-status">'+
      '  <li class="float-l">用户：${UserName}</li>'+
      '</ul>'+
      '<ul class="float-l">'+
      '  <li class="float-l">当前状态：试题回评</li>'+
      '</ul>'+
      '<ul class="float-l">'+
      '  <li class="float-l">试题任务号：${TaskId}</li>'+
      '</ul>';

    template = template.replace(/\$\{UserName}/g, cookie.get('UserName'))
      .replace(/\$\{TaskId}/g, query.taskId);

    domMap.$statusBar.html('').html(template);
  };

  /*------------------------------- END DOM ----------------------------------*/

  /*------------------------------- EVENT ----------------------------------*/
  /**
   * attachEvent
   * 初始化所有事件绑定
   */
  attachEvent = function () {
    domMap.$btnViewStem.bind('click', onClickViewStem);
    domMap.$btnViewPoint.bind('click', onClickViewPoint);
  };

  /**
   * 查看题干
   */
  onClickViewStem = function () {
    if (window.windowsGroup.windowViewStem && window.windowsGroup.windowViewStem.top) {
      window.windowsGroup.windowViewStem.focus();
      return;
    }
    let url = urlHelper.link({
      path: '/markPaperSystem/stem.html',
      search: urlHelper.setSearchParam({
        taskId: query.taskId
      })
    });

    showLoading('加载中');
    commonService.viewQuestion({
      payload: {
        "TaskId": query.taskId
      }
    }).then((data) => {
      closeLoading();

      let image = new Image();
      image.src = data.ReturnEntity.QuestionPicture;

      try {
        sessionStorage.setItem('stem', data.ReturnEntity.QuestionPicture);
      } catch (err) {
        if (err.name === 'QuotaExceededError') {
          sessionStorage.setItem('stem', '');
          layer.msg('本地存储超出限制！题干将重新加载');
        }
      }

      image.onload = function () {
        window.windowsGroup.windowViewStem = window.open(url, '_blank', `location=no, resizable=no, width=${image.width}, height=${image.height}`);
      };
    });
  };

  /**
   * 查看给分点
   */
  onClickViewPoint = function () {
    if (window.windowsGroup.windowViewPoint && window.windowsGroup.windowViewPoint.top) {
      window.windowsGroup.windowViewPoint.focus();
      return;
    }
    let url = urlHelper.link({
      path: '/markPaperSystem/point.html',
      search: urlHelper.setSearchParam({
        taskId: query.taskId
      })
    });

    window.windowsGroup.windowViewPoint = window.open(url, '_blank', 'location=no, resizable=no, width=1024, height=572');
  };
  /*------------------------------- END EVENT ----------------------------------*/

  /*------------------------------- PUBLIC ----------------------------------*/
  /**
   * init
   * 业务初始化方法
   */
  init = function () {
    $(function () {
      storeWindow();
      setDomMap();
      attachEvent();
      showLoading('加载中');
      service.getReviewedQuestionData({
        payload: {
          "BatchId": query.batchId,
          "TaskId": query.taskId
        }
      }).then((data) => {
        closeLoading();
        renderDOM();
        initDrawPaper(data.ReturnEntity.QuestionAnswerData);
        initScoring(data.ReturnEntity.PointInformations);
      });
    });
  };
  /**
   * 初始化试卷绘图
   * @param {Object} data
   */
  initDrawPaper = function (data) {
    drawPaper = new DrawPaper({
      wrapper: '#main',
      resource: {
        data: data
      }
    });

    drawPaper.init();
  };
  /**
   * 初始化试卷评分
   * @param {Object} data
   */
  initScoring = function (data) {
    scoring = new Scoring({
      wrapper: '#scoring_tools',
      resource: {
        data: data
      },
      onClickReset: function () {
        let tips = layer.confirm('判分标记和得分项将被清除！', {
          btn: ['是', '否'],
          closeBtn: 0
        }, function(){
          drawPaper.cleanDraw();
          scoring.cleanScore();
          layer.close(tips);
        }, function(){
          layer.close(tips);
        });
      },
      onClickSubmit: function (scores) {
        closeAllWindow();
        showLoading('提交中');
        service.submitReviewedQuestionData({
          payload: {
            "TaskId": query.taskId,
            "BatchId": query.batchId,
            "QuestionMarking": drawPaper.getDrawData(),
            "PointInformations": scores
          }
        }).then((data) => {
          closeLoading();

          if (data.ReturnEntity.CommitState === 1) {
            window.history.go(-1);
          } else {
            layer.msg('提交失败！', {icon: 5});
          }
        });
      }
    });
  };

  /**
   * 关闭所有弹窗
   */
  closeAllWindow = function () {
    Object.keys(window.windowsGroup).forEach(function (key) {
      window.windowsGroup[key] && window.windowsGroup[key].close();
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

  /**
   * 存储窗体
   */
  storeWindow = function () {
    if (window.windowsGroup) {
      window.windowsGroup.windowViewStem = null;
      window.windowsGroup.windowViewPoint = null;
    } else {
      window.windowsGroup = {
        windowViewStem: null,
        windowViewPoint: null
      };
    }
  };
  /*------------------------------- END PUBLIC ----------------------------------*/

  init();
})();

