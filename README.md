# 校园失物招领 Web 版

一个轻量的校园失物招领 Web 小程序原型，基于 HTML + CSS + 原生 JavaScript 实现，数据用 `localStorage` 本地持久化，无需任何后端。

## 项目简介

基于福州大学 2026 秋软件工程结对编程作业，基于第一次结对作业的原型设计实现的 Web 版本。

- **形态**：纯前端单页应用（SPA），双击 `index.html` 即用
- **数据**：使用浏览器 `localStorage`，刷新不丢失
- **测试**：使用 Jest 覆盖核心业务逻辑（15 个测试用例全部通过）

## 开发环境

- Chrome 浏览器（推荐版本 ≥ 100）
- Node.js（仅运行单元测试时需要，版本 ≥ 16）
- 编辑器：VS Code / Trae / 其他任意

## 目录结构

```
校园失物招领/
├── index.html               # 入口页面（含发布/详情两个弹窗）
├── css/
│   └── style.css            # 全局样式
├── js/
│   ├── storage.js           # localStorage 读写封装
│   ├── data.js              # 业务数据操作（创建/标记完成/筛选）
│   ├── search.js            # 搜索与排序（纯函数）
│   └── app.js               # 应用渲染与事件绑定入口
├── __tests__/
│   └── data.test.js         # Jest 单元测试（Data / Search 模块）
├── imgs/                    # 博客中使用的界面截图
│   ├── 01-home.png
│   ├── 02-search.png
│   ├── 03-detail.png
│   ├── 04-mine.png
│   └── 05-publish.png
├── package.json             # Jest 配置
├── make_screenshots.py      # 截图生成脚本（可选）
└── README.md                # 本文件
```

## 安装与运行

### 方式一：直接打开（最简单）

下载整个项目后，**用 Chrome 浏览器双击 `index.html`** 即可使用。无需 Node、无需安装。

> 提示：双击打开时浏览器地址栏会以 `file://` 开头，部分浏览器对 `file://` 下的 clipboard API 有限制，「复制联系方式」按钮在这种情况下可能提示复制失败——可手动复制即可，其余功能均不受影响。

### 方式二：本地起一个静态服务（推荐）

```bash
# 进入项目目录
cd 校园失物招领

# Python 自带服务器
python -m http.server 8080

# 或 Node 的 npx
npx serve -p 8080 .
```

然后浏览器访问 <http://localhost:8080>。

### 运行测试

```bash
cd 校园失物招领
npm install      # 首次需要，安装 jest
npm test
```

预期输出：`Tests: 15 passed, 15 total`。

## 游戏操作说明

1. **首页**：浏览全部信息；点击顶部「全部 / 寻物 / 招领」可按类型筛选；点击卡片查看详情。
2. **搜索**：在搜索框输入关键词（支持物品名称、描述、地点三字段模糊匹配），按 Enter 或点「搜索」按钮；点「清空」重置。
3. **发布**：点击右上角「+ 发布」按钮，在弹窗中选择「寻物 / 招领」类型，填写名称 / 描述 / 地点 / 联系方式后点「发布」。
4. **我的发布**：在导航栏点「我的发布」，查看自己发布过的信息及状态（寻找中 / 已归还 / 已找回）。
5. **详情 & 状态标记**：点击任一卡片进入详情；可点击「复制联系方式」一键复制；点击「标记为已完成」将该条信息置灰并移至列表底部。

## 已实现的功能

- 浏览失物和招领信息
- 发布寻物 / 招领信息（含必填校验）
- 按物品名称 / 描述 / 地点关键词搜索
- 按类型筛选（全部 / 寻物 / 招领）
- 查看物品详情 + 一键复制联系方式
- 我的发布 + 状态标记（已完成）
- localStorage 持久化
- 响应式布局：PC 与窄屏均可

## 未实现（按作业要求免做）

- 实名认证
- 即时聊天
- 地图定位
- 服务端后台管理

## 截图

详见 [`imgs/`](./imgs/) 目录。

## 测试结果

```
PASS __tests__/data.test.js
  Data.createItem
    √ 正常输入返回合法条目
    √ 缺失必填项抛出明确错误
    √ type 非法时拒绝创建
  Data.markDone / removeDone
    √ markDone 仅改指定 id
    √ removeDone 移除已完成项
  Data.filterByType
    √ all 返回全部（不修改原数组）
    √ lost / found 各自筛选正确
  Search.search
    √ 空关键词返回全部
    √ 匹配名称（中文）
    √ 匹配描述
    √ 匹配地点
    √ 不区分大小写
    √ 匹配不到返回空数组
  Search.sortForDisplay
    √ active 在前；active 内部按时间倒序
    √ 不修改原数组顺序

Tests: 15 passed, 15 total
```