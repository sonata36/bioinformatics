# DNA 配对大作战

基于“合成大派蒙”游戏机制改编的《生物信息学》课程网页小游戏。开局依次投放 A、T，让它们碰撞形成第一个碱基对；随后解锁 C、G。A–T、C–G 才能配对，两个同样长度的片段可以继续合并。越过警戒线持续 3 秒会结束本局。

## 上手方式

打开页面，点击“开始游戏”，先投放 A，再把 T 投到 A 附近。电脑用鼠标移动和点击，手机按住滑动后松开。第一次成功配对后加入 C、G。同一种碱基连续出现两次后，下一张会从其他已解锁碱基中选择；场上缺少的配对球更容易出现，连续等待过久时还会得到保底。下方有可选图鉴和四题小测验，不影响游玩。

背景音乐在点击“开始游戏”后播放，右上角“静音”按钮会同时关闭背景音乐和短音效。

本游戏介绍 DNA 的互补配对和碱基对（bp）概念。相同长度片段的“合成”是游戏规则，不模拟真实 DNA 合成；片段长度也不代表具体序列内容。

## 运行

需要 Node.js 22.12 或更新版本。在本目录执行：

```powershell
npm ci
npm run dev
```

也可执行 `npm run build` 后打开 `dist/index.html` 所在的静态服务器；直接双击项目根目录 `index.html` 时使用构建好的 `offline/` 文件。

## 验证

```powershell
npm test
npm run build
```

## 部署到 Render

仓库根目录提供了 `render.yaml`。在 Render 连接此 GitHub 仓库后，可选择 Blueprint 导入该文件；或者手动创建 **Static Site**，设置：

- Branch：`main`
- Build Command：`npm ci && npm run build`
- Publish Directory：`dist`

网站不需要数据库、服务端进程或环境变量。不要创建 Web Service。

游戏沿用 Phaser 与 Matter.js 的物理投放机制，改写了互补配对、投放池和学习反馈。八张卡片由 `generate_icons.py` 绘制，短音效由 Web Audio 程序生成；没有沿用原游戏的角色图片和音乐。背景音乐使用 Cleyton Kauffman 的 [Underwater Theme II](https://opengameart.org/content/underwater-theme-ii)，约 1 分 45 秒，作者标注为无缝循环曲目，按 CC0 许可使用。浏览器优先播放 OGG 文件，不支持 OGG 时播放 MP3，文件位于 `assets/audio/`。
