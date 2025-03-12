from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import uvicorn
import logging
import os
from datetime import datetime
from dotenv import load_dotenv

from stock_analyzer import StockAnalyzer
from futures_analyzer import FuturesAnalyzer

# 加载环境变量
load_dotenv()

# 设置日志
log_level = os.getenv("LOG_LEVEL", "info").upper()
logging.basicConfig(level=getattr(logging, log_level),
                  format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# 创建FastAPI应用
app = FastAPI(
    title="股票与期货分析系统API",
    description="提供股票和期货分析功能的API接口",
    version="2.0.0"
)

# 添加CORS中间件
frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[frontend_url, "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 创建分析器实例
stock_analyzer = StockAnalyzer()
futures_analyzer = FuturesAnalyzer()

# 请求模型
class StockAnalysisRequest(BaseModel):
    stock_code: str = ""  # 允许空字符串，但在处理时会检查
    stockCode: str = ""   # 兼容前端可能发送的参数名
    market: str = "A"     # 默认为A股

    # 处理可能的参数名不一致
    def __init__(self, **data):
        super().__init__(**data)
        # 如果stock_code为空但stockCode不为空，使用stockCode
        if not self.stock_code and self.stockCode:
            self.stock_code = self.stockCode

class BatchStockAnalysisRequest(BaseModel):
    stock_codes: List[str] = []
    stockCodes: List[str] = []  # 兼容前端可能发送的参数名
    market: str = "A"
    min_score: Optional[int] = 60

    # 处理可能的参数名不一致
    def __init__(self, **data):
        super().__init__(**data)
        # 如果stock_codes为空但stockCodes不为空，使用stockCodes
        if not self.stock_codes and self.stockCodes:
            self.stock_codes = self.stockCodes

class FuturesAnalysisRequest(BaseModel):
    symbol: str = ""           # 允许空字符串，但在处理时会检查
    futures_code: str = ""     # 兼容前端可能发送的参数名
    futuresCode: str = ""      # 兼容前端可能发送的参数名
    market: str = "CN"         # 默认为国内期货

    # 处理可能的参数名不一致
    def __init__(self, **data):
        super().__init__(**data)
        # 如果symbol为空，尝试使用其他可能的参数名
        if not self.symbol:
            if self.futures_code:
                self.symbol = self.futures_code
            elif self.futuresCode:
                self.symbol = self.futuresCode

class BatchFuturesAnalysisRequest(BaseModel):
    futures_codes: List[str] = []
    futuresCodes: List[str] = []  # 兼容前端可能发送的参数名
    market: str = "CN"
    min_score: Optional[int] = 60

    # 处理可能的参数名不一致
    def __init__(self, **data):
        super().__init__(**data)
        # 如果futures_codes为空但futuresCodes不为空，使用futuresCodes
        if not self.futures_codes and self.futuresCodes:
            self.futures_codes = self.futuresCodes

# API路由
@app.get("/")
async def root():
    return {"message": "股票与期货分析系统API", "version": "2.0.0"}

# 股票分析API
@app.post("/api/stock/analyze")
async def analyze_stock(request: StockAnalysisRequest):
    """分析单只股票"""
    try:
        logger.info(f"分析股票: {request.stock_code}, 市场: {request.market}")
        result = stock_analyzer.analyze_stock(request.stock_code, request.market)
        return {"status": "success", "data": result}
    except Exception as e:
        logger.error(f"分析股票时出错: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/stock/batch-analyze")
async def batch_analyze_stocks(request: BatchStockAnalysisRequest):
    """批量分析股票"""
    try:
        logger.info(f"批量分析股票, 市场: {request.market}, 数量: {len(request.stock_codes)}")
        results = stock_analyzer.scan_market(request.stock_codes, request.market, request.min_score)
        return {"status": "success", "data": results}
    except Exception as e:
        logger.error(f"批量分析股票时出错: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/stock/market-stocks")
async def get_market_stocks(market: str = Query("A", description="市场类型: A(A股), US(美股), HK(港股)")):
    """获取市场所有股票代码"""
    try:
        logger.info(f"获取市场股票列表: {market}")
        stocks = stock_analyzer.get_market_stocks(market)
        return {"status": "success", "data": stocks}
    except Exception as e:
        logger.error(f"获取市场股票列表时出错: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# 期货分析API
@app.post("/api/futures/analyze")
async def analyze_futures(request: FuturesAnalysisRequest):
    """分析单个期货合约"""
    try:
        # 确保期货代码不为空
        if not request.symbol:
            raise ValueError("期货代码不能为空")
            
        logger.info(f"分析期货: {request.symbol}, 市场: {request.market}")
        # 直接使用symbol参数，无需映射
        result = futures_analyzer.analyze_futures(symbol=request.symbol, market=request.market)
        return {"status": "success", "data": result}
    except Exception as e:
        logger.error(f"分析期货时出错: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/futures/batch-analyze")
async def batch_analyze_futures(request: BatchFuturesAnalysisRequest):
    """批量分析期货"""
    try:
        logger.info(f"批量分析期货, 市场: {request.market}, 数量: {len(request.futures_codes)}")
        results = []
        for code in request.futures_codes:
            try:
                result = futures_analyzer.analyze_futures(symbol=code, market=request.market)
                if result['score'] >= request.min_score:
                    results.append(result)
            except Exception as e:
                logger.warning(f"分析期货 {code} 时出错: {str(e)}")
                continue
        
        return {"status": "success", "data": results}
    except Exception as e:
        logger.error(f"批量分析期货时出错: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/futures/market-futures")
async def get_market_futures(market: str = Query("CN", description="市场类型: CN(国内期货), GLOBAL(国际期货)")):
    """获取市场所有期货代码"""
    try:
        logger.info(f"获取市场期货列表: {market}")
        futures = futures_analyzer.get_market_futures(market)
        return {"status": "success", "data": futures}
    except Exception as e:
        logger.error(f"获取市场期货列表时出错: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# 健康检查
@app.get("/health")
async def health_check():
    """API健康检查"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "version": "2.0.0"
    }

# 启动服务器
if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("api_server:app", host="0.0.0.0", port=port, reload=True)
