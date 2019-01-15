import request from '../../utils/request';
import cookie from '../../utils/cookie';

const API = cookie.get('ApiHost') === 'undefined' ? 'http://localhost:3000' : cookie.get('ApiHost');

/**
 * 查看已判分题目
 * @param params
 * @return {Promise.<Object>}
 */
export async function viewMarkedQuestions(params) {
  return request({
    url: API + '/question/viewMarkedQuestions',
    method: "POST",
    data: params.payload
  });
}

/**
 * 获取题目信息（回评判分）
 * @param params
 * @return {Promise.<Object>}
 */
export async function getReviewedQuestionData(params) {
  return request({
    url: API + '/question/getReviewedQuestionData',
    method: "POST",
    data: params.payload
  });
}

/**
 * 提交题目数据（回评判分）
 * @param params
 * @return {Promise.<Object>}
 */
export async function submitReviewedQuestionData(params) {
  return request({
    url: API + '/question/submitReviewedQuestionData',
    method: "POST",
    data: params.payload
  });
}

/**
 * 查询判卷历史列表
 * @param params
 * @return {Promise.<Object>}
 */
export async function getJudgingHistoryList(params) {
  return request({
    url: API + '/markingTask/getJudgingHistoryList',
    method: "POST",
    data: params.payload
  });
}
