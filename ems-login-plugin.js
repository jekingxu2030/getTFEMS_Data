const axios = require('axios');
const cheerio = require('cheerio');
const { wrapper } = require('axios-cookiejar-support');
const { CookieJar } = require('tough-cookie');

class EMSLoginPlugin {
  constructor() {
    // 创建带cookie支持的axios实例
    this.jar = new CookieJar();
    this.client = wrapper(axios.create({
      jar: this.jar,
      withCredentials: true,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    }));
  }

  /**
   * 登录到EMS系统
   * @param {string} loginUrl - 登录页面URL
   * @param {string} username - 用户名
   * @param {string} password - 密码
   * @returns {Promise<boolean>} 登录是否成功
   */
  async login(loginUrl, username, password) {
    try {
      // 先获取登录页面，可能需要提取CSRF令牌
      const response = await this.client.get(loginUrl);
      const $ = cheerio.load(response.data);

      // 构造登录请求数据
      // 提取CSRF令牌
      const requestVerificationToken = $('input[name="__RequestVerificationToken"]').val();

      // 构造登录请求数据
      const loginData = {
        'LoginInput.UserNameOrEmailAddress': username,
        'LoginInput.Password': password,
        'ReturnUrl': '/Account/LoginSuccess',
        'ReturnUrlHash': '',
        'Action': 'Login',
        '__RequestVerificationToken': requestVerificationToken
      };

      // 添加调试日志
      console.log('登录数据:', loginData);

      // 提交登录请求
      const loginResponse = await this.client.post(loginUrl, new URLSearchParams(loginData).toString());

      // 简单判断登录是否成功（可根据实际情况调整）
      return loginResponse.status === 200;
    } catch (error) {
      console.error('登录失败:', error.message);
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
  async request(url, method = 'GET', data = {}) {
    try {
      const config = {
        url,
        method,
        data: method === 'POST' ? new URLSearchParams(data).toString() : undefined
      };

      const response = await this.client(config);
      return response.data;
    } catch (error) {
      console.error('API请求失败:', error.message);
      throw error;
    }
  }
}

module.exports = EMSLoginPlugin;