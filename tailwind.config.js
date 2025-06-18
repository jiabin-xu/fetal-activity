/* eslint-disable */
/** @type {import('tailwindcss').Config} */
module.exports = {
  // 这里给出了一份 taro 通用示例，具体要根据你自己项目的目录结构进行配置
  content: ['./src/**/*.{html,js,jsx,ts,tsx}'],
  theme: {

  },
  plugins: [],
  // 其他配置项
  corePlugins: {
    // 小程序不需要 preflight，因为这主要是给 h5 的，如果你要同时开发多端，你应该使用 process.env.TARO_ENV 环境变量来控制它
    preflight: false,
  },
}
