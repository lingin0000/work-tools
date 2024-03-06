/*
 * @Author: 罗智刚
 * @Description: 后续移至helper
 * @Date: 2023-01-16 09:54:23
 */

export const toUppercaseFirstLetter = (str: string) => {
  if (str?.length) {
    return `${str[0].toLocaleUpperCase()}${str.slice(1)}`
  }
  return str
}
