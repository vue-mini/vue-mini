# 比较

## 原生语法

小程序原生语法是开发者所能接触到的最底层，这也是写小程序的**唯一**方法，任何其他方案最终都要通过原生语法才能工作。几年前小程序原生语法可能还不算太糟糕，但如今 TS 越来越受欢迎，而原生语法对 TS 的支持却很羸弱。并且 React Hooks 横空出世，彻底改变了 UI 逻辑的编写方式，Vue 3 也根据自己的响应式数据提出了 Composition API，有着与 React Hooks 相同的能力。在这种背景下原生语法已经很难让人满意，Vue Mini 通过将 Vue 3 的 Composition API 引入小程序，从而解决了这些问题。Vue Mini 与原生语法也并不是二选一的关系，它们可以很好的协同工作。

## Taro 2 / Rax 编译时

Taro 2 是个很有想象力的方案（Rax 编译时与 Taro 2 基本类似），你可以像写 React 一样写小程序，它通过编译时的静态分析将你的类 React 组件还原成原生语法。可是这其中有个致命的问题，React Render Function / JSX 是极其动态的，而原生语法的 Template 是比较静态的。都知道把静态模版编译为动态渲染函数不难，反过来却难如登天。也就是这个根本原因导致 Taro 2 有很多难以解决的问题，Taro 团队可能也意识到这条路是个死胡同，所以 Taro 3 抛弃了编译时方案。而 Vue Mini 目前只是一个轻量的纯运行时库，它并不依赖任何编译时手段。

## Taro 3 / Remax / kbone / Rax 运行时

Taro 3 / Remax / kbone / Rax 运行时，这四个方案的实现细节略有不同，但可以大致归为同一类。Taro 3 / kbone / Rax 运行时，这三个方案是通过模拟实现 DOM API 来让现有的 Web 框架可以跑在小程序上，最终通过模拟的 DOM API 生成 VDOM，而 Remax 是实现了一个自定义的 react-reconciler 直接承接 React 生成的 VDOM。最终它们都是将 VDOM 作为小程序组件的 data 发送给模版，然后通过模版语法在运行时暴力递归 VDOM 生成最终的 UI 树。可以了解到这类方案是重运行时的，很暴力，但有效。可是这类方案也是带着原罪出生的，主要问题有两个：一个是这类方案都带有一个很大的运行时，一个 Hello World 小程序，Taro 3 的大小是 243KB，Remax 更是达到了 305KB，而作为对比 Vue Mini 只有 19KB，虽然这样的对比并不严谨，但大致也可以说明问题。另一个问题是这类方案有很大的性能开销，据 Rax 计算它们与原生小程序存在约 40% 的性能差距，而 Vue Mini 完全依赖小程序自己的运行时，只是在响应式数据变化时点对点的更新小程序组件的 data，因此 Vue Mini 有着与原生小程序十分接近的性能表现。

## uni-app / mpvue / Megalo

uni-app / mpvue / Megalo 这三个方案也可以大致归为同一类，它们与 Vue Mini 一样都是基于 Vue 的。但是 Vue Mini 与它们的差别也很明显，它们都是基于 Vue 2 的，而 Vue Mini 是基于 Vue 3 的，Vue 3 不论是响应式数据还是 Composition API 都比 Vue 2 要更加灵活、强大。由于 Vue 2 的限制，它们基本都维护了一份 Vue 2 的 Fork，Vue 3 将自身拆成了几个相对独立的部分，Vue Mini 直接且仅依赖 Vue 3 的响应式核心 @vue/reactivity，这避免了一些不必要的性能开销，也保证了运行时的小巧。另外在技术偏向上，Vue Mini 与它们的选择也不同，它们是尽量靠近 Vue，努力将 Vue 渲染到小程序，而 Vue Mini 是在原生小程序基础上借助 Vue 做增强，更靠近原生小程序。这有助于减少各种各样的坑，并且能更好更无痛的使用小程序本身的各种 API。

::: tip 关于uni-app
虽然uni-app也支持vue3和Composition API 但是uni-app在稳定性和兼容性上还是有一些不如意的地方并且uni-app的性能也稍差一点，所以在这里我们不过多讨论。
:::
