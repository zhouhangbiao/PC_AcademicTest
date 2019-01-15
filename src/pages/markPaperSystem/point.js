import $ from 'jQuery';
import cookie from '../../utils/cookie';
import style from './point.css';
import UrlHelper from 'js-url-helper';
import * as service from '../../services/markPaperSystem/commonServices';

let urlHelper = new UrlHelper(location);
let query = urlHelper.getSearchParam();

(function () {
  "use strict";
  /*------------------------------- VARIABLES ----------------------------------*/
  let configMap = {};
  let stateMap = {};
  let domMap = {};
  /*************** dom method *******************/
  let setDomMap, renderDOM;
  /*************** event method *******************/
  let attachEvent, scoringPoint;
  /*************** public method *******************/
  let init, showSamplepic, scoringPointTable;
  /*------------------------------- END VARIABLES ----------------------------------*/

  /*------------------------------- DOM ----------------------------------*/
  /**
   * setDomMap
   * 缓存DOM集合
   */
  setDomMap = function () {
    domMap = {
      $SamplePicture: $(".SamplePicture"),
      $QuestionIndex: $(".QuestionIndex"),
      $tbody: $(".tbody"),
      $SampleTitleTr: $(".SampleTitleTr"),
      $SampleInformationsul: $(".SampleInformations ul"),
    }
  };

  /**
   * renderDOM
   * 渲染DOM数据
   */
  renderDOM = function () {};

  /*------------------------------- END DOM ----------------------------------*/

  /*------------------------------- EVENT ----------------------------------*/
  /**
   * attachEvent
   * 初始化所有事件绑定
   */
  attachEvent = function () {

  };

  /**
   * 显示样卷
   */
  showSamplepic = function (data) {
    let Samplepic = data.ReturnEntity.SampleInformations;
    Samplepic.map((item, index) => {
      let image = new Image();
      image.src = item.SamplePicture;
      image.id = "num" + item.SampleNumber;
      image.onload = function () {
        domMap.$SamplePicture.append(image);
        if (index == 0) {
          $("#num" + item.SampleNumber).attr({
            "class": "active"
          })
        }
      }
    });
  }
  /**
   * 得分点表格
   */
  scoringPointTable = function (data) {
    let ScoringPoints = data.ReturnEntity.ScoringPoints;
    ScoringPoints.map((item, index) => {
      let SamplePointInformations = item.SamplePointInformations;
      let pointlist = '';
      SamplePointInformations.map((item) => {
        if (item.SamplePointScore === null) {
          item.SamplePointScore = "无"
        }
        pointlist += '<td><p><span>' + item.SamplePointScore + '</span></p></td>'
      });
      if (ScoringPoints[index].HighestScore === null) {
        ScoringPoints[index].HighestScore = "无"
      }
      if (ScoringPoints[index].StepLength === null) {
        ScoringPoints[index].StepLength = "无"
      }

      domMap.$tbody.append("<tr class='SampleTitleTr '><td> <p><span>" + ScoringPoints[index].ScoringPointNumber +
        "</span></p></td><td><p class='p140'><span>" + ScoringPoints[index].ScoringPointDescription +
        "</span></p></td><td><p><span>" + ScoringPoints[index].HighestScore +
        "</span></p></td><td><p><span>" + ScoringPoints[index].StepLength +
        "</span></p></td>" + pointlist + "</tr>")
    });
  }
  /**
   * 渲染得分点列表
   */
  scoringPoint = function () {
    service.viewScoringPoint({
      payload: {
        "TaskId": query.taskId
      }
    }).then(function (data) {

      domMap.$QuestionIndex.text("第" + data.ReturnEntity.QuestionIndex + "题给分点");
      let SampleInformations = data.ReturnEntity.SampleInformations
      SampleInformations.map((item, index) => {
        domMap.$SampleTitleTr.append("<td><p ><span>" + item.SampleName + "</span></p></td>")
        if (index == 0) {
          domMap.$SampleInformationsul.append("<li role='presentation' class='active'><a class='ellipsis' href='#num" + item.SampleNumber + "'aria-controls='num" + item.SampleNumber + "'role='tab'  data-toggle='tab'  >" + item.SampleName + "</a></li>");
        } else {
          domMap.$SampleInformationsul.append("<li role='presentation'><a class='ellipsis' href='#num" + item.SampleNumber + "'aria-controls='num" + item.SampleNumber + "'role='tab' data-toggle='tab'>" + item.SampleName + "</a></li>");
        }
      });
      scoringPointTable(data)
      showSamplepic(data)
    })
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
      scoringPoint();

    });

  };
  /*------------------------------- END PUBLIC ----------------------------------*/

  init();
})();
