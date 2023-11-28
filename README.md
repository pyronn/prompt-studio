# PromptRep
## 介绍
提示词仓库，基于Nextjs实现的Midjourney提示词仓库和可视化编辑器。可以方便的编辑和调整提示词的顺序,支持中文翻译,修改系统参数，并且可以保存到notion中,构建自己的提示词库。
整体功能和用户使用逻辑参考了[OpenPromptStudio](https://github.com/Moonvy/OpenPromptStudio)的方式，在此基础上增加了提示词的保存功能。使用nextjs实现，可以方便的部署到vercel上。

## Features
[x] 基本的提示词编辑和调整功能，支持常用的系统参数调整
[x] 支持使用notion作为数据库
[x] 提示词中文翻译(目前只支持腾讯机翻)
[x] 提示词保存到notion，单个的词组和整个提示词都支持保存，可以添加示例图片。
[ ] 提示词搜索和删除功能
[ ] 提示词分享成图片

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```


## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.


