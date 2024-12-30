# async2sync2

## 项目简介

`async2sync2` 是一个将异步函数转换为同步函数的工具。它通过将函数源码抽到单独的 JS 文件中运行，实现同步执行异步函数的效果。

## 安装

```bash
npm install async2sync2
```

## 使用方法

```javascript
const { async2sync2 } = require('async2sync2');

const asyncFn = async (a, b) => {
  return a + b;
};

const result = async2sync2(asyncFn)(1, 2);
console.log(result); // 输出: 3
```

## 配置选项

- `tempDir`：临时文件存放目录
- `clearTemp`：是否清理临时文件，默认为 `true`
- `returnDetail`：是否返回详细信息，默认为 `false`
- `cb`：错误回调函数

以下是一个使用所有配置选项的示例：

```javascript
const asyncFn = async (a, b) => {
  return a + b
}
const { res } = async2sync2(asyncFn, {
  returnDetail: true,
})(1, 2)
expect(res).toStrictEqual(3)
```

## 运行测试

```bash
npm test
```

## 许可证

MIT