export default {
  plugins: [
    [
      'umi-plugin-react',
      {
        dva: {
          hmr: true
        },
        antd: true,
        locale: {
          enable: false, // default false
          default: 'zh-CN', // default zh-CN
          baseNavigator: false // default true, when it is true, will use `navigator.language` overwrite default
        },
        dynamicImport: {
          webpackChunkName: true,
          loadingComponent: './components/PageLoading/Loading1.jsx'
        },
        // pwa: true,
        fastClick: true,
        targets: {
          ie: 9,
          chrome: 47,
          firefox: 43,
          safari: 9,
          edge: 11,
          ios: 9
        }
      }
    ]
  ],
  hash: true, //添加hash后缀
  treeShaking: true
  // exportStatic: {},
  // routes: [{
  //   "path": "/",
  //   "component": "../layouts/index.js",
  //   "routes": [{
  //     "path": "/404",
  //     "exact": true,
  //     "component": "../pages/404.js"
  //   }, {
  //     "path": "/500",
  //     "exact": true,
  //     "component": "../pages/500.js"
  //   }, {
  //     "path": "/chart",
  //     "exact": true,
  //     "component": "../pages/chart/page.jsx"
  //   }, {
  //     "path": "/financial/excess",
  //     "exact": true,
  //     "component": "../pages/financial/excess.jsx"
  //   }, {
  //     "path": "/financial/inv",
  //     "exact": true,
  //     "component": "../pages/financial/inv.jsx"
  //   }, {
  //     "path": "/table",
  //     "exact": true,
  //     "component": "../pages/table/page.js"
  //   }]
  // }]
};
