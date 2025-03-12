#!/bin/bash

# 设置颜色
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}启动股票与期货分析系统前端...${NC}"

# 检查是否已经安装了所需的依赖
echo -e "${YELLOW}检查前端依赖...${NC}"
npm install

# 启动前端开发服务器
echo -e "${YELLOW}启动前端开发服务器...${NC}"
npm run dev

echo -e "${GREEN}前端服务器启动完成!${NC}"
echo -e "${GREEN}前端界面运行在: http://localhost:3000${NC}"
