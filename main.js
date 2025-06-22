const EMSLoginPlugin = require('./ems-login-plugin');

// 配置登录信息
const LOGIN_URL = 'https://ems.thefit.com.cn/Account/Login';
const USERNAME = 'wd002'; // 替换为实际用户名
const PASSWORD= 'wd02@Aa1'; // 替换为实际密码
async function main() {
  try {
    // 创建插件实例
    const emsClient = new EMSLoginPlugin();

    // 执行登录
    console.log('正在登录...');
    const loginSuccess = await emsClient.login(LOGIN_URL, USERNAME, PASSWORD);

    if (loginSuccess) {
      console.log('Login Success:', loginSuccess);

      // 定义请求队列（接口数组）
      const requestQueue = [
        {
          url: 'https://ems.thefit.com.cn/ems-api/realtime',
          method: 'GET',
          params: { project: 'WD0000002', module: 'Meter_Load', _t: Date.now().toString() }
        },
        // 可以添加更多请求对象
        // {
        //   url: 'https://ems.thefit.com.cn/ems-api/other-endpoint',
        //   method: 'POST',
        //   params: { key: 'value' }
        // }
      ];

      // 处理请求队列的函数
      async function processRequestQueue(client, queue) {
        const results = [];
        for (const [index, request] of queue.entries()) {
          try {
            console.log(`正在处理第 ${index + 1}/${queue.length} 个请求: ${request.url}`);
            const responseData=await emsClient.request(request.url,request.method||'GET',request.params||{});
            console.log('请求返回数据:', responseData);
            results.push({
              index,
              url: request.url,
              success: true,
              data: responseData.data
            });
            console.log(`第 ${index + 1} 个请求成功`);
          } catch (error) {
            results.push({
              index,
              url: request.url,
              success: false,
              error: error.message
            });
            console.error(`第 ${index + 1} 个请求失败:`, error.message);
          }
        }
        return results;
      }

      // 执行请求队列
      console.log('开始处理请求队列...');
      const queueResults = await processRequestQueue(emsClient, requestQueue);
      console.log('请求队列处理完成');
      return queueResults;

      // 示例API请求 - POST (如有需要)
      // console.log('正在发送POST请求...');
      // const postData = { key1: 'value1', key2: 'value2' };
      // const postResponse = await emsClient.request(API_ENDPOINT, 'POST', postData);
      // console.log('POST请求结果:', postResponse);
    } else {
      console.log('Login Failed!');
    }
  } catch (error) {
    console.error('Program Error:', error.message);
  }
}

// 运行主程序
main();