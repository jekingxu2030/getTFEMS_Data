const EMSLoginPlugin=require('./ems-login-plugin');

// 配置登录信息
const LOGIN_URL='https://ems.thefit.com.cn/Account/Login';
const USERNAME='wd002'; // 替换为实际用户名
const PASSWORD='wd02@Aa1'; // 替换为实际密码
async function main() {
  try {
    // 创建插件实例
    const emsClient=new EMSLoginPlugin();

    // 执行登录
    console.log('正在登录...');
    const loginSuccess=await emsClient.login(LOGIN_URL,USERNAME,PASSWORD);

    if(loginSuccess) {
      console.log('Login Success:',loginSuccess);

      // 定义请求队列（接口数组）
      const requestQueue=[
        { url: 'https://ems.thefit.com.cn/config/WDCLS0001.js',method: 'GET',params: {} },
        { url: 'https://ems.thefit.com.cn/config/WD0000002.js',method: 'GET',params: {} },
        { url: 'https://ems.thefit.com.cn/protocol/ztww_pcs.js?1',method: 'GET',params: {} },
        { url: 'https://ems.thefit.com.cn/protocol/huasu_bms_tcp_cu_v117.js?1',method: 'GET',params: {} },
        { url: 'https://ems.thefit.com.cn/protocol/akr_meter_ADL400.js?1',method: 'GET',params: {} },
        { url: 'https://ems.thefit.com.cn/protocol/haiwu_ac_v0_5.js?1',method: 'GET',params: {} },
        { url: 'https://ems.thefit.com.cn/ems-api/realtime',method: 'GET',params: { project: 'WD0000002',module: 'PCS',_t: Date.now().toString() } },
        { url: 'https://ems.thefit.com.cn/api/app/alarm/search-list?skipCount=0&maxResultCount=9999&key=IsAcked%3Afalse%7CIsResumed%3Afalse%7CModule%3APCS',method: 'GET',params: {} },
        {
          url: 'https://ems.thefit.com.cn/ems-api/realtime',
          method: 'GET',
          params: { project: 'WD0000002',module: 'Meter_Load',_t: Date.now().toString() }
        },
        {
          url: 'https://ems.thefit.com.cn/ems-api/realtime',
          method: 'GET',
          params: { project: 'WD0000002',module: 'EMS',_t: Date.now().toString() }
        },
        {
          url: 'https://ems.thefit.com.cn/ems-api/realtime',
          method: 'GET',
          params: { project: 'WD0000002',module: 'PCS',_t: Date.now().toString() }
        },
        {
          url: 'https://ems.thefit.com.cn/ems-api/realtime',
          method: 'GET',
          params: { project: 'WD0000002',module: 'BMS',_t: Date.now().toString() }
        },
        {
          url: 'https://ems.thefit.com.cn/ems-api/projects/tree',
          method: 'GET',
          params: { userId: '3a18e899-f3f3-8410-6432-5182e7e4483e' }
        },
        {
          url: 'https://ems.thefit.com.cn/ems-api/actual',
          method: 'POST',
          params: {
            _t: Date.now().toString(),
            project: 'WD0000002',
            measurePoints: 'PCS-ActivePower',
            group: '1m'
          }
        }
        ,
        {
          url: 'https://ems.thefit.com.cn/ems-api/actual',
          method: 'POST',
          params: {
            _t: Date.now().toString(),
            project: 'WD0000002',
            measurePoints: 'BMS-Soc',
            group: '1m'
          }
        },
        { url: 'https://ems.thefit.com.cn/api/app/profit/search-list',method: 'GET',params: { skipCount: 0,maxResultCount: 100,key: '2025/06/01 - 2025/06/30',sorting: 'reportDate desc',_t: Date.now().toString() } },
        { url: 'https://ems.thefit.com.cn/api/app/config/list',method: 'POST',data: { project: 'WD0000002' } },
        { url: 'https://ems.thefit.com.cn/ems-api/realtime',method: 'GET',params: { project: 'WD0000002',module: 'EMS',measurePoints: 'EMS-200,EMS-201,EMS-202,EMS-203,EMS-204,EMS-205,EMS-209,EMS-210,EMS-211,EMS-212,EMS-213,EMS-217,EMS-218,EMS-219,EMS-220,EMS-221,EMS-225,EMS-226,EMS-227,EMS-228,EMS-229,EMS-233,EMS-234,EMS-235,EMS-236,EMS-237,EMS-241,EMS-242,EMS-243,EMS-244,EMS-245,EMS-249,EMS-250,EMS-251,EMS-252,EMS-253,EMS-257,EMS-258,EMS-259,EMS-260,EMS-261,EMS-265,EMS-266,EMS-267,EMS-268,EMS-269,EMS-273,EMS-274,EMS-275,EMS-276,EMS-277,EMS-369,EMS-370,EMS-371,EMS-372,EMS-373,EMS-374,EMS-375,EMS-376,EMS-377,EMS-378,EMS-379,EMS-380,EMS-381,EMS-382,EMS-383,EMS-384,EMS-385,EMS-386,EMS-351,EMS-352,EMS-353,EMS-354,EMS-355,EMS-356,EMS-357,EMS-358,EMS-359,EMS-360,EMS-361,EMS-362,EMS-363,EMS-364,EMS-365,EMS-366,EMS-367,EMS-368,EMS-568' } },
  ];

      // 处理请求队列的函数
      async function processRequestQueue(client,queue) {
        const results=[];
        for(const [index,request] of queue.entries()) {
          try {
            console.log(`正在处理第 ${index+1}/${queue.length} 个请求: ${request.url}`);
            const responseData=await emsClient.request(request.url,request.method||'GET',request.params||{});
            if(index===5||index===6) {
              //  console.log('请求返回数据:',responseData);
            } else {
              console.log('请求返回数据:',responseData.code);
            }
            results.push({
              index,
              url: request.url,
              success: true,
              data: responseData.data
            });
            console.log(`第 ${index+1} 个请求成功`);
          } catch(error) {
            results.push({
              index,
              url: request.url,
              success: false,
              error: error.message
            });
            console.error(`第 ${index+1} 个请求失败:`,error.message);
          }
          // 每次请求间隔500ms
          if(index<queue.length-1) {
            await new Promise(resolve => setTimeout(resolve,500));
            console.log('等待500ms...');
          }

        }
        return results;
      }

      // 执行请求队列
      console.log('开始处理请求队列...');
      const queueResults=await processRequestQueue(emsClient,requestQueue);
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
  } catch(error) {
    console.error('Program Error:',error.message);
  }
}

// 运行主程序
main();