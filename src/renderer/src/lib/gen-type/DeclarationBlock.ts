/*
 * @Author: 罗智刚
 * @Description: 渲染一段内容
 * @Date: 2022-12-27 17:49:59
 */

export class DeclarationBlock {
  private _comment: string = ''

  private _name: string = ''

  private _content: string = ''

  private _require: boolean = true

  private _combination: string = ':'

  private _punctuation: string = ';'

  /** 注释 */
  withComment(comment: string) {
    this._comment = comment
    return this
  }

  /** 名称 */
  withName(name: string) {
    this._name = name
    return this
  }

  /** 内容 */
  withContent(content: string) {
    this._content = content
    return this
  }

  /** 是否必填,默认 true */
  withRequire(require: boolean) {
    this._require = require
    return this
  }

  /** 连接符，默认 : */
  withCombination(combination: string) {
    this._combination = combination
    return this
  }

  /** 结束符，默认 ; */
  withPunctuation(punctuation: string) {
    this._punctuation = punctuation
    return this
  }

  get string() {
    let result = ''

    if (this._comment) {
      result += `/** ${this._comment} */\n`
    }

    result += `${this._name} ${this._require ? '' : '?'}${this._combination} ${
      this._content
    }${this._punctuation}`

    return result
  }
}
