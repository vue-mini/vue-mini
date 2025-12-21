# 案例

Vue Mini 已经被很多公司和团队应用在了生产环境，其中不乏大厂，如网易、腾讯。甚至微信内部都在使用 Vue Mini。下列是一些使用 Vue Mini 开发的小程序，也欢迎[提交你的小程序](https://github.com/vue-mini/vue-mini/issues/59)。

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
  <div class="case">
    <img src="/cases/8.jpg" alt="超清4K壁纸酷">
    <span>超清4K壁纸酷</span>
  </div>
  <div class="case">
    <img src="/cases/9.jpg" alt="青岛市银行保险业纠纷调解中心">
    <span>青岛市银行保险业纠纷调解中心</span>
  </div>
  <div class="case">
    <img src="/cases/10.jpg" alt="心之链">
    <span>心之链</span>
  </div>
  <div class="case">
    <img src="/cases/11.jpg" alt="轻帧">
    <span>轻帧</span>
  </div>
  <div class="case">
    <img src="/cases/12.jpg" alt="拼好喵">
    <span>拼好喵</span>
  </div>
  <div class="case">
    <img src="/cases/13.jpg" alt="彼翼">
    <span>彼翼</span>
  </div>
  <div class="case">
    <img src="/cases/14.jpg" alt="九善农植有机生活">
    <span>九善农植有机生活</span>
  </div>
  <a class="case" href="https://github.com/vue-mini/vue-mini/issues/59" target="_blank" rel="noreferrer">
    <img src="/cases/add.svg" alt="添加">
    <span>添加</span>
  </a>
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
  border-radius: 50%;
}

.case span {
  text-align: center;
}

@media (max-width: 420px) {
  .cases {
    gap: 24px;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
