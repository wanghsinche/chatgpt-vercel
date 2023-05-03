import { noLoginCode } from '@configs';

export const myRequest = (url, config: RequestInit) =>
  fetch(url, config).then((res) => {
    if (res.status === 200) return res.json();
    if (res.status === noLoginCode) {
      setTimeout(() => {
        window.location.href = `/?date=${Date.now()}`;
      }, 1000);
    }
    return res.json().then((obj) => Promise.reject(obj.msg));
  });
