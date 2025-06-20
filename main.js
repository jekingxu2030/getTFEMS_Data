const EMSLoginPlugin = require('./ems-login-plugin');

// 配置登录信息
const LOGIN_URL = 'https://ems.thefit.com.cn/Account/Login';
const USERNAME = 'wd002'; // 替换为实际用户名
const PASSWORD= 'wd02@Aa1'; // 替换为实际密码
const API_ENDPOINT = 'https://ems.thefit.com.cn/api/data'; // 替换为实际API端点

async function main() {
  try {
    // 创建插件实例
    const emsClient = new EMSLoginPlugin();

    // 执行登录
    console.log('正在登录...');
    const loginSuccess = await emsClient.login(LOGIN_URL, USERNAME, PASSWORD);

    if (loginSuccess) {
      console.log('登录成功！');

      // 示例API请求 - GET
      console.log('正在发送GET请求...');
      const getResponse = await emsClient.request(API_ENDPOINT, 'GET');
      console.log('GET请求结果:', getResponse);

      // 示例API请求 - POST (如有需要)
      // console.log('正在发送POST请求...');
      // const postData = { key1: 'value1', key2: 'value2' };
      // const postResponse = await emsClient.request(API_ENDPOINT, 'POST', postData);
      // console.log('POST请求结果:', postResponse);
    } else {
      console.log('登录失败');
    }
  } catch (error) {
    console.error('程序执行出错:', error.message);
  }
}

// 运行主程序
main();