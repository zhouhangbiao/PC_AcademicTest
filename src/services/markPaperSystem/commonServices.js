import request from '../../utils/request';
import cookie from '../../utils/cookie';

const API = cookie.get('ApiHost') === 'undefined' ? 'http://localhost:3000' : cookie.get('ApiHost');

/**
 * 登录秘钥
 * @param params
 * @return {Promise.<Object>}
 */
export async function getSecretKey(params) {
  return request({
    url: API + '/login/getSecretKey',
    method: "POST",
    data: params.payload
  });
}
/**
 * 用户登出
 * @param params
 * @return {Promise.<Object>}
 */
export async function logout(params) {
  return request({
    url: API + '/login/logout',
    method: "POST"
  });
}
/**
 * 用户登录
 * @param params
 * @return {Promise.<Object>}
 */
export async function login(params) {
  return request({
    url: API + '/login/login',
    method: "POST",
    data: params.payload
  });
}
/**
 * 修改密码
 * @param params
 * @return {Promise.<Object>}
 */
export async function changePassWord(params) {
  return request({
    url: API + '/login/changePassWord',
    method: "POST",
    data: params.payload
  });
}
/**
 * 查看帮助
 * @param params
 * @return {Promise.<Object>}
 */
export async function getAssistance(params) {
  return request({
    url: API + '/assistance/getAssistance',
    method: "POST"
  });
}
/**
 * 查看给分点
 * @param params
 * @return {Promise.<Object>}
 */
export async function viewScoringPoint(params) {
  return request({
    url: API + '/scoringPoint/viewScoringPoint',
    method: "POST",
    data: params.payload
  });
}
/**
 * 查看判分标记（一评、二评）
 * @param params
 * @return {Promise.<Object>}
 */

export async function viewScoringMark(params) {
  return request({
    url: API + '/scoringMark/viewScoringMark',
    method: "POST",
    data: params.payload
  });
}

/**
 * 查看题目题干
 * @param params
 * @return {Promise.<Object>}
 */
export async function viewQuestion(params) {
  return request({
    url: API + '/question/viewQuestion',
    method: "POST",
    data: params.payload
  });
}
