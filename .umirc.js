export default {
  plugins: [
    ['umi-plugin-dva'],
    ['umi-plugin-routes', {
      exclude: [
        /models/,
        /services/,
        /components/,
      ],
    }]
  ],
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
}
