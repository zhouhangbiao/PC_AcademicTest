import request from '../../utils/request';
import cookie from '../../utils/cookie';

const API = cookie.get('ApiHost') === 'undefined' ? 'http://localhost:3000' : cookie.get('ApiHost');

/**
 * 查看已仲裁题目
 * @param params
 * @return {Promise.<Object>}
 */
export async function viewArbitratedQuestions(params) {
  return request({
    url: API + '/question/viewArbitratedQuestions',
    method: "POST",
    data: params.payload
  });
}

/**
 * 获取题目信息（仲裁判分）
 * @param params
 * @return {Promise.<Object>}
 */
export async function getArbitratedQuestionInformation(params) {
  return request({
    url: API + '/question/getArbitratedQuestionInformation',
    method: "POST",
    data: params.payload
  });
}

/**
 * 提交题目数据（仲裁判分）
 * @param params
 * @return {Promise.<Object>}
 */
export async function submitArbitratedQuestionData(params) {
  return request({
    url: API + '/question/submitArbitratedQuestionData',
    method: "POST",
    data: params.payload
  });
}
/**
 * 查询仲裁任务列表
 * @param params
 * @return {Promise.<Object>}
 */
export async function getArbitrationTaskList(params) {
  return request({
    url: API + '/markingTask/getArbitrationTaskList',
    method: "POST",
    data: params.payload
  });
}
