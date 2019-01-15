import request from '../../utils/request';
import cookie from '../../utils/cookie';

const API = cookie.get('ApiHost') === 'undefined' ? 'http://localhost:3000' : cookie.get('ApiHost');

/**
 * 获取阅卷任务列表
 * @param params
 * @return {Promise.<Object>}
 */
export async function getMarkingTasksList(params) {
  return request({
    url: API + '/markingTask/getMarkingTasksList',
    method: "POST",
    data: params.payload
  });
}

/**
 * 查看判卷任务数据
 * @param params
 * @return {Promise.<Object>}
 */
export async function getMarkingTasksData(params) {
  return request({
    url: API + '/markingTask/getMarkingTasksData',
    method: "POST",
    data: params.payload
  });
}

/**
 * 获取题目信息（正常判分）
 * @param params
 * @return {Promise.<Object>}
 */
export async function getQuestionInformation(params) {
  return request({
    url: API + '/question/getQuestionInformation',
    method: "POST",
    data: params.payload
  });
}

/**
 * 提交题目数据（正常判分）
 * @param params
 * @return {Promise.<Object>}
 */
export async function submitQuestionData(params) {
  return request({
    url: API + '/question/submitQuestionData',
    method: "POST",
    data: params.payload
  });
}

/**
 * 设置为问题试题
 * @param params
 * @return {Promise.<Object>}
 */
export async function setAsQuestionTest(params) {
  return request({
    url: API + '/question/setAsQuestionTest',
    method: "POST",
    data: params.payload
  });
}
/**
 * 查看题目信息
 * @param params
 * @return {Promise.<Object>}
 */
export async function viewQuestionInformation(params) {
  return request({
    url: API + '/question/viewQuestionInformation',
    method: "POST",
    data: params.payload
  });
}
