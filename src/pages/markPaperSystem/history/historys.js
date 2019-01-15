import $ from 'jQuery';
import cookie from '../../../utils/cookie';
import * as service from '../../../services/markPaperSystem/historyServices';
import common from '../common';
import UrlHelper from 'js-url-helper';
import style from './historys.css';
import DataNull from '../../../components/DataNull';

let urlHelper = new UrlHelper(location);
let query = urlHelper.getSearchParam();

(function () {
  "use strict";
  /*------------------------------- VARIABLES ----------------------------------*/
  let configMap = {
    selectPage: null,
    selectPage2: null,
    TotalPageCount: null,
    TotalPageCountTwo: null,
    jumpPageCount: null,
    info: null,
    totalCount: null,
    current: 1,
    pageIndex: 10,
    twoPage: 10,
  };
  let stateMap = {
    QuestionIndex: 1,
    Score: 85,
    SubmitStartDate: '2018-02-14 15:20',
    SubmitEndDate: '2018-02-14 16:20',
    pageIndex: 1,
    pageSize: 10,
    markingTaskBatchTabType: 1
  };
  let domMap = {};
  let doingTableNull = new DataNull({
    wrapper: '#doing',
    tipsText: "暂无已阅试题"
  });

  /*************** dom method *******************/
  let setDomMap, renderDOM, renderDoingTable, renderStatusBar, value;
  /*************** event method *******************/
  let attachEvent, onClickJumpMark, onClickJumpTabOne, onChangeSelect, onClickReFresh, onClickJumSearch
    , onClickSubmit, onClickRemove, onClickRemovePic, onFocusRemove;
  /*************** public method *******************/
  let init, matchOption, matchStatus, getTableContent, showLoading, closeLoading,scrollHandle;
  /*------------------------------- END VARIABLES ----------------------------------*/

  /*------------------------------- DOM ----------------------------------*/
  /**
   * setDomMap
   * 缓存DOM集合
   */
  setDomMap = function () {
    domMap = {
      $main: $('#main'),
      $tabs: $('#myTab'),
      $doing: $('#doing'),
      $doingTable: $('#doing_table'),
      $statusBar: $('#status_bar'),
      $tabDoing: $('.tabDoing'),
      $selectPage: $('#selectPage'),
      $getPageNum: $('#getPageNum'),
      $refresh: $('#refresh'),
      $startDate: $('#startDate'),
      $focus: $("#endDate"),
      $getPoint: $("#getPoint"),
      $findBtn: $(".findBtn"),
      $btnOne: $('.btnOne'),
      $btnTwo: $('.btnTwo'),
      $container: $('.container'),
      $start: $('#start'),
      $end: $('#end'),
      $box: $(".box"),
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
   * 渲染已阅读任务
   * @param {Object} data
   */
  renderDoingTable = function (data) {
    if ( data.JudgingHistories.length) {
      domMap.$box.css('display', 'block');
      doingTableNull.hide();
      domMap.$doingTable.show();
      domMap.$doingTable.find('tbody').html('').html(getTableContent(data.JudgingHistories));
    } else {
      domMap.$box.css('display', 'none');
      doingTableNull.show();
      domMap.$doingTable.hide();
    }
  };

  /**
   * 渲染状态栏
   */
  renderStatusBar = function () {
    let template = '<ul class="float-l footer-status">' +
      '<li class="float-l">用户：${UserName}</li>' +
      '</ul>' +
      '<ul class="float-l">' +
      '<li class="float-l">当前状态：判卷历史</li>' +
      '</ul>';
    template = template.replace(/\$\{UserName}/g, cookie.get('UserName'));
    domMap.$statusBar.html('').html(template);
  };
  /*------------------------------- END DOM ----------------------------------*/

  /*------------------------------- EVENT ----------------------------------*/
  /**
   * 点击小图片点击处理事件
   */
  onClickRemove = function () {
    domMap.$startDate.datetimepicker('show');
    $('tfoot').remove()
  };
  /**
   * 点击小图片点击处理事件
   */
  onClickRemovePic = function () {
    domMap.$focus.datetimepicker('show');
    $('tfoot').remove()
  };

  /**
   * 获取焦点处理事件
   */
  onFocusRemove = function () {
    $('tfoot').remove()
  };
  /**
   * attachEvent
   * 初始化所有事件绑定
   */
  attachEvent = function () {
    domMap.$main.on('click', '.btn-mark-task', onClickJumpMark);
    domMap.$main.on('click', '.btn-view-task', onClickJumSearch);
    domMap.$tabDoing.bind('click', onClickJumpTabOne);
    domMap.$selectPage.bind('change', onChangeSelect);
    domMap.$refresh.bind('click', onClickReFresh);
    domMap.$findBtn.bind('click', onClickSubmit);
    domMap.$btnTwo.bind('click', onClickRemovePic);
    domMap.$startDate.bind('focus', onFocusRemove);
    domMap.$focus.bind('focus', onFocusRemove);
    domMap.$btnOne.bind('click', onClickRemove);
  };

  /**
   * 点击跳转回评
   */
  onClickJumpMark = function () {
    let batchId = $(this).closest('tr').find('td').eq(5).text();
    let taskId = $(this).closest('tr').find('td').eq(1).text();
    urlHelper.jump({
      path: '/markPaperSystem/history/marking.html',
      search: urlHelper.setSearchParam({
        batchId: batchId,
        taskId: taskId,
      })
    });
  };
  /**
   * 点击跳转查看
   */
  onClickJumSearch = function () {
    let batchId = $(this).closest('tr').find('td').eq(5).text();
    let taskId = $(this).closest('tr').find('td').eq(1).text();
    urlHelper.jump({
      path: '/markPaperSystem/history/view.html',
      search: urlHelper.setSearchParam({
        batchId: batchId,
        taskId: taskId,
      })
    });
  };
  /**
   * select切换每页显示个数
   */
  onChangeSelect = function () {
    showLoading('加载中');
    configMap.selectCurrent = 1;
    configMap.selectPage = $(this).children('option:selected').val();
    service.getJudgingHistoryList({
      payload: {
        QuestionIndex: $('#testID').val(),
        Score: $('#getPoint').val(),
        SubmitStartDate: domMap.$startDate.val(),
        SubmitEndDate: domMap.$focus.val(),
        PageIndex: configMap.selectCurrent,
        PageSize: configMap.selectPage,
      }
    }).then((res) => {
      closeLoading();
      renderDoingTable(res.ReturnEntity);
      if ( configMap.selectPage === '10' ) {
        domMap.$container.css('overflow-y', 'hidden');
      } else {
        domMap.$container.css('overflow-y', 'scroll');
      }
      $("#pagination3").pagination({
        totalPage: res.ReturnEntity.TotalPageCount,
        callback: function (current) {
          showLoading('加载中');
          configMap.selectCurrent = current;
          service.getJudgingHistoryList({
            payload: {
              QuestionIndex: $('#testID').val(),
              Score: $('#getPoint').val(),
              SubmitStartDate: domMap.$startDate.val(),
              SubmitEndDate: domMap.$focus.val(),
              PageIndex: current,
              PageSize: configMap.selectPage
            }
          }).then((res) => {
            closeLoading();
            renderDoingTable(res.ReturnEntity);
            domMap.$start.html(current * configMap.selectPage - configMap.selectPage + 1);
            domMap.$end.html(current * configMap.selectPage)
          });
        }
      });
      domMap.$start.html(configMap.selectCurrent * configMap.selectPage - configMap.selectPage + 1);
      domMap.$end.html(configMap.selectCurrent * configMap.selectPage)
    });
  };
  /**
   * 点击提交
   */
  onClickSubmit = function () {
    configMap.selectPage = domMap.$selectPage.children('option:selected').val();
    service.getJudgingHistoryList({
      payload: {
        QuestionIndex: $('#testID').val(),
        Score: $('#getPoint').val(),
        SubmitStartDate: domMap.$startDate.val(),
        SubmitEndDate: domMap.$focus.val(),
        PageIndex: stateMap.pageIndex,
        PageSize: configMap.selectPage,
      }
    }).then((res) => {
      closeLoading();
      renderDoingTable(res.ReturnEntity);
      $('#totalCount').html(res.ReturnEntity.TaskTotalCount);
      $("#pagination3").pagination({
        totalPage: res.ReturnEntity.TotalPageCount,
        isShow: true,
        homePageText: "首页",
        endPageText: "尾页",
        prevPageText: "上一页",
        nextPageText: "下一页",
        callback: function (current) {
          configMap.current = current;
          showLoading('加载中');
          service.getJudgingHistoryList({
            payload: {
              QuestionIndex: $('#testID').val(),
              Score: $('#getPoint').val(),
              SubmitStartDate: domMap.$startDate.val(),
              SubmitEndDate: domMap.$focus.val(),
              PageIndex: current,
              PageSize: configMap.selectPage,
            }
          }).then((res) => {
            closeLoading();
            renderDoingTable(res.ReturnEntity);
            domMap.$start.html(configMap.current * configMap.selectPage - configMap.selectPage + 1);
            domMap.$end.html(configMap.current * configMap.selectPage)
          });
        }
      });
      domMap.$start.html(stateMap.pageIndex * configMap.selectPage - configMap.selectPage + 1);
      domMap.$end.html(stateMap.pageIndex * configMap.selectPage)
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
      setDomMap();
      renderDOM();
      attachEvent();
      $("#startDate").datetimepicker({
        keyboardNavigation: false,
        forceParse: false,
        autoclose: true,   //选择日期后自动关闭日期选择框
        todayHighlight: true,   //当天高亮显示
        showMeridian: 1,
        pickerPosition: "bottom-right",
        endDate: new Date(),
        clearBtn: true,
        language: 'zh-CN',
        todayBtn: true,
      }).on('changeDate', function (ev) {
        let startTime = domMap.$startDate.val();
        domMap.$focus.datetimepicker('setStartDate', startTime);
        domMap.$startDate.datetimepicker('hide');
      });
      $("#endDate").datetimepicker({
        keyboardNavigation: false,
        forceParse: false,
        autoclose: true,   //选择日期后自动关闭日期选择框
        todayHighlight: true,   //当天高亮显示
        showMeridian: 1,
        pickerPosition: "bottom-right",
        endDate: new Date(),
        clearBtn: true,
        language: 'zh-CN',
        todayBtn: true,
      }).on('changeDate', function (ev) {
        let endTime = domMap.$focus.val();
        domMap.$startDate.datetimepicker('setEndDate', endTime);
        domMap.$focus.datetimepicker('hide');
      });
      //处理input text输入框的值
      domMap.$getPoint.bind("input porpertychange", function () {
        value = Number(domMap.$getPoint.val());
        if ( value >= 9999 ) {
          domMap.$getPoint.val("9999");
        }
      });
      service.getJudgingHistoryList({
        payload: {
          PageIndex: stateMap.pageIndex,
          PageSize: configMap.pageIndex,
        }
      }).then((res) => {
        renderDoingTable(res.ReturnEntity);
        configMap.TotalPageCount = res.ReturnEntity.TotalPageCount;//总共页数
        configMap.totalCount = res.ReturnEntity.TaskTotalCount;//总共条数
        $('#totalCount').html(configMap.totalCount);
        $("#pagination3").pagination({
          currentPage: 1,
          totalPage: configMap.TotalPageCount,
          isShow: true,
          homePageText: "首页",
          endPageText: "尾页",
          prevPageText: "上一页",
          nextPageText: "下一页",
          callback: function (current) {
            configMap.current = current;
            showLoading('加载中');
            service.getJudgingHistoryList({
              payload: {
                QuestionIndex: $('#testID').val(),
                Score: $('#getPoint').val(),
                SubmitStartDate: domMap.$startDate.val(),
                SubmitEndDate: domMap.$focus.val(),
                PageIndex: current,
                PageSize: configMap.pageIndex,
              }
            }).then((res) => {
              closeLoading();
              renderDoingTable(res.ReturnEntity);
              domMap.$start.html(current * configMap.pageIndex - configMap.pageIndex + 1);
              domMap.$end.html(current * configMap.pageIndex)
            });
          }
        });
      });
      //表格表头固定
      let tableCont = document.querySelector('#table-cont');
      tableCont.addEventListener('scroll',scrollHandle);
    });
  };

  /**
   * 匹配操作选项
   * @param {Object} task
   * @return {String}
   */
  matchOption = function (task) {
    let option;

    switch (task.MarkingTaskStatus) {
      case 1 :
        option = '';
        break;
      case 2 :
        option = '<a class ="btn btn-primary btn-pre-sm btn-view-task">查看</a>';
        break;
      case 3 :
        if ( task.IsAbnormal ) {
          option = '<a class ="btn btn-primary btn-pre-sm btn-view-task">查看</a>';
        } else {
          option = '<a class ="btn btn-primary btn-pre-sm btn-view-task">查看</a>' +
            '<a class ="btn btn-warning btn-pre-sm btn-mark-task">回评</a>';
        }
        break;
      case 4 :
        option = '<a class ="btn btn-primary btn-pre-sm btn-view-task">查看</a>';
        break;
      case 5 :
        option = '<a class ="btn btn-primary btn-pre-sm btn-view-task">查看</a>';
        break;
      case 6 :
        option = '<a class ="btn btn-primary btn-pre-sm btn-view-task">查看</a>';
        break;
    }

    return option;
  };

  /**
   * 匹配操作选项
   * @param {Number} status
   * @return {String}
   */
  matchStatus = function (status) {
    let text;
    switch (status) {
      case 1 :
        text = '待分配';
        break;
      case 2 :
        text = '待批改';
        break;
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
   * 获取表格内容
   * @param {Object} task
   * @return {String}
   */
  getTableContent = function (task) {
    let rowTemplate = '<tr>' +
      '  <td>${SN}</td>' +
      '  <td>${TaskId}</td>' +
      '  <td>${MarkingTaskStatus}</td>' +
      '  <td>${ExamId}</td>' +
      '  <td>${QuestionIndex}</td>' +
      '  <td>${BatchId}</td>' +
      '  <td>${Score}</td>' +
      '  <td>${SubmitDate}</td>' +
      '  <td>${Option}</td>' +
      '</tr>';
    let content = '';

    $.each(task, function (i) {
      content += rowTemplate.replace(/\$\{SN}/g, i + 1)
        .replace(/\$\{TaskId}/g, this.TaskId)
        .replace(/\$\{MarkingTaskStatus}/g, matchStatus(this.MarkingTaskStatus))
        .replace(/\$\{ExamId}/g, this.ExamId)
        .replace(/\$\{QuestionIndex}/g, this.QuestionIndex)
        .replace(/\$\{BatchId}/g, this.BatchId)
        .replace(/\$\{Score}/g, this.Score)
        .replace(/\$\{SubmitDate}/g, this.SubmitDate)
        .replace(/\$\{Option}/g, matchOption(this));
    });

    return content;
  };
  /**
   * 表头固定方法
   */
  scrollHandle = function (e) {
    let scrollTop = this.scrollTop;
    this.querySelector('thead').style.transform = 'translateY(' + scrollTop + 'px)';
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

