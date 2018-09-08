import {
  axios,
  DEV
} from "../../utils/axios";

/**
*   @database: { 工艺质量管理 }
*   @desc:     { 用户登录 } 
    const { username, password } = params;
*/
export const getUser = async params => {
  if (DEV) {
    return {
      rows: 1,
      data: [{
        name: "develop",
        uid: "1",
        fullname: "develop",
        org: "1"
      }]
    };
  }
  return await axios({
    url: '/149/ffe1fb555a.json',
    params,
  }).then(res => res);
};
