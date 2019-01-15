import $ from 'jQuery';
import UrlHelper from 'js-url-helper';
import cookie from '../../../utils/cookie';
import * as service from '../../../services/markPaperSystem/arbitrationServices';
import * as commonService from '../../../services/markPaperSystem/commonServices';
import DrawPaper from '../../../components/DrawPaper';
import Scoreboard from '../../../components/Scoreboard';
import Scoring from '../../../components/Scoring';
import common from '../common';

let urlHelper = new UrlHelper(location);
let query = urlHelper.getSearchParam();

(function () {
  "use strict";
  /*------------------------------- VARIABLES ----------------------------------*/
  let configMap = {};
  let stateMap = {
    loading: null,
    prevTaskId: null,
    nextTaskId: null,
    currentTaskId: null
  };
  let domMap = {};
  let drawPaper, scoreboard, scoring;
  /*************** dom method *******************/
  let setDomMap, renderDOM, renderStatusBar, toggleBtnStatus;
  /*************** event method *******************/
  let attachEvent, onClickViewStem, onClickViewPoint, onClickJumpTask;
  /*************** public method *******************/
  let init, initDrawPaper, initScoreboard, initScoring, closeAllWindow, afterSubmitJump, showLoading, closeLoading, storeWindow;
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
      $btnPrevTask: $('#prev_task'),
      $btnNextTask: $('#next_task'),
      $btnViewStem: $('#view_stem'),
      $btnViewPoint: $('#view_point')
    };
  };

  /**
   * renderDOM
   * 渲染DOM数据
   * @param {Object} data
   */
  renderDOM = function (data) {
    toggleBtnStatus(data);
    renderStatusBar(data);
  };

  /**
   * 渲染状态栏
   * @param {Object} data
   */
  renderStatusBar = function (data) {
    let template = '<ul class="float-l footer-status">'+
      '  <li class="float-l">用户：${UserName}</li>'+
      '</ul>'+
      '<ul class="float-l">'+
      '  <li class="float-l">当前状态：仲裁判卷</li>'+
      '</ul>'+
      '<ul class="float-l">'+
      '  <li class="float-l">仲裁任务号：${TaskId}</li>'+
      '  <li class="float-l">仲裁列表待阅题数：<span class="font-special">${WaitArbitrateCount}</span>题</li>'+
      '</ul>';

    template = template.replace(/\$\{UserName}/g, cookie.get('UserName'))
      .replace(/\$\{TaskId}/g, data.TaskId)
      .replace(/\$\{WaitArbitrateCount}/g, data.WaitArbitrateCount);

    domMap.$statusBar.html('').html(template);
  };

  /**
   * 切换（渲染）按钮状态
   * @param {Object} data
   */
  toggleBtnStatus = function (data) {
    domMap.$btnPrevTask.removeClass('disabled');
    domMap.$btnNextTask.removeClass('disabled');

    if (data.PreviousTaskId === '') {
      domMap.$btnPrevTask.addClass('disabled');
    }
    if (data.NextTaskId === '') {
      domMap.$btnNextTask.addClass('disabled');
    }
  };
  /*------------------------------- END DOM ----------------------------------*/

  /*------------------------------- EVENT ----------------------------------*/
  /**
   * attachEvent
   * 初始化所有事件绑定
   */
  attachEvent = function () {
    domMap.$btnPrevTask.bind('click', onClickJumpTask);
    domMap.$btnNextTask.bind('click', onClickJumpTask);
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
        taskId: stateMap.currentTaskId
      })
    });

    showLoading('加载中');
    commonService.viewQuestion({
      payload: {
        "TaskId": stateMap.currentTaskId
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
        taskId: stateMap.currentTaskId
      })
    });

    window.windowsGroup.windowViewPoint = window.open(url, '_blank', 'location=no, resizable=no, width=1024, height=572');
  };

  /**
   * 跳转任务
   */
  onClickJumpTask = function () {
    let taskId, $this = $(this);

    if ($this.hasClass('disabled')) {
      return false;
    }

    if ($this.attr('id').indexOf('prev') > -1) {
      taskId = stateMap.prevTaskId;
    } else {
      taskId = stateMap.nextTaskId;
    }

    closeAllWindow();
    showLoading('加载中');
    service.getArbitratedQuestionInformation({
      payload: {
        "TaskId": taskId
      }
    }).then((data) => {
      closeLoading();

      renderDOM(data.ReturnEntity);
      stateMap.prevTaskId = data.ReturnEntity.PreviousTaskId;
      stateMap.nextTaskId = data.ReturnEntity.NextTaskId;
      stateMap.currentTaskId = data.ReturnEntity.TaskId;
      drawPaper.reload(data.ReturnEntity.QuestionAnswerData);
      scoreboard.reload(data.ReturnEntity.PointInformations);
      scoring.reload(data.ReturnEntity.PointInformations);
    });
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
      service.getArbitratedQuestionInformation({
        payload: {
          "TaskId": query.taskId
        }
      }).then((data) => {
        closeLoading();
        renderDOM(data.ReturnEntity);
        stateMap.prevTaskId = data.ReturnEntity.PreviousTaskId;
        stateMap.nextTaskId = data.ReturnEntity.NextTaskId;
        stateMap.currentTaskId = data.ReturnEntity.TaskId;
        initDrawPaper(data.ReturnEntity.QuestionAnswerData);
        initScoreboard(data.ReturnEntity.PointInformations);
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
   * 初始化计分板
   * @param {Object} data
   */
  initScoreboard = function (data) {
    scoreboard = new Scoreboard({
      wrapper: '#scoreboard_tools',
      resource: {
        title: '一评二评情况',
        column: [
          {
            "name": "给分点",
            "width": 80
          },
          {
            "name": "一评",
            "width": 70
          },
          {
            "name": "二评",
            "width": 70
          }],
        data: data
      }
    });
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
        service.submitArbitratedQuestionData({
          payload: {
            "TaskId": stateMap.currentTaskId,
            "QuestionMarking": drawPaper.getDrawData(),
            "PointInformations": scores
          }
        }).then((data) => {
          closeLoading();

          if (data.ReturnEntity.CommitState === 1) {
            if (!afterSubmitJump(data.ReturnEntity)) {
              showLoading('加载中');
              service.getArbitratedQuestionInformation({
                payload: {
                  "TaskId": data.ReturnEntity.NextTaskId
                }
              }).then((data) => {
                closeLoading();

                renderDOM(data.ReturnEntity);
                stateMap.prevTaskId = data.ReturnEntity.PreviousTaskId;
                stateMap.nextTaskId = data.ReturnEntity.NextTaskId;
                stateMap.currentTaskId = data.ReturnEntity.TaskId;
                drawPaper.reload(data.ReturnEntity.QuestionAnswerData);
                scoreboard.reload(data.ReturnEntity.PointInformations);
                scoring.reload(data.ReturnEntity.PointInformations);
              });
            }
          } else {
            layer.msg('提交失败！', {icon: 5});
          }
        });
      }
    });
  };

  /**
   * 提交后跳转
   * @param {Object} data
   * @return {Boolean}
   */
  afterSubmitJump = function (data) {
    if (data.NextTaskId === '') {
      layer.confirm('仲裁列表已经全部判分完成！', {
        btn: ['确认'],
        closeBtn: 0
      }, function(){
        urlHelper.jump({
          path: '/markPaperSystem/arbitration/arbitrations.html'
        });
      });
      return true;
    } else {
      return false;
    }
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

