import $ from 'jQuery';
import cookie from '../../../utils/cookie';
import * as service from '../../../services/markPaperSystem/taskServices'
import DrawPaper from '../../../components/DrawPaper';
import Scoreboard from '../../../components/Scoreboard';
import Scoring from '../../../components/Scoring';
import common from '../common';
import UrlHelper from 'js-url-helper';
import style from './view.css';
import * as commonService from "../../../services/markPaperSystem/commonServices";

const API = cookie.get('host') === 'undefined' ? 'http://localhost:3000' : cookie.get('host');
let urlHelper = new UrlHelper(location);
let query = urlHelper.getSearchParam();
(function () {
  "use strict";
  /*------------------------------- VARIABLES ----------------------------------*/
  let domMap = {};
  let stateMap = {
    loading: null,
    prevBatchId: null,
    nextBatchId: null,
    currentBatchId: null,
    nextTaskId: null,
    currentTaskId: null,
    taskId: null,
    query: null,
    attrId: null,
    information: null,
    testId: null,
    batchStatus: null,
    previous: null,
    next: null,

  };
  let data = '';
  let totalNum = 0;
  let NextTaskId, PreviousTaskId;
  /*************** dom method *******************/
  let setDomMap, renderDOM, renderStatusBar;
  /*************** event method *******************/
  let attachEvent, onClickbtnRefresh, onClickViewStem, onClickViewReview;
  /*************** public method *******************/
  let init, information, getMarkingTasksData,
    generateParentLi, parent, parentLiEvent, getState, showLoading, closeLoading, storeWindow, closeAllWindow;
  /*------------------------------- END VARIABLES ----------------------------------*/

  /*------------------------------- DOM ----------------------------------*/
  /**
   * setDomMap
   * 缓存DOM集合
   */
  setDomMap = function () {
    domMap = {
      $statusBar: $('#status_bar'),
      $btnOtherSize: $('#reBackList'),
      $btnViewStem: $('#view_stem'),
      $btnReView: $('.backJudge'),
      $lastTopic: $('.lastTopic'),
      $nextTopic: $('.nextTopic'),
      $parent: $('#parent'),
      $reelNumberListThree: $('.reelNumberListThree'),
      $tableBody: $('#tableBody'),
      $startJudge: $('.startJudge'),
      $testStatus: $('.testStatus'),
      $previousBatch: $('#previousBatch'),
      $nextBatchBtn: $('#nextBatchBtn')
    };
  };
  /**
   * renderDOM
   * 渲染DOM数据
   */
  renderDOM = function (data) {
    renderStatusBar(data);
  };
  /**
   * 切换（渲染）按钮状态
   * @param {Object} data
   */
  renderStatusBar = function (data) {
    let template = '<ul class="float-l footer-status">' +
      '  <li class="float-l">用户：${UserName}</li>' +
      '</ul>' +
      '<ul class="float-l">' +
      '  <li class="float-l">当前状态：查看阅卷任务</li>' +
      '</ul>' +
      '<ul class="float-l">' +
      '  <li class="float-l">任务批号：${batchId}</li>' +
      '  <li class="float-l">阅卷状态：<span class="font-special">' + getState(stateMap.batchStatus) + '</span></li>' +
      '  <li class="float-l">试题状态：<span class="font-special testStatus">${MarkQuestionStatus}</span></li>' +
      '</ul>';
    template = template.replace(/\$\{UserName}/g, cookie.get('UserName'))
      .replace(/\$\{batchId}/g, query.batchId)
      .replace(/\$\{taskId}/g, stateMap.batchStatus)
      .replace(/\$\{MarkQuestionStatus}/g, data.MarkQuestionStatus);
    domMap.$statusBar.html('').html(template);
  };
  /**
   * 查看题干
   */
  onClickViewStem = function () {
    $('.viewTest ul li').each(function () {
      if ( $(this).hasClass('nav-active') ) {
        stateMap.currentTaskId = $(this).attr('data-id');
      }
    });
    if ( window.windowsGroup.windowViewStem && window.windowsGroup.windowViewStem.top ) {
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
        if ( err.name === 'QuotaExceededError' ) {
          sessionStorage.setItem('stem', '');
          layer.msg('本地存储超出限制！题干将重新加载');
        }
      }
      image.onload = function () {
        window.windowsGroup.windowViewStem = window.open(url, '_blank', `location=no, width=${image.width}, height=${image.height}`);
      };
    });
  };
  /**
   * onClickViewReview
   * 点击回评跳转
   */
  onClickViewReview = function () {
    closeAllWindow();
    $('.viewTest ul li').each(function () {
      if ( $(this).hasClass('nav-active') ) {
        stateMap.currentTaskId = $(this).attr('data-id');
        stateMap.query = stateMap.currentTaskId
      }
    });
    urlHelper.jump({
      path: '/markPaperSystem/history/marking.html',
      search: urlHelper.setSearchParam({
        batchId: query.batchId,
        taskId: stateMap.currentTaskId
      })
    });
  };
  /**
   * getState
   * 任务状态转换
   */
  getState = function (state) {
    state = state * 1;
    if ( state === 1 ) {
      return '待开启';
    } else if ( state === 2 ) {
      $('.viewTest ul li').each(function () {
        if ( $(this).hasClass('nav-active') ) {
          stateMap.query = $(this).attr('data-id');
        }
      });
      domMap.$startJudge.css('display', 'inline');
      domMap.$startJudge.click(function () {
        closeAllWindow();
        urlHelper.jump({
          path: '/markPaperSystem/task/marking.html',
          search: urlHelper.setSearchParam({
            batchId: query.batchId,
            taskId: stateMap.query
          })
        });
      });
      return '待完成';
    } else if ( state === 3 ) {
      return '已完成';
    } else if ( state === 4 ) {
      return '已关闭';
    }
  };
  /*------------------------------- END DOM ----------------------------------*/

  /*------------------------------- EVENT ----------------------------------*/
  /**
   * attachEvent
   * 初始化所有事件绑定
   */
  attachEvent = function () {
    domMap.$btnOtherSize.bind('click', onClickbtnRefresh);
    domMap.$btnViewStem.bind('click', onClickViewStem);
    domMap.$btnReView.bind('click', onClickViewReview); //点击回评
  };
  /**
   * onClickbtnRefresh
   * 手动刷新按钮
   */
  onClickbtnRefresh = function () {
    closeAllWindow();
    urlHelper.jump({
      path: '/markPaperSystem/task/tasks.html',
    });
  };
  /*------------------------------- END EVENT ----------------------------------*/
  /**
   * information
   * 题号调用公共方法
   */
  information = function (param) {
    totalNum = 0;
    service.viewQuestionInformation({
      payload: param
    }).then((res) => {
      closeLoading();
      console.log(res);
      renderDOM(res.ReturnEntity);
      NextTaskId = res.ReturnEntity.NextTaskId;
      PreviousTaskId = res.ReturnEntity.PreviousTaskId;
      let content = '';
      let image = new Image();
      image.src = res.ReturnEntity.JudgmentInformation;
      image.onload = function () {
        domMap.$reelNumberListThree.html(image);
      };
      if ( res.ReturnEntity.MarkQuestionStatus === 1 ) {
        domMap.$btnReView.css('display', 'none');
        $('.testStatus').html('待分配');
      } else if ( res.ReturnEntity.MarkQuestionStatus === 2 ) {
        domMap.$btnReView.css('display', 'none');
        $('.testStatus').html('待评阅');
      } else if ( res.ReturnEntity.MarkQuestionStatus === 3 && res.ReturnEntity.IsAbnormal === true ) {
        domMap.$btnReView.css('display', 'none');
        $('.testStatus').html('已评阅');
      } else if ( res.ReturnEntity.MarkQuestionStatus === 3 && res.ReturnEntity.IsAbnormal === false ) {
        domMap.$btnReView.css('display', 'block');
        $('.testStatus').html('已评阅');
      } else if ( res.ReturnEntity.MarkQuestionStatus === 4 ) {
        domMap.$btnReView.css('display', 'none');
        $('.testStatus').html('待仲裁');
      } else if ( res.ReturnEntity.MarkQuestionStatus === 5 ) {
        domMap.$btnReView.css('display', 'none');
        $('.testStatus').html('已仲裁');
      } else if ( res.ReturnEntity.MarkQuestionStatus === 6 ) {
        domMap.$btnReView.css('display', 'none');
        $('.testStatus').html('已关闭');
      }
      for ( let i = 0; i < res.ReturnEntity.PointInformations.length; i++ ) {
        content += '<tr>' +
          '<td>' + (i + 1) + ' ' + '(' + res.ReturnEntity.PointInformations[ i ].FullPoint + ')' + '</td>' +
          '<td>' + (res.ReturnEntity.PointInformations[ i ].Score === null ? '无' : res.ReturnEntity.PointInformations[ i ].Score) + '</td>' +
          '</tr>';
        totalNum += res.ReturnEntity.PointInformations[ i ].Score;
      }
      domMap.$tableBody.append(content);
      $('#totalNum').html(totalNum);
    })
  };
  /* **********************************************************分割************************************************************************************************/
  /**
   * parent
   * 任务号点击事件
   */
  parent = function () {
    let parentLis = domMap.$parent.find('li');
    for ( let i = 0, len = parentLis.length; i < len; i++ ) {
      parentLis[ i ].addEventListener('click', parentLiEvent, false);
    }
  };
  /**
   * parentLiEvent
   * 任务号回调
   */
  parentLiEvent = function () {
    domMap.$tableBody.empty();
    $(this).addClass("nav-active").siblings().removeClass("nav-active");
    stateMap.testId = $(this).text();
    for ( let i = 0, len = data.length; i < len; i++ ) {
      if ( data[ i ] === stateMap.testId ) {
        let param = {
          TaskId: stateMap.testId,
          BatchId: query.batchId,
        };
        information(param);
      }
    }
  };
  /**
   * generateParentLi
   * 生成任务号
   */
  generateParentLi = function (list) {
    let parentLi = '';
    for ( let i = 0, len = list.length; i < len; i++ ) {
      parentLi += '<li data-id=' + list[ i ] + '>' + list[ i ] + '</li>';
    }
    stateMap.query = list[ 0 ];
    domMap.$parent.append(parentLi);
    $('#parent li').first().addClass("nav-active").siblings().removeClass("nav-active");
  };
  /**
   * getMarkingTasksData
   * 调用'查看阅卷任务数据'接口方法
   */
  getMarkingTasksData = function (params) {
    service.getMarkingTasksData({
      payload: params
    }).then((res) => {
      renderDOM(res.ReturnEntity);
      stateMap.previous = res.ReturnEntity.PreviousBatchId;
      stateMap.next = res.ReturnEntity.NextBatchId;
      stateMap.batchStatus = res.ReturnEntity.BatchStatus;
      if ( stateMap.previous === "" ) {
        domMap.$previousBatch.addClass('disabled');
        domMap.$previousBatch.unbind("click")
      } else {
        domMap.$previousBatch.removeClass('disabled');
      }
      if ( stateMap.next === "" ) {
        domMap.$nextBatchBtn.addClass('disabled');
        domMap.$nextBatchBtn.unbind("click")
      } else {
        domMap.$nextBatchBtn.removeClass('disabled');
      }
      closeLoading();
      // 数据
      data = res.ReturnEntity.TaskIds;
      // 生成任务号
      generateParentLi(data);
      // 任务号点击事件
      parent();
      //默认查看第一题信息
      let param = {
        TaskId: stateMap.query,
        BatchId: query.batchId,
      };
      information(param);
    });
  };
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
      //查看阅卷任务
      let params = {
        BatchId: query.batchId,
        MarkingTaskBatchTabType: query.MarkingTaskBatchTabType
      };
      getMarkingTasksData(params);

      //点击上一批
      domMap.$previousBatch.click(function () {
        closeAllWindow();
        console.log(stateMap.previous);
        showLoading('加载中');
        domMap.$parent.html('');
        domMap.$tableBody.empty();
        urlHelper.jump({
          path: '/markPaperSystem/task/view.html',
          search: urlHelper.setSearchParam({
            batchId: stateMap.previous,
            MarkingTaskBatchTabType: query.MarkingTaskBatchTabType
          })
        });
      });
      //点击下一批
      domMap.$nextBatchBtn.click(function () {
        closeAllWindow();
        showLoading('加载中');
        domMap.$parent.html('');
        domMap.$tableBody.empty();
        urlHelper.jump({
          path: '/markPaperSystem/task/view.html',
          search: urlHelper.setSearchParam({
            batchId: stateMap.next,
            MarkingTaskBatchTabType: query.MarkingTaskBatchTabType
          })
        });
      });
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
    if ( window.windowsGroup ) {
      window.windowsGroup.windowViewStem = null;
      window.windowsGroup.windowViewPoint = null;
    } else {
      window.windowsGroup = {
        windowViewStem: null,
        windowViewPoint: null
      };
    }
  };
  /**
   * 关闭所有弹窗
   */
  closeAllWindow = function () {
    Object.keys(window.windowsGroup).forEach(function (key) {
      window.windowsGroup[ key ] && window.windowsGroup[ key ].close();
    });
  };
  /*------------------------------- END PUBLIC ----------------------------------*/
  init();
})();

