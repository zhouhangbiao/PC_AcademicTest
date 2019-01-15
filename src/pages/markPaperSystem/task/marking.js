import $ from 'jQuery';
import UrlHelper from 'js-url-helper';
import cookie from '../../../utils/cookie';
import * as service from '../../../services/markPaperSystem/taskServices';
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
    loading: null,
    prevBatchId: null,
    nextBatchId: null,
    currentBatchId: null,
    nextTaskId: null,
    currentTaskId: null
  };
  let domMap = {};
  let drawPaper, scoring;
  /*************** dom method *******************/
  let setDomMap, renderDOM, renderStatusBar, toggleBtnStatus;
  /*************** event method *******************/
  let attachEvent, onClickViewStem, onClickViewPoint, onClickJumpBatch, onClickValidateProblem, onSubmitProblem;
  /*************** public method *******************/
  let init, initDrawPaper, initScoring, closeAllWindow, afterSubmitJump, showLoading, closeLoading, storeWindow;
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
      $btnPrevBatch: $('#prev_batch'),
      $btnNextBatch: $('#next_batch'),
      $btnViewStem: $('#view_stem'),
      $btnViewPoint: $('#view_point'),
      $modalProblem: $('#set_problem_content')
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
      '  <li class="float-l">当前状态：正在判卷</li>'+
      '</ul>'+
      '<ul class="float-l">'+
      '  <li class="float-l">批次号：${BatchId}</li>'+
      '  <li class="float-l">总题数：<span class="font-special">${TotalQuestionCount}</span>题</li>'+
      '  <li class="float-l">已阅：<span class="font-special">${MarkedQuestionsCount}</span>题</li>'+
      '  <li class="float-l">待阅：<span class="font-special">${WaitMarkQuestionsCount}</span>题</li>'+
      '</ul>';

    template = template.replace(/\$\{UserName}/g, cookie.get('UserName'))
      .replace(/\$\{BatchId}/g, data.BatchId)
      .replace(/\$\{TotalQuestionCount}/g, data.TotalQuestionCount)
      .replace(/\$\{MarkedQuestionsCount}/g, data.MarkedQuestionsCount)
      .replace(/\$\{WaitMarkQuestionsCount}/g, data.WaitMarkQuestionsCount);

    domMap.$statusBar.html('').html(template);
  };

  /**
   * 切换（渲染）按钮状态
   * @param {Object} data
   */
  toggleBtnStatus = function (data) {
    domMap.$btnPrevBatch.removeClass('disabled');
    domMap.$btnNextBatch.removeClass('disabled');

    if (data.PreviousBatchId === '') {
      domMap.$btnPrevBatch.addClass('disabled');
    }
    if (data.NextBatchId === '') {
      domMap.$btnNextBatch.addClass('disabled');
    }
  };
  /*------------------------------- END DOM ----------------------------------*/

  /*------------------------------- EVENT ----------------------------------*/
  /**
   * attachEvent
   * 初始化所有事件绑定
   */
  attachEvent = function () {
    domMap.$btnPrevBatch.bind('click', onClickJumpBatch);
    domMap.$btnNextBatch.bind('click', onClickJumpBatch);
    domMap.$btnViewStem.bind('click', onClickViewStem);
    domMap.$btnViewPoint.bind('click', onClickViewPoint);
    domMap.$modalProblem.find('form').bind('submit', onSubmitProblem);
    domMap.$modalProblem.find('form').on('click', 'input[type="submit"]', onClickValidateProblem);
    domMap.$modalProblem.on('shown.bs.modal', function () {
      domMap.$modalProblem.find('textarea').focus();
    })
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
        window.windowsGroup.windowViewStem = window.open(url, '_blank', `location=no, width=${image.width}, height=${image.height}`);
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

    window.windowsGroup.windowViewPoint = window.open(url, '_blank', 'location=no, width=1024, height=572');
  };

  /**
   * 跳转批次
   */
  onClickJumpBatch = function () {
    let batchId, $this = $(this);

    if ($this.hasClass('disabled')) {
      return false;
    }

    if ($this.attr('id').indexOf('prev') > -1) {
      batchId = stateMap.prevBatchId;
    } else {
      batchId = stateMap.nextBatchId;
    }

    closeAllWindow();
    urlHelper.jump({
      path: '/markPaperSystem/task/marking.html',
      search: urlHelper.setSearchParam({
        batchId: batchId
      })
    });
  };

  /**
   * 校验问题试题描述
   */
  onClickValidateProblem = function() {
    if ($.trim(domMap.$modalProblem.find('#description').val()) === "") {
      layer.msg('请填写问题试题描述');
    }
  };

  /**
   * 提交问题试题
   */
  onSubmitProblem = function (event) {
    closeAllWindow();
    showLoading('提交中');
    service.setAsQuestionTest({
      payload: {
        "BatchId": stateMap.currentBatchId,
        "TaskId": stateMap.currentTaskId,
        "IsSetAsQuestionTest": true,
        "Description": domMap.$modalProblem.find('#description').val()
      }
    }).then((data) => {
      closeLoading();

      if (data.ReturnEntity.SetUpState === 1) {
        domMap.$modalProblem.modal('hide');
        domMap.$modalProblem.find('form').get(0).reset();

        if (!afterSubmitJump(data.ReturnEntity)) {
          showLoading('加载中');
          service.getQuestionInformation({
            payload: {
              "BatchId": stateMap.currentBatchId
            }
          }).then((data) => {
            closeLoading();
            renderDOM(data.ReturnEntity);
            stateMap.nextTaskId = data.ReturnEntity.NextTaskId;
            stateMap.currentTaskId = data.ReturnEntity.TaskId;
            stateMap.currentBatchId = data.ReturnEntity.BatchId;
            drawPaper.reload(data.ReturnEntity.QuestionAnswerData);
            scoring.reload(data.ReturnEntity.PointInformations);
          });
        }
      } else {
        layer.msg('设置失败！', {icon: 5});
      }
    });

    event.preventDefault();
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
      service.getQuestionInformation({
        payload: {
          "BatchId": query.batchId
        }
      }).then((data) => {
        closeLoading();
        renderDOM(data.ReturnEntity);
        stateMap.prevBatchId = data.ReturnEntity.PreviousBatchId;
        stateMap.nextBatchId = data.ReturnEntity.NextBatchId;
        stateMap.currentBatchId = data.ReturnEntity.BatchId;
        stateMap.currentTaskId = data.ReturnEntity.TaskId;
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
        service.submitQuestionData({
          payload: {
            "TaskId": stateMap.currentTaskId,
            "BatchId": stateMap.currentBatchId,
            "QuestionMarking": drawPaper.getDrawData(),
            "PointInformations": scores
          }
        }).then((data) => {
          closeLoading();

          if (data.ReturnEntity.CommitState === 1) {
            if (!afterSubmitJump(data.ReturnEntity)) {
              showLoading('加载中');
              service.getQuestionInformation({
                payload: {
                  "BatchId": stateMap.currentBatchId
                }
              }).then((data) => {
                closeLoading();

                renderDOM(data.ReturnEntity);
                stateMap.prevBatchId = data.ReturnEntity.PreviousBatchId;
                stateMap.nextBatchId = data.ReturnEntity.NextBatchId;
                stateMap.currentBatchId = data.ReturnEntity.BatchId;
                stateMap.currentTaskId = data.ReturnEntity.TaskId;
                drawPaper.reload(data.ReturnEntity.QuestionAnswerData);
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
    if (data.NextTaskId === '' && data.NextBatchId === '') {
      layer.confirm('阅卷列表已经全部判分完成！', {
        btn: ['确认'],
        closeBtn: 0
      }, function(){
        urlHelper.jump({
          path: '/markPaperSystem/task/tasks.html'
        });
      });
      return true;
    } else if (data.NextTaskId === '' && data.NextBatchId !== '') {
      layer.confirm('是否自动开始下批任务阅卷！', {
        btn: ['是', '否'],
        closeBtn: 0
      }, function(){
        urlHelper.jump({
          path: '/markPaperSystem/task/marking.html',
          search: urlHelper.setSearchParam({
            batchId: data.NextBatchId
          })
        });
      }, function(){
        urlHelper.jump({
          path: '/markPaperSystem/task/tasks.html'
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

