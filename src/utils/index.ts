export const sleep = (time = 0): Promise<number> => {
  let timer: number

  return new Promise((res, rej) => {
    timer = window.setTimeout(() => {
      res(timer)
    }, time)
  })
}
