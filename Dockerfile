# 第一阶段: 构建
# 使用带有 Node.js 的官方基础镜像
FROM node:alpine as builder

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
FROM node:alpine
LABEL authors="pyronn"

# 设置工作目录
WORKDIR /app

# 从构建阶段复制构建出的文件
COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules

# 设置环境变量
ENV NODE_ENV production

# 开放端口
EXPOSE 3000

# 运行应用
CMD ["npm", "start"]

