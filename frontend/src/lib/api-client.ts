import axios from 'axios';

// 创建API客户端实例
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// 股票分析相关API
export const stockApi = {
  // 分析单只股票
  analyzeStock: async (stockCode: string, market: string = 'A') => {
    console.log('API客户端发送股票分析请求:', { stockCode, market });
    const requestData = {
      stockCode, // 直接使用前端变量名称
      market,
    };
    console.log('API请求体:', requestData);
    const response = await apiClient.post('/api/stock/analyze', requestData);
    return response.data;
  },
  
  // 批量分析股票
  batchAnalyzeStocks: async (stockCodes: string[], market: string = 'A', minScore: number = 60) => {
    const response = await apiClient.post('/api/stock/batch-analyze', {
      stockCodes, // 直接使用前端变量名称
      market,
      min_score: minScore,
    });
    return response.data;
  },
  
  // 获取市场所有股票代码
  getMarketStocks: async (market: string = 'A') => {
    const response = await apiClient.get(`/api/stock/market-stocks?market=${market}`);
    return response.data;
  },
};

// 期货分析相关API
export const futuresApi = {
  // 分析单个期货合约
  analyzeFutures: async (symbol: string, market: string = 'CN') => {
    console.log('API客户端发送期货分析请求:', { symbol, market });
    const requestData = {
      symbol,  // 直接使用symbol参数名称
      market,
    };
    console.log('API请求体:', requestData);
    const response = await apiClient.post('/api/futures/analyze', requestData);
    return response.data;
  },
  
  // 批量分析期货
  batchAnalyzeFutures: async (futuresCodes: string[], market: string = 'CN', minScore: number = 60) => {
    const response = await apiClient.post('/api/futures/batch-analyze', {
      futuresCodes, // 直接使用前端变量名称
      market,
      min_score: minScore,
    });
    return response.data;
  },
  
  // 获取市场所有期货代码
  getMarketFutures: async (market: string = 'CN') => {
    const response = await apiClient.get(`/api/futures/market-futures?market=${market}`);
    return response.data;
  },
};

// LLM分析相关API
export const llmApi = {
  // 使用LLM分析股票
  analyzeStockWithLLM: async (stockCode: string, market: string = 'A') => {
    const response = await apiClient.post('/api/llm/analyze-stock', {
      stock_code: stockCode,
      market,
    });
    return response.data;
  },
  
  // 使用LLM分析期货
  analyzeFuturesWithLLM: async (futuresCode: string, market: string = 'CN') => {
    const response = await apiClient.post('/api/llm/analyze-futures', {
      futures_code: futuresCode,
      market,
    });
    return response.data;
  },
};

// 系统相关API
export const systemApi = {
  // 获取系统健康状态
  getHealth: async () => {
    const response = await apiClient.get('/health');
    return response.data;
  },
};
