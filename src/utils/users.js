const _lsKey = "_userSetting";

const encodeStr = values => {
  values.token =
    new Date().getTime() +
    encodeURI("印钞产品工艺流转计划跟踪系统").replace(/\%/g, "");
  return btoa(encodeURI(JSON.stringify(values)));
};

const decodeStr = str => JSON.parse(decodeURI(atob(str)));

const saveUserSetting = values => {
  window.localStorage.setItem(_lsKey, encodeStr(values));
};

const getUserSetting = () => {
  let _userSetting = window.localStorage.getItem(_lsKey);
  if (_userSetting == null) {
    return {
      success: false
    };
  }
  return {
    data: decodeStr(_userSetting),
    success: true
  };
};

const clearUserSetting = () => {
  window.localStorage.removeItem(_lsKey);
};

const saveLastRouter = pathname => {
  window.localStorage.setItem('_lastRouter', pathname)
}

const readLastRouter = () => {
  let router = window.localStorage.getItem('_lastRouter');
  return router == null ? '/' : router;
}

export default {
  saveUserSetting,
  getUserSetting,
  clearUserSetting,
  saveLastRouter,
  readLastRouter
}
