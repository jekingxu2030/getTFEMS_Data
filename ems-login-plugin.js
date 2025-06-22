const axios=require('axios');
const cheerio=require('cheerio');
const { wrapper }=require('axios-cookiejar-support');
const { CookieJar }=require('tough-cookie');

class EMSLoginPlugin {
  constructor() {
    // 创建带cookie支持的axios实例
    this.jar=new CookieJar();
    this.client=wrapper(axios.create({
      jar: this.jar,
      withCredentials: true,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.5735.289 Safari/537.36',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Referer': 'https://ems.thefit.com.cn/Module?Project=WD0000002',
        'X-Requested-With': 'XMLHttpRequest'
      }
    }));

    // 添加请求拦截器打印Cookie
    this.client.interceptors.request.use(config => {
      // console.log('请求携带的Cookie:',config.headers.Cookie||'无Cookie');
      return config;
    });
  }

  /**
   * 登录到EMS系统
   * @param {string} loginUrl - 登录页面URL
   * @param {string} username - 用户名
   * @param {string} password - 密码
   * @returns {Promise<boolean>} 登录是否成功
   */
  async login(loginUrl,username,password) { //登录方法
    // 1. 先GET请求获取Antiforgery Cookie
    const getResponse=await this.client.get(loginUrl);
    // 2. 从响应HTML中提取Antiforgery Token
    const tokenMatch=getResponse.data.match(/name="__RequestVerificationToken" value="([^"]+)"/);
    // if(!tokenMatch) { console.log('未找到Antiforgery Token') };
    // const token=tokenMatch[1];
    // 3. 添加project cookie
    this.jar.setCookieSync('project=WD0000002',loginUrl);
    // 4. 执行登录POST请求
    try {
      // 先获取登录页面，可能需要提取CSRF令牌
      const response=await this.client.get(loginUrl);
      const $=cheerio.load(response.data);

      // 构造登录请求数据
      // 提取CSRF令牌
      const requestVerificationToken=$('input[name="__RequestVerificationToken"]').val();

      // 构造登录请求数据
      const loginData={
        'LoginInput.UserNameOrEmailAddress': username,
        'LoginInput.Password': password,
        'ReturnUrl': '/Account/LoginSuccess',
        'ReturnUrlHash': '',
        'Action': 'Login',
        '__RequestVerificationToken': requestVerificationToken
      };

      // 添加调试日志
      // console.log('Login Data:', loginData);

      // 提交登录请求
      const loginResponse=await this.client.post(loginUrl,new URLSearchParams(loginData).toString());
      if(loginResponse) {
        console.log('Login Status:',loginResponse.statusText);
      }
      // 简单判断登录是否成功（可根据实际情况调整）
      return loginResponse.status===200;
    } catch(error) {
      console.error('Login Failed:',error.message);
      throw error;
    }
  }

  /**
   * 发送API请求
   * @param {string} url - 请求URL
   * @param {string} method - 请求方法 (GET/POST等)
   * @param {object} data - 请求数据
   * @returns {Promise<object>} 请求响应数据
   */
  async request(url,method='GET',data={}) {   //数据请求方法
    try {
      const config={
        url,
        method,
        // GET请求使用params传递查询参数，POST请求使用data传递表单数据
        [method==='GET'? 'params':'data']: method==='GET'? data:new URLSearchParams(data).toString()
      };

      // 添加请求调试日志
      console.log(`Sending${method}request:`,url,config[method==='GET'? 'params':'data']);

      const response=await this.client(config);
      return response.data;
    } catch(error) {
      console.error('API Request Failed:',error.message);
      throw error;
    }
  }
}

module.exports=EMSLoginPlugin;