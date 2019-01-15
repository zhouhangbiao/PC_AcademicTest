import $ from 'jQuery';
import UrlHelper from 'js-url-helper';
import style from './Scoreboard.css';

let urlHelper = new UrlHelper(location);
let query = urlHelper.getSearchParam();

/**
 * 计分板
 * @param options
 * @constructor
 */
function Scoreboard(options) {
  let defaults = {
    /**
     * 父容器
     * @cfg {String} [wrapper="body"]
     */
    wrapper: 'body',
    /**
     * 评分点信息
     * @cfg {Object}
     */
    resource: {
      title: '',
      column: [],
      data: []
    },
    /**
     * 是否显示查看评分标记按钮
     */
    stampBtn: true,
    /**
     * 绘图组件id
     * @cfg {String} [id = new Date().getTime()]
     */
    id: new Date().getTime()
  };

  let $container, $thead, $tbody, $tfoot;
  let scores = [];

  /**
   * 组件初始化
   * @private
   * @template
   */
  function _init() {
    defaults = $.extend({}, defaults, options);
    $.each(defaults.resource.column, function () {
      scores.push(0);
    });

    _storeWindow();
    _renderDOM();
    _renderItemHead();
    _renderItem();
    _renderItemFoot();
    _attachEvent();
  }

  /**
   * 渲染组件DOM
   * @private
   */
  function _renderDOM() {
    let template = '<div id="${id}">'+
      '  <table class="table-bordered scoreboard-table">'+
      '    <thead><tr><th colspan="' + defaults.resource.column.length + '">${title}</th></tr></thead>'+
      '    <thead></thead>'+
      '    <tbody></tbody>'+
      '    <tfoot></tfoot>'+
      '  </table>'+
      '  <div class="text-center btn-groups" style="display: ${stampBtn}">'+
      '    <button class="btn btn-primary btn-other-size view-marking-1">查看一评标记</button>'+
      '    <button class="btn btn-primary btn-other-size view-marking-2">查看二评标记</button>'+
      '  </div>'+
      '</div>';

    $(defaults.wrapper).html(
      template.replace(/\$\{id}/, 'scoreboard-' + defaults.id)
        .replace(/\$\{title}/, defaults.resource.title)
        .replace(/\$\{stampBtn}/, defaults.stampBtn ? "block" : "none")
    );
    $container = $('#scoreboard-' + defaults.id);
    $thead = $container.find('thead').eq(1);
    $tbody = $container.find('tbody');
    $tfoot = $container.find('tfoot');
  }

  /**
   * 渲染给分项表头
   * @private
   */
  function _renderItemHead() {
    let template = '<th width="${width}">${name}</th>';
    let str = '';

    $.each(defaults.resource.column, function (i) {
      if (i === 0) {
        str += '<tr>' + template.replace(/\$\{width}/g, this.width)
            .replace(/\$\{name}/g, this.name);
      } else if (i === defaults.resource.column.length - 1) {
        str += template.replace(/\$\{width}/g, this.width)
            .replace(/\$\{name}/g, this.name) + '</tr>';
      } else {
        str += template.replace(/\$\{width}/g, this.width)
            .replace(/\$\{name}/g, this.name);
      }
    });

    $thead.html('').html(str);
  }

  /**
   * 渲染给分项
   * @private
   */
  function _renderItem() {
    let template = '<td class="text-center">${SN} (${full}分)</td>';
    let templateScore = '<td class="text-center">${score}</td>';
    let str = '';
    let score;

    $.each(defaults.resource.data, function () {
      let data = this;

      $.each(defaults.resource.column, function (i) {
        if (i === 0) {
          str += '<tr>' + template.replace(/\$\{SN}/g, data.PointNumber)
              .replace(/\$\{full}/g, data.FullPoint);
        } else if (i === defaults.resource.column.length - 1) {
          str += templateScore.replace(/\$\{score}/g, (data.Scores[i-1] === null ? '无' : data.Scores[i-1])) + '</tr>';
          scores[i-1] += (data.Scores[i-1] ? data.Scores[i-1] : 0);
        } else {
          str += templateScore.replace(/\$\{score}/g, (data.Scores[i-1] === null ? '无' : data.Scores[i-1]));
          scores[i-1] += (data.Scores[i-1] ? data.Scores[i-1] : 0);
        }
      });
    });

    $tbody.html('').html(str);
  }

  /**
   * 渲染给分总分
   * @private
   */
  function _renderItemFoot() {
    let template = '<td>${score}</td>';
    let str = '';

    $.each(defaults.resource.column, function (i) {
      if (i === 0) {
        str += '<tr>' + template.replace(/\$\{score}/g, "总分");
      } else if (i === defaults.resource.column.length - 1) {
        str += template.replace(/\$\{score}/g, scores[i-1]) + '</tr>';
      } else {
        str += template.replace(/\$\{score}/g, scores[i-1]);
      }
    });

    $tfoot.html('').html(str);
  }

  /**
   * 事件绑定
   * @private
   * @template
   */
  function _attachEvent() {
    $container.on('click', 'button.view-marking-1', _viewMarking);
    $container.on('click', 'button.view-marking-2', _viewMarking);
  }

  /**
   * 查看评分标记
   * @private
   */
  function _viewMarking() {
    let url;

    if ($(this).attr('class').indexOf('-1') > -1) {
      url = urlHelper.link({
        path: '/markPaperSystem/stamp.html',
        search: urlHelper.setSearchParam({
          batchId: query.batchId,
          taskId: query.taskId,
          reviewerType: 2
        })
      });

      if (window.windowsGroup.windowViewStamp1 && window.windowsGroup.windowViewStamp1.top) {
        window.windowsGroup.windowViewStamp1.focus();
        return;
      }

      window.windowsGroup.windowViewStamp1 = window.open(url, '_blank', 'location=no, resizable=no, width=1024, height=562');
    } else {
      url = urlHelper.link({
        path: '/markPaperSystem/stamp.html',
        search: urlHelper.setSearchParam({
          batchId: query.batchId,
          taskId: query.taskId,
          reviewerType: 3
        })
      });

      if (window.windowsGroup.windowViewStamp2 && window.windowsGroup.windowViewStamp2.top) {
        window.windowsGroup.windowViewStamp2.focus();
        return;
      }

      window.windowsGroup.windowViewStamp2 = window.open(url, '_blank', 'location=no, resizable=no, width=1024, height=562');
    }
  }

  /**
   * 存储窗体
   */
  function _storeWindow() {
    if (window.windowsGroup) {
      window.windowsGroup.windowViewStamp1 = null;
      window.windowsGroup.windowViewStamp2 = null;
    } else {
      window.windowsGroup = {
        windowViewStamp1: null,
        windowViewStamp2: null
      };
    }
  }

  /**
   * 重新装载
   * @param {Object} data
   */
  this.reload = function (data) {
    defaults.resource.data = data;
    scores = [];
    $.each(defaults.resource.column, function () {
      scores.push(0);
    });
    _renderItemHead();
    _renderItem();
    _renderItemFoot();
  };

  _init();
}

export default Scoreboard;
