import $ from 'jQuery';
import style from './DataNull.css'

/**
 * 空提示组件
 * @param options{Object}
 * @constructor
 */
function DataNull(options) {
  let defaults = {
    /**
     * @cfg {String} tipText
     * 空数据提示文本
     */
    tipsText: '',
    /**
     * @cfg {String} [wrapper="body"]
     * 父容器
     */
    wrapper: 'body',
    /**
     * @cfg {String} [id="dataNull-" + new Date().getTime()]
     * 组件唯一标识
     */
    id: 'dataNull-' + new Date().getTime()
  };

  function _init() {
    defaults = $.extend({}, defaults, options);
    _renderDom();
  }

  /**
   * 渲染Dom
   * @private
   */
  function _renderDom() {
    let tipsDom = defaults.tipsText ? '<h2 class="tips text-c pre-h2">${text}</h2>' : '';

    tipsDom = tipsDom.replace(/\$\{text}/g, defaults.tipsText);

    let template = '<div id=' + defaults.id + ' class="data-null-page" style="display: none;">' +
      ' <div class="display-table">' +
      '   <div class="display-table-cell v-align-m">' +
      '     <div class="data-null-img"></div>' +
            tipsDom +
      '   </div>' +
      ' </div>' +
      '</div>';

    $(defaults.wrapper).append($(template));
  }

  /**
   * 显示空数据
   */
  this.show = function () {
    $('#' + defaults.id).show();
  };

  /**
   * 隐藏空数据
   */
  this.hide = function () {
    $('#' + defaults.id).hide();
  };

  _init()
}
export default DataNull;
