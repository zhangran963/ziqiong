export const sleep = (time = 0) => {
  let timer;

  return new Promise((res, rej) => {
    timer = window.setTimeout(() => {
      res(timer);
    }, time);
  });
};
