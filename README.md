# mini-vue
通过实现一个mini-vue3来学习Vue3源码，测试用例参考Vue3仓库。
## 实现思路笔记记录
### Reactivity模块
1. 通过两个简单的Vue3仓库测试用例实现effect & reactive & 依赖收集 & 触发依赖 [实现effect & reactive & 依赖收集 & 触发依赖](./docs//reactive/实现effect%20&%20reactive%20&%20依赖收集%20&%20触发依赖.md)
2. 实现effect返回runner，effect中返回runner的作用 & 使用场景?
3. 实现effect.scheduler功能，使用场景是什么?
