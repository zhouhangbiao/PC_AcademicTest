import $ from 'jQuery';
import UrlHelper from 'js-url-helper';
import cookie from '../../../utils/cookie';
import * as service from '../../../services/markPaperSystem/historyServices';
import * as commonService from '../../../services/markPaperSystem/commonServices';
import Scoreboard from '../../../components/Scoreboard';
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
    currentTaskId: null,
    prevBatchId: null,
    nextBatchId: null,
    currentBatchId: null,
  };
  let domMap = {};
  let scoreboard;
  /*************** dom method *******************/
  let setDomMap, renderDOM, renderMarking, renderStatusBar, toggleBtnStatus;
  /*************** event method *******************/
  let attachEvent, onClickChangeTasks, onClickViewStem, onClickJumpMarking, onClickChangeTask;
  /*************** public method *******************/
  let init, matchStatus, initScoreboard, closeAllWindow, showLoading, closeLoading, storeWindow;
  /*------------------------------- END VARIABLES ----------------------------------*/

  /*------------------------------- DOM ----------------------------------*/
  /**
   * setDomMap
   * 缓存DOM集合
   */
  setDomMap = function () {
    domMap = {
      $main: $('#main'),
      $marking: $('#marking_show'),
      $statusBar: $('#status_bar'),
      $btnJumpTasks: $('#jump_tasks'),
      $btnViewStem: $('#view_stem'),
      $btnJumpMarking: $('#jump_marking'),
      $btnPrevTask: $('#prev_task'),
      $btnNextTask: $('#next_task')
    };
  };

  /**
   * renderDOM
   * 渲染DOM数据
   * @param {Object} data
   */
  renderDOM = function (data) {
    renderMarking(data);
    renderStatusBar(data);
  };

  /**
   * 渲染答题信息
   * @param {Object} data
   */
  renderMarking = function (data) {
    let image = new Image();

    image.src = data.JudgmentInformation;
    image.onload = function () {
      domMap.$marking.html('').html(image);
    };
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
      '  <li class="float-l">当前状态：查看已阅试题</li>'+
      '</ul>'+
      '<ul class="float-l">'+
      '  <li class="float-l">试题任务号：${TaskId}</li>'+
      '  <li class="float-l">试题状态：${MarkQuestionStatus}</li>'+
      '</ul>';

    template = template.replace(/\$\{UserName}/g, cookie.get('UserName'))
      .replace(/\$\{TaskId}/g, data.TaskId)
      .replace(/\$\{MarkQuestionStatus}/g, matchStatus(data.MarkQuestionStatus));

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
    if (data.MarkQuestionStatus !== 3 || data.IsAbnormal) {
      domMap.$btnJumpMarking.addClass('hidden');
    } else {
      domMap.$btnJumpMarking.removeClass('hidden');
    }
  };
  /*------------------------------- END DOM ----------------------------------*/

  /*------------------------------- EVENT ----------------------------------*/
  /**
   * attachEvent
   * 初始化所有事件绑定
   */
  attachEvent = function () {
    domMap.$btnJumpTasks.bind('click', onClickChangeTasks);
    domMap.$btnViewStem.bind('click', onClickViewStem);
    domMap.$btnJumpMarking.bind('click', onClickJumpMarking);
    domMap.$btnPrevTask.bind('click', onClickChangeTask);
    domMap.$btnNextTask.bind('click', onClickChangeTask);
  };

  /**
   * 跳转到任务列表
   */
  onClickChangeTasks = function () {
    closeAllWindow();
    urlHelper.jump({
      path: '/markPaperSystem/history/historys.html'
    });
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
   * 跳转回评
   */
  onClickJumpMarking = function () {
    closeAllWindow();
    urlHelper.jump({
      path: '/markPaperSystem/history/marking.html',
      search: urlHelper.setSearchParam({
        batchId: stateMap.currentBatchId,
        taskId: stateMap.currentTaskId
      })
    });
  };

  /**
   * 切换任务
   */
  onClickChangeTask = function () {
    let taskId, batchId, $this = $(this);

    if ($this.hasClass('disabled')) {
      return false;
    }

    if ($this.attr('id').indexOf('prev') > -1) {
      taskId = stateMap.prevTaskId;
      batchId = stateMap.prevBatchId;
    } else {
      taskId = stateMap.nextTaskId;
      batchId = stateMap.nextBatchId;
    }

    closeAllWindow();
    showLoading('加载中');
    service.viewMarkedQuestions({
      payload: {
        "BatchId": batchId,
        "TaskId": taskId
      }
    }).then((data) => {
      closeLoading();
      renderDOM(data.ReturnEntity);
      toggleBtnStatus(data.ReturnEntity);
      stateMap.prevTaskId = data.ReturnEntity.PreviousTaskId;
      stateMap.nextTaskId = data.ReturnEntity.NextTaskId;
      stateMap.currentTaskId = data.ReturnEntity.TaskId;
      stateMap.prevBatchId = data.ReturnEntity.PrevBatchId;
      stateMap.nextBatchId = data.ReturnEntity.NextBatchId;
      stateMap.currentBatchId = data.ReturnEntity.BatchId;
      scoreboard.reload(data.ReturnEntity.PointInformations);
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
      service.viewMarkedQuestions({
        payload: {
          "BatchId": query.batchId,
          "TaskId": query.taskId
        }
      }).then((data) => {
        closeLoading();
        renderDOM(data.ReturnEntity);
        toggleBtnStatus(data.ReturnEntity);
        stateMap.prevTaskId = data.ReturnEntity.PreviousTaskId;
        stateMap.nextTaskId = data.ReturnEntity.NextTaskId;
        stateMap.currentTaskId = data.ReturnEntity.TaskId;
        stateMap.prevBatchId = data.ReturnEntity.PrevBatchId;
        stateMap.nextBatchId = data.ReturnEntity.NextBatchId;
        stateMap.currentBatchId = data.ReturnEntity.BatchId;
        initScoreboard(data.ReturnEntity.PointInformations);
      });
    });
  };

  /**
   * 匹配任务状态
   * @param {Number} status
   * @return {String}
   */
  matchStatus = function (status) {
    let text;
    switch (status) {
      case 3 :
        text = '已评阅';
        break;
      case 4 :
        text = '待仲裁';
        break;
      case 5 :
        text = '已仲裁';
        break;
      case 6 :
        text = '已关闭';
        break;
    }

    return text;
  };

  /**
   * 初始化计分板
   * @param {Object} data
   */
  initScoreboard = function (data) {
    scoreboard = new Scoreboard({
      wrapper: '#scoreboard_tools',
      resource: {
        title: '评分情况',
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
    } else {
      window.windowsGroup = {
        windowViewStem: null
      };
    }
  };
  /*------------------------------- END PUBLIC ----------------------------------*/

  init();
})();

