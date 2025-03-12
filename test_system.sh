#!/bin/bash

# 设置颜色
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}股票与期货分析系统测试脚本${NC}"
echo -e "${YELLOW}=============================${NC}"

# 检查环境变量文件
if [ ! -f .env ]; then
    echo -e "${RED}错误: .env 文件不存在，请先创建环境变量文件${NC}"
    exit 1
fi

# 检查Python依赖
echo -e "${YELLOW}检查Python依赖...${NC}"
pip install -r requirements.txt

# 启动API服务器
echo -e "${YELLOW}启动API服务器...${NC}"
python api_server.py &
API_PID=$!

# 等待API服务器启动
echo -e "${YELLOW}等待API服务器启动...${NC}"
sleep 5

# 测试API服务器
echo -e "${YELLOW}测试API服务器...${NC}"
python test_api.py

# 测试结果
TEST_RESULT=$?
if [ $TEST_RESULT -eq 0 ]; then
    echo -e "${GREEN}API服务器测试通过！${NC}"
else
    echo -e "${RED}API服务器测试失败，请检查日志${NC}"
fi

# 关闭API服务器
echo -e "${YELLOW}关闭API服务器...${NC}"
kill $API_PID

echo -e "${YELLOW}测试完成${NC}"
exit $TEST_RESULT
