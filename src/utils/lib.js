export const searchUrl = "http://10.8.2.133/search#";
export const apiHost = "http://localhost/DataInterface/Api";
export const isCartOrReel = str => {
  const rules = {
    cart: /^[1-9]\d{3}[A-Za-z]\d{3}$/,
    reel: /^[1-9]\d{6}[A-Ca-c]$|^[1-9]\d{4}$|^[1-9]\d{4}[A-Ca-c]$|^[1-9]\d{6}$|[A-Z]\d{11}[A-Z]/
  };
  return rules.cart.test(str) || rules.reel.test(str);
};

export const isDateTime = str =>
  /^\d{4}(-|\/|)[0-1]\d(-|\/|)[0-1]\d$|^\d{4}(-|\/|)[0-1]\d(-|\/|)[0-1]\d [0-2][0-9]:[0-5][0-9](:[0-5][0-9])$|^[0-2][0-9]:[0-5][0-9](:[0-5][0-9])$/.test(
    str
  );
export const isNumOrFloat = str => /^\d+(\.)\d+$|^\d+$/.test(str);
export const isInt = str => /^\d+$/.test(str);
export const isFloat = str => /^\d+\.\d+$|^\d+$/.test(str);
