import { describe, expect, test } from 'vitest'
const {
  async2sync2,
  serialize,
} = require(`../index.js`)

test(`base`, () => {
  const asyncFn = async (a, b) => {
    return a + b
  }
  const res = async2sync2(asyncFn)(1, 2)
  expect(res).toStrictEqual(3)
})

test(`sync function`, () => {
  const asyncFn = (a, b) => {
    return a + b
  }
  const res = async2sync2(asyncFn)(1, 2)
  expect(res).toStrictEqual(3)
})

test(`opt.returnDetail`, () => {
  const asyncFn = async (a, b) => {
    return a + b
  }
  const { res } = async2sync2(asyncFn, {
    returnDetail: true,
  })(1, 2)
  expect(res).toStrictEqual(3)
})


test(`err try/catch`, () => {
  const asyncFn = async (a, b) => {
    return a.call(b)
  }
  try {
    async2sync2(asyncFn)(1, 2)
  } catch (err) {
    expect(String(err)).toStrictEqual(`TypeError: a.call is not a function`)
  }
})


test(`err cb`, () => {
  const asyncFn = async (a, b) => {
    return a.call(b)
  }
  async2sync2(asyncFn, (err) => {
    expect(String(err)).toStrictEqual(`TypeError: a.call is not a function`)
  })(1, 2)
})



test(`type`, () => {
  const args = Object.values({
    str  : 'string',
    num  : 0,
    obj  : {foo: 'foo'},
    arr  : [1, 2, 3],
    bool : true,
    nil  : null,
    undef: undefined,
    inf  : Infinity,
    date : new Date("Thu, 28 Apr 2016 22:02:17 GMT"),
    map  : new Map([['hello', 'world']]),
    set  : new Set([123, 456]),
    fn   : function echo(arg) { return arg; },
    re   : /([^\s]+)/g,
    big  : BigInt(10),
    url  : new URL('https://example.com/'),
  })
  const asyncFn = async (...args) => {
    return args
  }
  const res = async2sync2(asyncFn)(...args)
  expect(serialize(res)).toStrictEqual(serialize(args))
})

