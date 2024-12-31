const serializePath = `${__dirname}/serialize-javascript/index.js`.replace(/\\/g, `/`)
const serialize = require(serializePath)

/**
 * 判断数据是否为 type, 或返回 type
 * @param {*} data 
 * @param {*} type 
 * @returns 
 */
function isType(data, type = undefined) {
  const dataType = Object.prototype.toString.call(data).match(/\s(.+)]/)[1].toLowerCase()
  return type ? (dataType === type.toLowerCase()) : dataType
}

/**
 * 创建或删除一组文件
 * @param objOrArr {object|number} 要操作的内容
 * @param action {stirng} 操作方式 create remove
 */
function filesCreateOrRemove (objOrArr, action) {
  const {writeFileSync, unlinkSync} = require(`fs`)
  Object.keys(objOrArr).forEach(key => {
    const name = objOrArr[key]
    if (action === `create`) {
      writeFileSync(name, ``, `utf8`)
    }
    if (action === `remove`) {
      unlinkSync(name)
    }
  })
}

/**
 * 根据 dirName 和 fileName 返回一个当前目录不存在的文件名
 * @param dirName 目录
 * @param fileName 名称
 * @return {stirng} 例 `${dirName}/temp_${Date.now()}.${fileName}`
 */
function createNewFile (dirName, fileName) {
  const newFile = `${dirName}/temp_${Date.now()}${Math.random()}.${fileName}`
  return require(`fs`).existsSync(newFile) === true ? createNewFile(dirName, fileName) : newFile
}

/**
 * 同步执行异步函数, 由于是把函数源码抽到单独的 js 文件中运行, 所以有一些限制
 * - 如果依赖 babel 可能导致 toString 后的代码没有相关 polyfill
 * - 入参和出参需要可序列化(json), 不会输出出参之外的其他信息
 * - 函数内不要有外部依赖(例如)
 * @param fn 要运行的函数
 * @param opt 配置
 * @param opt.tempDir {string} 临时文件存放目录
 * @param opt.clearTemp {boolean} 是否清理临时文件
 * @param opt.returnDetail {boolean} 是否返回详细信息
 * @param opt.cb {function} 错误回调
 * @return {function} 接收原参数, 返回 {res, err}
 */
function async2sync2 (fn, opt = {}) {
  typeof(opt) === `function` && (opt = {cb: opt});
  opt = {
    tempDir: undefined,
    cb: undefined,
    clearTemp: true,
    returnDetail: false ,
    ...opt,
  }
  return (...args) => {
    const fs = require(`fs`)
    const { writeFileSync, readFileSync } = fs
    const fnStr = isType(fn, `function`) ? `async ${fn.toString()}` : fn.toString()
    const tempDir = (opt.tempDir || require(`os`).tmpdir()).replace(/\\/g, `/`)
    const fileObj = {
      fnFile: createNewFile(tempDir, `fn.js`),
      resFile: createNewFile(tempDir, `res.log`),
      errFile: createNewFile(tempDir, `err.log`),
    }
    filesCreateOrRemove(fileObj, `create`)
    let res = ``
    let err = ``
    try {
      const argsString = serialize(args)
      const codeString = `
        const serialize = require('${serializePath}')
        const { writeFileSync } = require('fs')
        const fn = ${fnStr}
        new Promise(() => {
          fn(...${argsString})
            .then((res) => {
              const text = serialize(res)
              writeFileSync("${fileObj.resFile}", '('+ text +')', 'utf8')
            })
            .catch((err = 'undefined') => {
              const text = serialize(String(err))
              writeFileSync("${fileObj.errFile}", '('+ text +')', 'utf8')
            })
            .finally(() => {
              process.exit()
            })
          }
        )
      `
      writeFileSync(fileObj.fnFile, codeString, `utf8`)
      require(`child_process`).spawnSync(process.execPath, [fileObj.fnFile])
      res = eval(readFileSync(fileObj.resFile, `utf8`))
      err = eval(readFileSync(fileObj.errFile, `utf8`))
    } catch (error) {
      err = String(error)
    }
    opt.clearTemp && filesCreateOrRemove(fileObj, `remove`)
    if(opt.returnDetail) {
      return {res, err, ...fileObj}
    } else if(err) {
      if(opt.cb) {
        opt.cb(err)
      } else {
        throw err
      }
    } else {
      return res
    }
  }
}

module.exports = {
  async2sync2,
  serialize,
}

