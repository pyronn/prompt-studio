# 第一阶段: 构建
# 使用带有 Node.js 的官方基础镜像

FROM node:18.18-alpine as builder

# 设置工作目录
WORKDIR /app

# 复制 package.json 和 package-lock.json
COPY package*.json ./

# 安装项目依赖
RUN npm install

# 复制项目文件和文件夹到工作目录
COPY . .

# 构建应用
RUN npm run build

# 第二阶段: 运行
# 再次使用带有 Node.js 的官方基础镜像
FROM builder
LABEL authors="pyronn"

# 设置环境变量
ENV NODE_ENV production

# 设置工作目录
WORKDIR /app

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# 从构建阶段复制构建出的文件
COPY --from=builder --chown=nextjs:nodejs /app/next.config.js ./
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules

USER nextjs

# 开放端口
EXPOSE 3000

ENV HOSTNAME "0.0.0.0"

# 运行应用
CMD ["npm", "start"]

