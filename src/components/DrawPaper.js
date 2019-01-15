import $ from 'jQuery';
import style from './DrawPaper.css';

/**
 * 试卷标记
 * @param options
 * @constructor
 */
function DrawPaper(options) {
  let defaults = {
    /**
     * 绘图工具
     */
    tools: ['right', 'wrong', 'RULE-LINE', 'ask', 'square', 'circle', 'line', 'dash', 'pencil', 'RULE-LINE', 'undo', 'redo', 'restore', 'RULE-LINE'],
    /**
     * 绘图背景
     * @cfg {Object}
     */
    resource: {
      data: ''
    },
    /**
     * 父容器
     * @cfg {String} [wrapper="body"]
     */
    wrapper: 'body',
    /**
     * 绘图组件id
     * @cfg {String} [id = new Date().getTime()]
     */
    id: new Date().getTime(),
    /**
     * 点击动作回调
     * @event onClickAction
     */
    onClickAction: function () {}
  };

  let $drawContainer, drawPaperBg;
  let $drawPaper, paperContext;
  let $drawPaperCover, paperCoverContext;
  let $container, $tool;
  let paperWidth, paperHeight;
  let counter = {
    past: [],
    present: null,
    future: []
  };
  let drawTool, drawingColor, drawColor, drawSize;
  let drawTools = ['right', 'wrong', 'ask', 'square', 'circle', 'line', 'dash', 'pencil'];
  let actionTools = ['undo', 'redo', 'restore'];
  let styleTools = ['RULE-LINE'];
  let drawFlag;
  let startX, startY;

  let toolItems = {
    'right': {
      name: '打勾',
      tool: 'right',
      className: 'icon icon-tick'
    },
    'wrong': {
      name: '打叉',
      tool: 'wrong',
      className: 'icon icon-cross'
    },
    'ask': {
      name: '问号',
      tool: 'ask',
      className: 'icon icon-question'
    },
    'square': {
      name: '方形',
      tool: 'square',
      className: 'icon icon-square'
    },
    'circle': {
      name: '圆形',
      tool: 'circle',
      className: 'icon icon-circle'
    },
    'line': {
      name: '直线',
      tool: 'line',
      className: 'icon icon-line'
    },
    'dash': {
      name: '虚线',
      tool: 'dash',
      className: 'icon icon-dotted'
    },
    'pencil': {
      name: '铅笔',
      tool: 'pencil',
      className: 'icon icon-pencil'
    },
    'undo': {
      name: '撤销',
      tool: 'undo',
      className: 'icon icon-revoke'
    },
    'redo': {
      name: '重做',
      tool: 'redo',
      className: 'icon icon-redo'
    },
    'restore': {
      name: '清除',
      tool: 'restore',
      className: 'icon icon-clean'
    },
    'download': {
      name: '下载',
      tool: 'download',
      className: 'icon icon-down'
    },
    'RULE-LINE': {
      name: '分隔线',
      tool: 'RULE-LINE'
    }
  };

  /**
   * 组件初始化
   * @private
   * @template
   */
  function _init() {
    defaults = $.extend({}, defaults, options);
    counter.past = ['data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQImWNgYGBgAAAABQABh6FO1AAAAABJRU5ErkJggg=='];
    counter.present = counter.past[0];
    drawTool = defaults.tools[0];
    drawingColor = '#FF0000';
    drawColor = '#FF0000';
    drawSize = 1;
    drawFlag = false;

    _renderDOM();
    _initDrawPaper();
    _initTools();
    _attachEvent();
  }

  /**
   * 画布初始化
   * @private
   */
  function _initDrawPaper() {
    paperContext = $drawPaper.get(0).getContext('2d');
    paperCoverContext = $drawPaperCover.get(0).getContext('2d');

    drawPaperBg = new Image();
    drawPaperBg.src = counter.past[0] = defaults.resource.data;
    drawPaperBg.onload = function () {
      paperWidth = drawPaperBg.width;
      paperHeight = drawPaperBg.height;
      $drawPaper.attr({
        'width': paperWidth,
        'height': paperHeight
      });
      $drawPaperCover.attr({
        'width': paperWidth,
        'height': paperHeight
      });
      paperContext.drawImage(drawPaperBg, 0, 0);
    };
  }

  /**
   * 工具初始化
   * @private
   */
  function _initTools() {
    let toolTemplate = '<li data-tool="${tools}"><div class="${type}"><span class="${className}"></div><p>${name}</p></li>';
    let styleTemplate = '<li data-tool="${tools}"></li>';
    let toolsStr = '';

    $tool = $drawContainer.find('[data-node="tool"]').find('ul.tools-item');

    $.each(defaults.tools, function (i) {
      let type;

      if (drawTools.indexOf(toolItems[defaults.tools[i]].tool) > -1) {
        type = 'tools';
      } else if (actionTools.indexOf(toolItems[defaults.tools[i]].tool) > -1) {
        type = 'operating';
      } else if (styleTools.indexOf(toolItems[defaults.tools[i]].tool) > -1) {
        type = 'style';
      }

      switch (defaults.tools[i]) {
        default:
          if (type === 'style') {
            toolsStr += styleTemplate.replace(/\$\{tools}/g, toolItems[defaults.tools[i]].tool);
          } else {
            toolsStr += toolTemplate.replace(/\$\{className}/g, toolItems[defaults.tools[i]].className)
              .replace(/\$\{name}/g, toolItems[defaults.tools[i]].name)
              .replace(/\$\{tools}/g, toolItems[defaults.tools[i]].tool)
              .replace(/\$\{type}/g, type);
          }
      }
    });

    $tool.append(toolsStr);
    $tool.find('[data-tool="download"]').html('<a href="#" download="picture.png" id="downloadImage_a">' + $tool.find('[data-tool="download"]').html() + '</a>')
  }

  /**
   * 渲染组件DOM
   * @private
   */
  function _renderDOM() {
    $drawContainer = $('<div class="draw-container">' +
      '<div data-node="tool" class="draw-tools border-top-0"><ul class="tools-item"></ul></div>' +
      '<div data-node="container" class="draw-paper"></div>' +
      '</div>').attr('id', 'drawContainer-' + defaults.id);
    $drawPaper = $('<canvas class="draw-paper-canvas">您的浏览器不支持绘图哦，亲</canvas>').attr('id', 'drawPaper-' + defaults.id);
    $drawPaperCover = $('<canvas class="draw-paper-canvas"></canvas>').attr('id', 'drawPaperCover-' + defaults.id);

    $(defaults.wrapper).append($drawContainer);

    $container = $drawContainer.find('[data-node="container"]');
    $container.append($drawPaper);
    $container.append($drawPaperCover);
  }

  /**
   * 事件绑定
   * @private
   * @template
   */
  function _attachEvent() {
    $drawPaperCover.bind('mousedown', _beginDraw);
    $drawPaperCover.bind('mousemove', _drawing);
    $drawPaperCover.bind('mouseup', _finishDraw);
    $drawPaperCover.bind('mouseout', _pauseDraw);
    $drawPaperCover.bind('click', _clickDraw);

    $tool.on('click', 'li', _selectTool);
  }

  /**
   * 选择绘图工具
   */
  function _selectTool() {
    paperContext.strokeStyle = drawColor;
    paperCoverContext.strokeStyle = drawingColor;
    paperCoverContext.lineWidth = drawSize;

    if (drawTools.indexOf($(this).attr('data-tool')) > -1) {
      $(this).addClass('on').siblings().removeClass('on');
      drawTool = $(this).attr('data-tool');
      return true;
    }

    switch ($(this).attr('data-tool')) {
      case 'undo':
        _undo();
        break;
      case 'redo':
        _redo();
        break;
      case 'restore':
        _restoreDraw();
        break;
      case 'save':
        _saveDraw();
        break;
      case 'download':
        _downloadDraw();
        break;
    }
  }

  /**
   * 单击绘图
   * @private
   */
  function _clickDraw(event) {
    let x = event.offsetX;
    let y = event.offsetY;

    if (drawTool === 'right') {
      _drawRight(x, y);
    } else if (drawTool === 'wrong') {
      _drawWrong(x, y)
    } else if (drawTool === 'ask') {
      _drawAsk(x, y);
    }
  }

  /**
   * 开始绘图
   * @param {Object} event
   * @private
   */
  function _beginDraw(event) {
    if (drawTool === 'right' || drawTool === 'wrong' || drawTool === 'ask') {
      return;
    }

    if (drawTool === 'dash') {
      paperCoverContext.setLineDash([5]);
    } else {
      paperCoverContext.setLineDash([]);
    }

    startX = event.offsetX;
    startY = event.offsetY;
    paperCoverContext.moveTo(startX, startY);

    drawFlag = true;

    paperCoverContext.strokeStyle = drawingColor;

    if (drawTool === 'pencil') {
      paperCoverContext.beginPath();
    } else if (drawTool === 'circle') {
      paperContext.beginPath();
      paperContext.moveTo(startX, startY);
      paperContext.lineTo(startX, startY);
      paperContext.stroke();
    }
  }

  /**
   * 完成绘图
   * @private
   */
  function _finishDraw() {
    if (drawTool === 'right' || drawTool === 'wrong' || drawTool === 'ask') {
      return;
    }

    let image = new Image();

    drawFlag = false;

    _clearDrawingRect();
    paperCoverContext.strokeStyle = drawColor;
    paperCoverContext.stroke();
    image.src = $drawPaperCover.get(0).toDataURL();
    image.onload = function () {
      paperContext.drawImage(image, 0, 0, image.width, image.height, 0, 0, paperWidth, paperHeight);
      _clearDrawingRect();
      _saveHistory();
    };
  }

  /**
   * 正在绘图
   * @param {Object} event
   */
  function _drawing(event) {
    let x = event.offsetX;
    let y = event.offsetY;

    switch (drawTool) {
      case 'square':
        _drawSquare(x, y);
        break;
      case 'line':
        _drawLine(x, y);
        break;
      case 'dash':
        _drawLine(x, y);
        break;
      case 'pencil':
        _drawPencil(x, y);
        break;
      case 'circle':
        _drawCircle(x, y);
        break;
    }
  }

  /**
   * 暂停绘图
   */
  function _pauseDraw() {
    _clearDrawingRect();
  }

  /**
   * 清空绘图过程中的矩形
   * @param {String} [type]
   */
  function _clearDrawingRect(type) {
    if (!type) {
      paperCoverContext.clearRect(0, 0, paperWidth, paperHeight);
    } else {
      counter.past = [defaults.resource.data];
      counter.present = counter.past[0];
      paperContext.clearRect(0, 0, paperWidth, paperHeight);
      paperCoverContext.clearRect(0, 0, paperWidth, paperHeight);
      paperContext.drawImage(drawPaperBg, 0, 0);
    }
  }

  /**
   * 保存历史
   */
  function _saveHistory() {
    let dataUrl = $drawPaper.get(0).toDataURL();

    counter.present = dataUrl;
    counter.past.push(dataUrl);
  }

  /**
   * 画√号
   * @param {Number} x
   * @param {Number} y
   * @private
   */
  function _drawRight(x, y) {
    let image = new Image();

    image.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAMAAAAM7l6QAAAAYFBMVEUAAAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAB7GhyrAAAAH3RSTlMApgb7mCO6slxNEgr25NvUyZWJhHhsQBzp5uC+rKubA0/4MAAAAIlJREFUKM/dz8kWgjAMheGbWIqKqAzOQ97/LSUaz6FKYM+3aHvyL9pidrLLcqyWsli59XQVkbNbt13dHJ263k3V5OYsFL26/62lRIYp3rX/K31IzlZv0kn+3OqEoDjq+YBE8+2cW03VOg3AQ/cWf4LOK9K1wYCnmBqD6FMrOO52v0NfTfBxJMzHC2yPDM4fgkK/AAAAAElFTkSuQmCC';
    image.onload = function () {
      paperContext.drawImage(image, x - (image.width / 2), y - (image.height / 2), image.width, image.height);
      _saveHistory();
    };
  }

  /**
   * 画×号
   * @param {Number} x
   * @param {Number} y
   * @private
   */
  function _drawWrong(x, y) {
    let image = new Image();

    image.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeBAMAAADJHrORAAAAG1BMVEUAAAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AABj0tIdAAAACHRSTlMA5CQtz+tIy1rrYxQAAABgSURBVBjTY6ABMFEAUyoGEC5zhBCIYpIIhvBZOhpBChQ7WoAkWKJDCEpCgCJQAYRAKIBIIxQkgqURCjrA0ggFIGkEYOvoaGPAlMfUj2k+pv0I92F3Pzvcf+j+xwgf2gMAsNAgtDuwricAAAAASUVORK5CYII=';
    image.onload = function () {
      paperContext.drawImage(image, x - (image.width / 2), y - (image.height / 2), image.width, image.height);
      _saveHistory();
    };
  }

  /**
   * 画?号
   * @param {Number} x
   * @param {Number} y
   * @private
   */
  function _drawAsk(x, y) {
    let image = new Image();

    image.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAMAAAAM7l6QAAAAbFBMVEUAAAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AACxLS5TAAAAI3RSTlMA+t4HMA3q5qeikHQ6JhTyy7ixmY1RLRji1tTFvpiKXUIdF7czAAoAAACbSURBVCjPzc7HDoMwEARQGzeCTQstvc3//2PsJEKK7OXAiTmt9LSjYRuJ7DKO+mxVUnv8ko0J7TBHvyJ14W1QwjUAioh3AC/DUdVAFvEBaL/XHkDEfK7MUyylnD6H0v/l8QgUFIpQrSdKwy4zLjWfnpQOXhtFzmo9l/RqA1wYHQ5c2eq4m61ofQA4CpJ7LC63XjndLnJu7mwreQP+ng3iEhoecQAAAABJRU5ErkJggg==';
    image.onload = function () {
      paperContext.drawImage(image, x - (image.width / 2), y - (image.height / 2), image.width, image.height);
      _saveHistory();
    };
  }

  /**
   * 画方形
   * @param {Number} x
   * @param {Number} y
   * @private
   */
  function _drawSquare(x, y) {
    _clearDrawingRect();

    if (drawFlag) {
      paperCoverContext.beginPath();
      paperCoverContext.moveTo(startX - 0.5, startY - 0.5);
      paperCoverContext.lineTo(x - 0.5, startY - 0.5);
      paperCoverContext.lineTo(x - 0.5, y - 0.5);
      paperCoverContext.lineTo(startX - 0.5, y - 0.5);
      paperCoverContext.lineTo(startX - 0.5, startY - 0.5);
      paperCoverContext.stroke();
    }
  }

  /**
   * 画圆形
   * @param {Number} x
   * @param {Number} y
   * @private
   */
  function _drawCircle(x, y) {
    _clearDrawingRect();

    if (drawFlag) {
      paperCoverContext.beginPath();
      let radii = Math.sqrt((startX - x) * (startX - x) + (startY - y) * (startY - y));
      paperCoverContext.arc(startX, startY, radii, 0, Math.PI * 2, false);
      paperCoverContext.stroke();
    } else {
      paperCoverContext.beginPath();
      paperCoverContext.arc(x, y, 20, 0, Math.PI * 2, false);
      paperCoverContext.stroke();
    }
  }

  /**
   * 画直线
   * @param {Number} x
   * @param {Number} y
   * @private
   */
  function _drawLine(x, y) {
    if (drawFlag) {
      _clearDrawingRect();
      paperCoverContext.beginPath();
      paperCoverContext.moveTo(startX, startY);
      paperCoverContext.lineTo(x, y);
      paperCoverContext.stroke();
    }
  }

  /**
   * 画铅笔
   * @param {Number} x
   * @param {Number} y
   * @private
   */
  function _drawPencil(x, y) {
    if (drawFlag) {
      _clearDrawingRect();
      paperCoverContext.lineTo(x, y);
      paperCoverContext.stroke();
    }
  }

  /**
   * 撤销上一个操作
   * @private
   */
  function _undo() {
    let image = new Image();
    let previous;
    let newPast;

    if (counter.past.length > 1) {
      paperContext.clearRect(0, 0, paperWidth, paperHeight);
      previous = counter.past[counter.past.length - 1];
      newPast = counter.past.slice(0, counter.past.length - 1);
      counter.past = newPast;
      counter.present = newPast[counter.past.length - 1];
      counter.future.unshift(previous);
      image.src = counter.present;
      image.onload = function () {
        paperContext.drawImage(image, 0, 0);
        defaults.onClickAction && defaults.onClickAction('success', '撤销');
      };
      image.onerror = function () {
        defaults.onClickAction && defaults.onClickAction('fail', '撤销');
      };
    }
  }

  /**
   * 重做上一个操作
   * @private
   */
  function _redo() {
    let image = new Image();
    let next;
    let newFuture;

    if (counter.future.length > 0) {
      paperContext.clearRect(0, 0, paperWidth, paperHeight);
      next = counter.future[0];
      newFuture = counter.future.slice(1);
      counter.past.push(next);
      counter.present = next;
      counter.future = newFuture;
      image.src = counter.present;
      image.onload = function () {
        paperContext.drawImage(image, 0, 0);
        defaults.onClickAction && defaults.onClickAction('success', '重做');
      };
      image.onerror = function () {
        defaults.onClickAction && defaults.onClickAction('fail', '重做');
      };
    }
  }

  /**
   * 重置绘图
   * @private
   */
  function _restoreDraw() {
    _clearDrawingRect('all');
    defaults.onClickAction && defaults.onClickAction('success', '重置');
  }

  /**
   * 保存绘图
   * @private
   */
  function _saveDraw() {
    _downloadDraw();
    defaults.onClickAction && defaults.onClickAction('success', '保存');
  }

  /**
   * 下载绘图
   * @private
   */
  function _downloadDraw() {
    let $download = $("#downloadImage_a");

    $download.attr('href', $drawPaper.get(0).toDataURL());
  }

  /**
   * 初始化（选中默认工具）
   * @template
   */
  this.init = function () {
    $tool.children().first().click();
  };

  /**
   * 重新装载
   * @param {String} data
   */
  this.reload = function (data) {
    defaults.resource.data = data;
    _initDrawPaper();
  };

  /**
   * 清除绘图标记
   */
  this.cleanDraw = function () {
    _restoreDraw();
  };

  /**
   * 获取绘图结果
   * @return {String}
   */
  this.getDrawData = function () {
    return $drawPaper.get(0).toDataURL();
  };

  _init();
}

export default DrawPaper;
