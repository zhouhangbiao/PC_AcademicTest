const fs = require('fs');

const express = require('express'),
  timeout = require('connect-timeout'),
  app = express();

const API = {
  markPaperSystem: {
    common: require('./api/markPaperSystem/common'),
    task: require('./api/markPaperSystem/task'),
    arbitration: require('./api/markPaperSystem/arbitration'),
    history: require('./api/markPaperSystem/history'),
  }
};

const PORT = '3000',
  TIME_OUT = 30 * 1e3;

app.set('port', PORT);

app.use(timeout(TIME_OUT));
app.use((req, res, next) => {
  if (!req.timedout) next();
});

// 设置跨域访问
app.all('*', function(req, res, next) {
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Origin', 'http://localhost:8080');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With');
  res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');
  res.header("Content-Type", "application/x-www-form-urlencoded; charset=utf-8");
  next();
});
// 登录秘钥
app.post('/login/getSecretKey', API.markPaperSystem.common.getSecretKey);
// 用户登出
app.post('/login/logout', API.markPaperSystem.common.logout);
// 用户登录
app.post('/login/login', API.markPaperSystem.common.login);
// 修改密码
app.post('/login/changePassWord', API.markPaperSystem.common.changePassWord);
// 获取帮助信息
app.post('/assistance/getAssistance', API.markPaperSystem.common.getAssistance);
// 查看给分点
app.post('/scoringPoint/viewScoringPoint', API.markPaperSystem.common.viewScoringPoint);
// 获取阅卷任务列表
app.post('/markingTask/getMarkingTasksList', API.markPaperSystem.task.getMarkingTasksList);
// 查看阅卷任务数据
app.post('/markingTask/getMarkingTasksData', API.markPaperSystem.task.getMarkingTasksData);
// 查看题目信息
app.post('/question/viewQuestionInformation', API.markPaperSystem.task.viewQuestionInformation);
// 查询仲裁任务列表
app.post('/markingTask/getArbitrationTaskList', API.markPaperSystem.arbitration.getArbitrationTaskList);
// 查询判卷历史列表
app.post('/markingTask/getJudgingHistoryList', API.markPaperSystem.history.getJudgingHistoryList);
// 获取题目信息（正常判分）
app.post('/question/getQuestionInformation', API.markPaperSystem.task.getQuestionInformation);
// 提交题目数据（正常判分）
app.post('/question/submitQuestionData', API.markPaperSystem.task.submitQuestionData);
// 设置为问题试题
app.post('/question/setAsQuestionTest', API.markPaperSystem.task.setAsQuestionTest);
// 查看已仲裁题目
app.post('/question/viewArbitratedQuestions', API.markPaperSystem.arbitration.viewArbitratedQuestions);
// 获取题目信息（仲裁判分）
app.post('/question/getArbitratedQuestionInformation', API.markPaperSystem.arbitration.getArbitratedQuestionInformation);
// 提交题目数据（仲裁判分）
app.post('/question/submitArbitratedQuestionData', API.markPaperSystem.arbitration.submitArbitratedQuestionData);
// 查看判分标记（一评、二评）
app.post('/scoringMark/viewScoringMark', API.markPaperSystem.common.viewScoringMark);
// 查看题目题干
app.post('/question/viewQuestion', API.markPaperSystem.common.viewQuestion);
// 查看已判分题目
app.post('/question/viewMarkedQuestions', API.markPaperSystem.history.viewMarkedQuestions);
// 获取题目信息（回评判分）
app.post('/question/getReviewedQuestionData', API.markPaperSystem.history.getReviewedQuestionData);
// 提交题目数据（回评判分）
app.post('/question/submitReviewedQuestionData', API.markPaperSystem.history.submitReviewedQuestionData);

app.listen(app.get('port'), () => {
  console.log(`server running @ ${app.get('port')} port`);
});

