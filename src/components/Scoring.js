import $ from 'jQuery';
import style from './Scoring.css';

/**
 * 试卷评分
 * @param options
 * @constructor
 */
function Scoring(options) {
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
      data: []
    },
    /**
     * 绘图组件id
     * @cfg {String} [id = new Date().getTime()]
     */
    id: new Date().getTime(),
    /**
     * 点击重置回调
     * @event onClickReset
     */
    onClickReset: function () {},
    /**
     * 点击提交回调
     * @event onClickReset
     * @param {Object} scores 评分对象
     */
    onClickSubmit: function (scores) {}
  };

  let $form, $tbody;

  /**
   * 组件初始化
   * @private
   * @template
   */
  function _init() {
    defaults = $.extend({}, defaults, options);

    _renderDOM();
    _renderItem();
    _attachEvent();
  }

  /**
   * 渲染组件DOM
   * @private
   */
  function _renderDOM() {
    let template = '<form id="${id}">'+
      '  <table class="table-bordered scoring-table">'+
      '    <thead>'+
      '      <tr>'+
      '        <th width="66">给分点</th>'+
      '        <th width="76">分数</th>'+
      '        <th>操作</th>'+
      '      </tr>'+
      '    </thead>'+
      '    <tbody></tbody>'+
      '  </table>'+
      '  <div class="text-center btn-groups">'+
      '    <input type="reset" class="btn btn-pre-default btn-pre-m" value="重置">'+
      '    <input type="submit" class="btn btn-primary btn-pre-m" value="提交">'+
      '  </div>'+
      '</form>';

    $(defaults.wrapper).html(template.replace(/\$\{id}/, 'scoring-' + defaults.id));
    $form = $('#scoring-' + defaults.id);
    $tbody = $form.find('tbody');
  }

  /**
   * 渲染给分项
   * @private
   */
  function _renderItem() {
    let template = '<tr data-id="${id}">'+
      '  <td class="text-center">${SN} (${full}分)</td>'+
      '  <td class="text-center"><input type="number" placeholder="请输入分值" min="0" max="${full}" step="0.5" required="required" class="scoring-value" value="${score}"></td>'+
      '  <td class="text-center">'+
      '    <button class="btn btn-primary btn-pre-xs score-full">满</button>'+
      '    <button class="btn btn-warning btn-pre-xs score-zero">0</button>'+
      '  </td>'+
      '</tr>';
    let str = '';

    $.each(defaults.resource.data, function () {
      let score = this.Score === '' ? '' : this.Score;

      str += template.replace(/\$\{id}/g, this.PointId)
        .replace(/\$\{SN}/g, this.PointNumber)
        .replace(/\$\{full}/g, this.FullPoint)
        .replace(/\$\{score}/g, score);
    });

    $tbody.html('').html(str);
  }

  /**
   * 校验评分数据
   * @private
   */
  function _validateScores() {
    $tbody.find('tr').each(function () {
      let $this = $(this);
      let rule = {
        "min": $this.find('input').attr('min') * 1,
        "max": $this.find('input').attr('max') * 1,
        "required": $this.find('input').attr('required')
      };
      let value = $this.find('input').val();

      if (rule["required"] === "required" && $.trim(value) === "") {
        layer.msg('分数不能为空');
        return false;
      }
      if (value * 1 < rule["min"]) {
        layer.msg('分数不能小于最小值 ' + rule["min"]);
        return false;
      }
      if (value * 1 > rule["max"]) {
        layer.msg('分数不能大于最大值 ' + rule["max"]);
        return false;
      }
      if (!(/\.5$|\.0$|^\d*$/.test(value))) {
        layer.msg('给分步长为 0.5');
        return false;
      }
    });
  }

  /**
   * 获取评分数据
   * @private
   * @return {Object}
   */
  function _getScores() {
    let scores = [];

    $tbody.find('tr').each(function (i) {
      let $this = $(this);

      scores.push({
        "PointNumber": i + 1,
        "PointId": $this.attr('data-id'),
        "FullPoint": $this.find('input').attr('max'),
        "Score": $this.find('input').val()
      });
    });

   return scores;
  }

  /**
   * 事件绑定
   * @private
   * @template
   */
  function _attachEvent() {
    $tbody.on('click', 'button.score-full', _onClickFull);
    $tbody.on('click', 'button.score-zero', _onClickZero);

    $form.on('click', 'input[type="submit"]', _validateScores);
    $form.bind('submit', _onSubmitForm);
    $form.bind('reset', _onResetForm);
  }

  /**
   * 点击满分
   * @private
   */
  function _onClickFull(event) {
    let $input = $(this).parent().prev().find('input');
    let full = $input.attr('max');

    $input.val(full);
    event.preventDefault();
  }

  /**
   * 点击0分
   * @private
   */
  function _onClickZero(event) {
    let $input = $(this).parent().prev().find('input');

    $input.val(0);
    event.preventDefault();
  }

  /**
   * 提交表单
   * @param event
   * @private
   */
  function _onSubmitForm(event) {
    let scores = _getScores();

    defaults.onClickSubmit && defaults.onClickSubmit(scores);
    event.preventDefault();
  }

  /**
   * 重置表单
   * @private
   */
  function _onResetForm(event) {
    defaults.onClickReset && defaults.onClickReset();
    event.preventDefault();
  }

  /**
   * 重新装载
   * @param {Object} data
   */
  this.reload = function (data) {
    defaults.resource.data = data;
    _renderItem();
  };

  /**
   * 清除得分
   */
  this.cleanScore = function () {
    $tbody.find('input[type="number"]').each(function () {
      this.value = '';
    });
  };

  _init();
}

export default Scoring;
