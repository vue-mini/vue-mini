# 案例

Vue Mini 已经被很多公司和团队应用在了生产环境，其中不乏大厂，如网易。下列是一些使用 Vue Mini 开发的小程序，也欢迎[提交你的小程序](https://github.com/vue-mini/vue-mini/issues/59)。

<div class="cases">
  <div class="case">
    <img src="/cases/1.jpg" alt="网易游戏印象">
    <span>网易游戏印象</span>
  </div>
  <div class="case">
    <img src="/cases/2.jpg" alt="妙邻社区">
    <span>妙邻社区</span>
  </div>
  <div class="case">
    <img src="/cases/3.jpg" alt="字多">
    <span>字多</span>
  </div>
  <div class="case">
    <img src="/cases/4.jpg" alt="伊旅小向导">
    <span>伊旅小向导</span>
  </div>
  <div class="case">
    <img src="/cases/5.jpg" alt="冒险计算工具">
    <span>冒险计算工具</span>
  </div>
  <div class="case">
    <img src="/cases/6.jpg" alt="时钟表">
    <span>时钟表</span>
  </div>
  <div class="case">
    <img src="/cases/7.jpg" alt="日常计数器">
    <span>日常计数器</span>
  </div>
</div>

<style>
.cases {
  display: grid;
  gap: 36px;
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.case {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.case img {
  margin-bottom: 16px;
  width: 100%;
}

@media (max-width: 420px) {
  .cases {
    gap: 24px;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
