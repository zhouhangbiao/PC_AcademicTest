import $ from 'jQuery';
import UrlHelper from 'js-url-helper';
import cookie from '../../../utils/cookie';
import * as service from '../../../services/markPaperSystem/arbitrationServices';
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
    currentTaskId: null
  };
  let domMap = {};
  let scoreboard;
  /*************** dom method *******************/
  let setDomMap, renderDOM, renderMarking, renderStatusBar, toggleBtnStatus;
  /*************** event method *******************/
  let attachEvent, onClickChangeTasks, onClickViewStem, onClickChangeTask;
  /*************** public method *******************/
  let init, initScoreboard, closeAllWindow, showLoading, closeLoading, storeWindow;
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

    image.src = data.QuestionAnswerData;
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
      '  <li class="float-l">当前状态：查看仲裁任务</li>'+
      '</ul>'+
      '<ul class="float-l">'+
      '  <li class="float-l">试题任务号：${TaskId}</li>'+
      '  <li class="float-l">试题状态：已仲裁</li>'+
      '</ul>';

    template = template.replace(/\$\{UserName}/g, cookie.get('UserName'))
      .replace(/\$\{TaskId}/g, data.TaskId);

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
    domMap.$btnJumpTasks.bind('click', onClickChangeTasks);
    domMap.$btnViewStem.bind('click', onClickViewStem);
    domMap.$btnPrevTask.bind('click', onClickChangeTask);
    domMap.$btnNextTask.bind('click', onClickChangeTask);
  };

  /**
   * 跳转到任务列表
   */
  onClickChangeTasks = function () {
    closeAllWindow();
    urlHelper.jump({
      path: '/markPaperSystem/arbitration/arbitrations.html'
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
   * 切换任务
   */
  onClickChangeTask = function () {
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
    service.viewArbitratedQuestions({
      payload: {
        "TaskId": taskId
      }
    }).then((data) => {
      closeLoading();
      renderDOM(data.ReturnEntity);
      toggleBtnStatus(data.ReturnEntity);
      stateMap.prevTaskId = data.ReturnEntity.PreviousTaskId;
      stateMap.nextTaskId = data.ReturnEntity.NextTaskId;
      stateMap.currentTaskId = data.ReturnEntity.TaskId;
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
      service.viewArbitratedQuestions({
        payload: {
          "TaskId": query.taskId
        }
      }).then((data) => {
        closeLoading();
        renderDOM(data.ReturnEntity);
        toggleBtnStatus(data.ReturnEntity);
        stateMap.prevTaskId = data.ReturnEntity.PreviousTaskId;
        stateMap.nextTaskId = data.ReturnEntity.NextTaskId;
        stateMap.currentTaskId = data.ReturnEntity.TaskId;
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
        title: '评分情况',
        column: [
          {
            "name": "给分点",
            "width": 80
          },
          {
            "name": "一评",
            "width": ""
          },
          {
            "name": "二评",
            "width": ""
          },
          {
            "name": "仲裁",
            "width": ""
          }],
        data: data
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
    } else {
      window.windowsGroup = {
        windowViewStem: null
      };
    }
  };
  /*------------------------------- END PUBLIC ----------------------------------*/

  init();
})();

