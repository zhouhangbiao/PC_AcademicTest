import $ from 'jQuery';
import cookie from '../../../utils/cookie';
import * as service from '../../../services/markPaperSystem/taskServices';
import common from '../common';
import UrlHelper from 'js-url-helper';
import style from './tasks.css';
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
    selectCurrent: 1,
    pageIndex: 10,
    pageIndexTwo: 10,
    twoPage: null,
    twoPageTab: null,
  };
  let stateMap = {
    pageIndex: 1,
    pageSize: 10,
    markingTaskBatchTabType: 1
  };
  let domMap = {};
  let doingTableNull = new DataNull({
    wrapper: '#doing',
    tipsText: "暂无待完成任务"
  });
  let doneTableNull = new DataNull({
    wrapper: '#done',
    tipsText: "暂无已完成任务"
  });
  /*************** dom method *******************/
  let setDomMap, renderDOM, renderDoingTable, renderDoneTable, renderStatusBar;
  /*************** event method *******************/
  let attachEvent, onClickJumpMark, onClickJumpTab, onClickJumpTabOne, onChangeSelect, onClickReFresh, onChangeSelect2,
    onClickJumSearch;
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
      $done: $('#done'),
      $doingTable: $('#doing_table'),
      $doneTable: $('#done_table'),
      $statusBar: $('#status_bar'),
      $tabDoing: $('.tabDoing'),
      $tabDone: $('.tabDone'),
      $selectPage: $('#selectPage'),
      $selectPage2: $('#selectPage2'),
      $getPageNum: $('#getPageNum'),
      $refresh: $('#refresh'),
      $pagination: $("#pagination3"),
      $container: $('.container'),
      $start: $('#start'),
      $end: $('#end'),
      $startTab: $('#startTab'),
      $endTab: $('#endTab'),
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
   * 渲染待完成任务
   * @param {Object} data
   */
  renderDoingTable = function (data) {
    if ( data.MarkingTasks.length ) {
      domMap.$box.css('display', 'block');
      doingTableNull.hide();
      domMap.$doingTable.show();
      domMap.$doingTable.find('tbody').html('').html(getTableContent(data.MarkingTasks));
    } else {
      domMap.$box.css('display', 'none');
      doingTableNull.show();
      domMap.$doingTable.hide();
    }
  };
  /**
   * 渲染已完成任务
   * @param {Object} data
   */
  renderDoneTable = function (data) {
    if ( data.MarkingTasks.length ) {
      domMap.$box.css('display', 'block');
      doneTableNull.hide();
      domMap.$doneTable.show();
      domMap.$doneTable.find('tbody').html('').html(getTableContent(data.MarkingTasks));
    } else {
      domMap.$box.css('display', 'none');
      doneTableNull.show();
      domMap.$doneTable.hide();
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
      '<li class="float-l">当前状态：阅卷任务</li>' +
      '</ul>';
    template = template.replace(/\$\{UserName}/g, cookie.get('UserName'));
    domMap.$statusBar.html('').html(template);
  };
  /*------------------------------- END DOM ----------------------------------*/

  /*------------------------------- EVENT ----------------------------------*/
  /**
   * attachEvent
   * 初始化所有事件绑定
   */
  attachEvent = function () {
    domMap.$main.on('click', '.btn-mark-task', onClickJumpMark);
    domMap.$main.on('click', '.btn-view-task', onClickJumSearch);
    domMap.$tabDoing.bind('click', onClickJumpTabOne);
    domMap.$tabDone.bind('click', onClickJumpTab);
    domMap.$selectPage.bind('change', onChangeSelect);
    domMap.$selectPage2.bind('change', onChangeSelect2);
    domMap.$refresh.bind('click', onClickReFresh);
  };
  /**
   * 点击跳转评阅
   */
  onClickJumpMark = function () {

    let batchId = $(this).closest('tr').find('td').eq(1).text();
    urlHelper.jump({
      path: '/markPaperSystem/task/marking.html',
      search: urlHelper.setSearchParam({
        batchId: batchId,
        MarkingTaskBatchTabType: stateMap.markingTaskBatchTabType
      })
    });
  };
  /**
   * 点击跳转查看
   */
  onClickJumSearch = function () {
    let batchId = $(this).closest('tr').find('td').eq(1).text();
    urlHelper.jump({
      path: '/markPaperSystem/task/view.html',
      search: urlHelper.setSearchParam({
        batchId: batchId,
        MarkingTaskBatchTabType: stateMap.markingTaskBatchTabType
      })
    });
  };
  /**
   * 已完成页select切换每页显示个数
   */
  onChangeSelect2 = function () {
    showLoading('加载中');
    configMap.current = 1;
    configMap.selectPage2 = $(this).children('option:selected').val();
    service.getMarkingTasksList({
      payload: {
        "MarkingTaskBatchTabType": stateMap.markingTaskBatchTabType,
        "PageIndex": configMap.current,
        "PageSize": configMap.selectPage2,
      }
    }).then((res) => {
      closeLoading();
      renderDoneTable(res.ReturnEntity);
      if ( configMap.selectPage2 === '10' ) {
        domMap.$container.css('overflow-y', 'hidden');
      } else {
        domMap.$container.css('overflow-y', 'scroll');
      }
      $("#pagination4").pagination({
        totalPage: res.ReturnEntity.TotalPageCount,
        callback: function (current) {
          showLoading('加载中');
          configMap.current = current;
          service.getMarkingTasksList({
            payload: {
              "MarkingTaskBatchTabType": stateMap.markingTaskBatchTabType,
              "PageIndex": current,
              "PageSize": configMap.selectPage2,
            }
          }).then((res) => {
            closeLoading();
            renderDoneTable(res.ReturnEntity);
            domMap.$startTab.html(current * configMap.selectPage2 - configMap.selectPage2 + 1);
            domMap.$endTab.html(current * configMap.selectPage2);
          });
        }
      });
      domMap.$startTab.html(configMap.current * configMap.selectPage2 - configMap.selectPage2 + 1);
      domMap.$endTab.html(configMap.current * configMap.selectPage2)
    });
  };
  /**
   * 点击跳转第二个tab
   */
  onClickJumpTab = function () {
    configMap.pageIndexTwo = domMap.$selectPage2.children('option:selected').val();
    showLoading('加载中');
    stateMap.markingTaskBatchTabType = 2;
    service.getMarkingTasksList({
      payload: {
        "MarkingTaskBatchTabType": stateMap.markingTaskBatchTabType,
        "PageIndex": configMap.current,
        "PageSize": configMap.pageIndexTwo,
      }
    }).then((res) => {
      closeLoading();
      renderDoneTable(res.ReturnEntity);
      $('#totalCount2').html(res.ReturnEntity.TotalCount);
      $("#pagination4").pagination({
        currentPage: configMap.current,
        totalPage: res.ReturnEntity.TotalPageCount,
        isShow: true,
        homePageText: "首页",
        endPageText: "尾页",
        prevPageText: "上一页",
        nextPageText: "下一页",
        callback: function (current) {
          showLoading('加载中');
          configMap.current = current;
          service.getMarkingTasksList({
            payload: {
              "MarkingTaskBatchTabType": stateMap.markingTaskBatchTabType,
              "PageIndex": configMap.current,
              "PageSize": configMap.pageIndexTwo,
            }
          }).then((res) => {
            closeLoading();
            renderDoneTable(res.ReturnEntity);
            domMap.$startTab.html(configMap.current * configMap.pageIndexTwo - configMap.pageIndexTwo + 1);
            domMap.$endTab.html(configMap.current * configMap.pageIndexTwo);
          });
        }
      });
    });
  };
  /**
   * 待完成页select切换每页显示个数
   */
  onChangeSelect = function () {
    showLoading('加载中');
    configMap.selectCurrent = 1;
    configMap.selectPage = $(this).children('option:selected').val();
    service.getMarkingTasksList({
      payload: {
        "MarkingTaskBatchTabType": stateMap.markingTaskBatchTabType,
        "PageIndex": configMap.selectCurrent,
        "PageSize": configMap.selectPage,
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
          service.getMarkingTasksList({
            payload: {
              "MarkingTaskBatchTabType": stateMap.markingTaskBatchTabType,
              "PageIndex": current,
              "PageSize": configMap.selectPage,
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
   * 点击跳转第一个tab
   */
  onClickJumpTabOne = function () {
    configMap.pageIndex = domMap.$selectPage.children('option:selected').val();
    showLoading('加载中');
    stateMap.markingTaskBatchTabType = 1;
    service.getMarkingTasksList({
      payload: {
        "MarkingTaskBatchTabType": stateMap.markingTaskBatchTabType,
        "PageIndex": configMap.selectCurrent,
        "PageSize": configMap.pageIndex,
      }
    }).then((res) => {
      closeLoading();
      renderDoingTable(res.ReturnEntity);
      $("#pagination3").pagination({
        currentPage: configMap.selectCurrent,
        totalPage: res.ReturnEntity.TotalPageCount,
        callback: function (current) {
          showLoading('加载中');
          configMap.selectCurrent = current;
          service.getMarkingTasksList({
            payload: {
              "MarkingTaskBatchTabType": stateMap.markingTaskBatchTabType,
              "PageIndex": configMap.selectCurrent,
              "PageSize": configMap.pageIndex,
            }
          }).then((res) => {
            closeLoading();
            renderDoingTable(res.ReturnEntity);
            domMap.$start.html(configMap.selectCurrent * configMap.pageIndex - configMap.pageIndex + 1);
            domMap.$end.html(configMap.selectCurrent * configMap.pageIndex)
          });
        }
      });
    });
  };
  /**
   * 手动刷新按钮
   */
  onClickReFresh = function () {
    window.location.reload();
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
      service.getMarkingTasksList({
        payload: {
          "MarkingTaskBatchTabType": stateMap.markingTaskBatchTabType,
          "PageIndex": stateMap.pageIndex,
          "PageSize": stateMap.pageSize,
        }
      }).then((res) => {
        renderDoingTable(res.ReturnEntity);
        configMap.TotalPageCount = res.ReturnEntity.TotalPageCount;//总共页数
        configMap.totalCount = res.ReturnEntity.TotalCount;//总共条数
        $('#totalCount').html(configMap.totalCount);
        $("#pagination3").pagination({
          currentPage: configMap.selectCurrent,
          totalPage: configMap.TotalPageCount,
          isShow: true,
          homePageText: "首页",
          endPageText: "尾页",
          prevPageText: "上一页",
          nextPageText: "下一页",
          callback: function (current) {
            configMap.selectCurrent = current;
            showLoading('加载中');
            service.getMarkingTasksList({
              payload: {
                "MarkingTaskBatchTabType": stateMap.markingTaskBatchTabType,
                "PageIndex": current,
                "PageSize": stateMap.pageSize,
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
      let tableCont2 = document.querySelector('#table-cont2');
      tableCont.addEventListener('scroll',scrollHandle);
      tableCont2.addEventListener('scroll',scrollHandle)
    });
  };
  /**
   * 匹配操作选项
   * @param {Number} status
   * @return {String}
   */
  matchOption = function (status,count) {
    let option;
    if (count===0 ) {
      option='';
      return option
    }
    switch (status) {
      case 1 :
        option = '';
        break;
      case 2 :
        option = '<a class ="btn btn-primary btn-pre-sm btn-view-task">查看</a>' +
          '<a class ="btn btn-warning btn-pre-sm  btn-mark-task">评阅</a>';
        break;
      case 3 :
        option = '<a class ="btn btn-primary btn-pre-sm btn-view-task">查看</a>';
        break;
      case 4 :
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
        text = '待开启';
        break;
      case 2 :
        text = '待完成';
        break;
      case 3 :
        text = '已完成';
        break;
      case 4 :
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
      '  <td>${BatchId}</td>' +
      '  <td>${MarkingTaskBatchStatus}</td>' +
      '  <td>${TotalTaskCount}</td>' +
      '  <td>${ReviewedTaskCount}</td>' +
      '  <td>${WaitReviewTaskCount}</td>' +
      '  <td>${TaskDeliveryDate}</td>' +
      '  <td>${LatestUploadTime}</td>' +
      '  <td>${Option}</td>' +
      '</tr>';
    let content = '';

    $.each(task, function (i) {
      content += rowTemplate.replace(/\$\{SN}/g, i + 1)
        .replace(/\$\{BatchId}/g, this.BatchId)
        .replace(/\$\{MarkingTaskBatchStatus}/g, matchStatus(this.MarkingTaskBatchStatus))
        .replace(/\$\{TotalTaskCount}/g, this.TotalTaskCount)
        .replace(/\$\{ReviewedTaskCount}/g, this.ReviewedTaskCount)
        .replace(/\$\{WaitReviewTaskCount}/g, this.WaitReviewTaskCount)
        .replace(/\$\{TaskDeliveryDate}/g, this.TaskDeliveryDate)
        .replace(/\$\{LatestUploadTime}/g, this.LatestUploadTime)
        .replace(/\$\{Option}/g, matchOption(this.MarkingTaskBatchStatus,this.TotalTaskCount));
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

