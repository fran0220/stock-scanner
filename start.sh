#!/bin/bash

# 设置颜色
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}启动股票与期货分析系统...${NC}"

# 检查是否已经安装了所需的Python包
echo -e "${YELLOW}检查Python依赖...${NC}"
pip install -r requirements.txt

# 启动后端API服务器
echo -e "${YELLOW}启动后端API服务器...${NC}"
python api_server.py &
API_PID=$!

# 等待API服务器启动
echo -e "${YELLOW}等待API服务器启动...${NC}"
sleep 3

# 检查前端依赖
echo -e "${YELLOW}检查前端依赖...${NC}"
cd frontend
npm install

# 启动前端开发服务器
echo -e "${YELLOW}启动前端开发服务器...${NC}"
npm run dev &
FRONTEND_PID=$!

echo -e "${GREEN}系统启动完成!${NC}"
echo -e "${GREEN}后端API服务器运行在: http://localhost:8000${NC}"
echo -e "${GREEN}前端界面运行在: http://localhost:3000${NC}"
echo -e "${YELLOW}按Ctrl+C停止服务${NC}"

# 等待用户中断
trap "kill $API_PID $FRONTEND_PID; exit" INT
wait
