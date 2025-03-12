# 股票与期货分析系统

一个全面的股票和期货分析系统，支持A股、美股、港股以及国内外期货市场的技术分析。

## 功能特点

- **多市场支持**：分析A股、美股、港股和期货市场
- **技术指标分析**：MA、RSI、MACD等常用技术指标
- **期货特有指标**：持仓量变化、价格动量分析
- **批量分析**：支持批量分析多只股票或期货
- **AI辅助分析**：提供智能分析建议
- **现代化界面**：响应式设计，支持移动端和桌面端

## 系统架构

- **后端**：Python，基于Flask提供RESTful API
- **前端**：Next.js + React + TypeScript，使用Tailwind CSS进行样式设计
- **数据源**：支持多种数据源接入

## 安装与运行

### 前提条件

- Python 3.8+
- Node.js 16+
- npm 8+

### 安装步骤

1. 克隆仓库
```bash
git clone https://github.com/yourusername/stock-scanner.git
cd stock-scanner
```

2. 安装Python依赖
```bash
pip install -r requirements.txt
```

3. 安装前端依赖
```bash
cd frontend
npm install
cd ..
```

4. 配置环境变量
```bash
cp .env.example .env
# 编辑.env文件，设置必要的环境变量
```

### 运行系统

使用提供的启动脚本一键启动整个系统：

```bash
chmod +x start.sh
./start.sh
```

或者分别启动后端和前端：

1. 启动后端API服务器
```bash
python api_server.py
```

2. 启动前端开发服务器
```bash
cd frontend
npm run dev
```

访问 http://localhost:3000 即可使用系统。

## API文档

后端API文档可通过访问 http://localhost:8000/docs 获取。

主要API端点：

- `/api/stock/analyze` - 分析单只股票
- `/api/stock/batch-analyze` - 批量分析股票
- `/api/futures/analyze` - 分析单个期货
- `/api/futures/batch-analyze` - 批量分析期货

## 开发指南

### 添加新的技术指标

1. 在 `base_analyzer.py` 中添加新的技术指标计算方法
2. 在 `stock_analyzer.py` 或 `futures_analyzer.py` 中使用新指标

### 添加新的市场支持

1. 在相应的分析器类中添加新市场的数据获取和处理逻辑
2. 更新前端界面以支持新市场

## 许可证

MIT
