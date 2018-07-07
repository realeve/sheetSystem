import {
  axios
} from "../../utils/axios";

/**
*   @database: { 工艺质量管理 }
*   @desc:     { 用户登录 } 
    const { username, password } = params;
*/
export const getUser = async params => await axios({
  url: '/149/ffe1fb555a.json',
  params,
}).then(res => res);
