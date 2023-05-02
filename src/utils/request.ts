export const myRequest = (url, config: RequestInit) =>
  fetch(url, config).then((res) => {
    if (res.status === 200) return res.json();
    return res.json().then((obj) => Promise.reject(obj.msg));
  });
