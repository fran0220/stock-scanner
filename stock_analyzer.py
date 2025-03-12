import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import os
import requests
from typing import Dict, List, Optional, Tuple
from dotenv import load_dotenv
import logging
from base_analyzer import BaseAnalyzer

class StockAnalyzer(BaseAnalyzer):
    def __init__(self, initial_cash=1000000):
        # 调用父类的初始化方法
        super().__init__()
        
    def get_stock_data(self, stock_code, market='A', start_date=None, end_date=None):
        """获取股票数据，支持A股、美股和港股"""
        import akshare as ak
        
        if start_date is None:
            start_date = (datetime.now() - timedelta(days=365)).strftime('%Y%m%d')
        if end_date is None:
            end_date = datetime.now().strftime('%Y%m%d')
            
        try:
            df = None
            
            # 根据市场类型获取数据
            if market == 'A':
                # A股数据
                df = ak.stock_zh_a_hist(symbol=stock_code, 
                                      start_date=start_date, 
                                      end_date=end_date,
                                      adjust="qfq")
                
                # 重命名列名以匹配分析需求
                df = df.rename(columns={
                    "日期": "date",
                    "开盘": "open",
                    "收盘": "close",
                    "最高": "high",
                    "最低": "low",
                    "成交量": "volume"
                })
                
            elif market == 'US':
                # 美股数据
                df = ak.stock_us_daily(symbol=stock_code, adjust="qfq")
                
                # 重命名列以匹配分析需求
                df = df.rename(columns={
                    "date": "date",
                    "open": "open",
                    "close": "close",
                    "high": "high",
                    "low": "low",
                    "volume": "volume"
                })
                
            elif market == 'HK':
                # 港股数据
                df = ak.stock_hk_daily(symbol=stock_code, adjust="qfq")
                
                # 重命名列以匹配分析需求
                df = df.rename(columns={
                    "date": "date",
                    "open": "open",
                    "close": "close",
                    "high": "high",
                    "low": "low",
                    "volume": "volume"
                })
                
            else:
                raise ValueError(f"不支持的市场类型: {market}")
            
            # 确保日期格式正确
            df['date'] = pd.to_datetime(df['date'])
            
            # 数据类型转换
            numeric_columns = ['open', 'close', 'high', 'low', 'volume']
            df[numeric_columns] = df[numeric_columns].apply(pd.to_numeric, errors='coerce')
            
            # 删除空值
            df = df.dropna()
            
            return df.sort_values('date')
            
        except Exception as e:
            self.logger.error(f"获取股票数据失败: {str(e)}")
            raise Exception(f"获取股票数据失败: {str(e)}")
            
    def analyze_stock(self, stock_code, market='A'):
        """分析股票，支持不同市场"""
        try:
            # 获取股票数据
            df = self.get_stock_data(stock_code, market)
            
            # 计算技术指标
            df = self.calculate_indicators(df)
            
            # 评分系统
            score = self.calculate_score(df)
            
            # 获取最新数据
            latest = df.iloc[-1]
            prev = df.iloc[-2]
            
            # 获取股票名称
            stock_name = self.get_stock_name(stock_code, market)
            
            # 生成报告
            report = {
                'stock_code': stock_code,
                'market': market,
                'stock_name': stock_name,
                'analysis_date': datetime.now().strftime('%Y-%m-%d'),
                'score': score,
                'price': latest['close'],
                'price_change': (latest['close'] - prev['close']) / prev['close'] * 100,
                'ma_trend': 'UP' if latest['MA5'] > latest['MA20'] else 'DOWN',
                'rsi': latest['RSI'],
                'macd_signal': 'BUY' if latest['MACD'] > latest['Signal'] else 'SELL',
                'volume_status': 'HIGH' if latest['Volume_Ratio'] > 1.5 else 'NORMAL',
                'recommendation': self.get_recommendation(score),
                'ai_analysis': self.get_ai_analysis(df, stock_code, 'stock')
            }
            
            return report
            
        except Exception as e:
            self.logger.error(f"分析股票时出错: {str(e)}")
            raise
    
            return stock_code
    def get_stock_name(self, stock_code, market='A'):
        """获取股票名称，支持本地缓存和网络错误处理"""
        import akshare as ak
        import json
        import os
        
        # 定义缓存文件路径
        cache_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'cache')
        os.makedirs(cache_dir, exist_ok=True)
        cache_file = os.path.join(cache_dir, f'stock_names_{market}.json')
        
        # 尝试从缓存加载
        stock_names = {}
        if os.path.exists(cache_file):
            try:
                with open(cache_file, 'r', encoding='utf-8') as f:
                    stock_names = json.load(f)
                    if stock_code in stock_names:
                        self.logger.info(f"从缓存获取股票名称: {stock_code} -> {stock_names[stock_code]}")
                        return stock_names[stock_code]
            except Exception as e:
                self.logger.warning(f"读取股票名称缓存失败: {str(e)}")
        
        # 缓存中没有，尝试从网络获取
        try:
            name = None
            if market == 'A':
                # 获取A股股票名称
                stock_info_df = ak.stock_info_a_code_name()
                filtered = stock_info_df[stock_info_df['code'] == stock_code]
                if not filtered.empty:
                    name = filtered.iloc[0]['name']
                
            elif market == 'US':
                # 获取美股股票名称
                stock_info_df = ak.stock_us_fundamental()
                filtered = stock_info_df[stock_info_df['symbol'] == stock_code]
                if not filtered.empty:
                    name = filtered.iloc[0]['cname']
                
            elif market == 'HK':
                # 获取港股股票名称
                stock_info_df = ak.stock_hk_spot_em()
                filtered = stock_info_df[stock_info_df['代码'] == stock_code]
                if not filtered.empty:
                    name = filtered.iloc[0]['名称']
            
            # 如果找到名称，更新缓存
            if name:
                stock_names[stock_code] = name
                try:
                    with open(cache_file, 'w', encoding='utf-8') as f:
                        json.dump(stock_names, f, ensure_ascii=False, indent=2)
                    self.logger.info(f"更新股票名称缓存: {stock_code} -> {name}")
                except Exception as e:
                    self.logger.warning(f"更新股票名称缓存失败: {str(e)}")
                return name
            
            # 如果找不到名称，使用默认名称
            default_name = f"{market}股票-{stock_code}"
            self.logger.warning(f"无法获取股票名称，使用默认名称: {default_name}")
            return default_name
            
        except Exception as e:
            self.logger.error(f"获取股票名称失败: {str(e)}")
            # 网络错误时使用默认名称
            default_name = f"{market}股票-{stock_code}"
            self.logger.warning(f"由于网络错误，使用默认名称: {default_name}")
            return default_name
            
    def scan_market(self, stock_list=None, market='A', min_score=60):
        """扫描市场，寻找符合条件的股票"""
        if stock_list is None:
            # 如果没有提供股票列表，获取市场所有股票
            stock_list = self.get_market_stocks(market)
            
        recommendations = []
        
        total = len(stock_list)
        for i, stock_code in enumerate(stock_list):
            try:
                report = self.analyze_stock(stock_code, market)
                if report['score'] >= min_score:
                    recommendations.append(report)
                # 打印进度
                if (i + 1) % 10 == 0 or (i + 1) == total:
                    self.logger.info(f"已分析 {i + 1}/{total} 只股票")
            except Exception as e:
                self.logger.error(f"分析股票 {stock_code} 时出错: {str(e)}")
                continue
                
        # 按得分排序
        recommendations.sort(key=lambda x: x['score'], reverse=True)
        return recommendations
    
    def get_market_stocks(self, market='A'):
        """获取市场所有股票代码"""
        import akshare as ak
        
        try:
            if market == 'A':
                # 获取A股所有股票
                stock_info_df = ak.stock_info_a_code_name()
                return stock_info_df['code'].tolist()
                
            elif market == 'US':
                # 获取美股所有股票
                stock_info_df = ak.stock_us_fundamental()
                return stock_info_df['symbol'].tolist()
                
            elif market == 'HK':
                # 获取港股所有股票
                stock_info_df = ak.stock_hk_spot_em()
                return stock_info_df['代码'].tolist()
                
            else:
                raise ValueError(f"不支持的市场类型: {market}")
                
        except Exception as e:
            self.logger.error(f"获取市场股票列表失败: {str(e)}")
            raise

    def calculate_ema(self, series, period):
        """计算指数移动平均线"""
        return series.ewm(span=period, adjust=False).mean()
        
    def calculate_rsi(self, series, period):
        """计算RSI指标"""
        delta = series.diff()
        gain = (delta.where(delta > 0, 0)).rolling(window=period).mean()
        loss = (-delta.where(delta < 0, 0)).rolling(window=period).mean()
        rs = gain / loss
        return 100 - (100 / (1 + rs))
        
    def calculate_macd(self, series):
        """计算MACD指标"""
        exp1 = series.ewm(span=12, adjust=False).mean()
        exp2 = series.ewm(span=26, adjust=False).mean()
        macd = exp1 - exp2
        signal = macd.ewm(span=9, adjust=False).mean()
        hist = macd - signal
        return macd, signal, hist
        
    def calculate_bollinger_bands(self, series, period, std_dev):
        """计算布林带"""
        middle = series.rolling(window=period).mean()
        std = series.rolling(window=period).std()
        upper = middle + (std * std_dev)
        lower = middle - (std * std_dev)
        return upper, middle, lower
        
    def calculate_atr(self, df, period):
        """计算ATR指标"""
        high = df['high']
        low = df['low']
        close = df['close'].shift(1)
        
        tr1 = high - low
        tr2 = abs(high - close)
        tr3 = abs(low - close)
        
        tr = pd.concat([tr1, tr2, tr3], axis=1).max(axis=1)
        return tr.rolling(window=period).mean()
        
    def calculate_indicators(self, df):
        """计算技术指标"""
        try:
            # 计算移动平均线
            df['MA5'] = self.calculate_ema(df['close'], 5)
            df['MA20'] = self.calculate_ema(df['close'], 20)
            df['MA60'] = self.calculate_ema(df['close'], 60)
            
            # 计算RSI
            df['RSI'] = self.calculate_rsi(df['close'], 14)
            
            # 计算MACD
            df['MACD'], df['Signal'], df['MACD_hist'] = self.calculate_macd(df['close'])
            
            # 计算布林带
            df['BB_upper'], df['BB_middle'], df['BB_lower'] = self.calculate_bollinger_bands(
                df['close'],
                20,
                2
            )
            
            # 成交量分析
            df['Volume_MA'] = df['volume'].rolling(window=20).mean()
            df['Volume_Ratio'] = df['volume'] / df['Volume_MA']
            
            # 计算ATR和波动率
            df['ATR'] = self.calculate_atr(df, 14)
            df['Volatility'] = df['ATR'] / df['close'] * 100
            
            # 动量指标
            df['ROC'] = df['close'].pct_change(periods=10) * 100
            
            return df
            
        except Exception as e:
            self.logger.error(f"计算技术指标时出错: {str(e)}")
            raise
            
    def calculate_score(self, df):
        """计算股票评分"""
        try:
            score = 0
            latest = df.iloc[-1]
            
            # 趋势得分 (30分)
            if latest['MA5'] > latest['MA20']:
                score += 15
            if latest['MA20'] > latest['MA60']:
                score += 15
                
            # RSI得分 (20分)
            if 30 <= latest['RSI'] <= 70:
                score += 20
            elif latest['RSI'] < 30:  # 超卖
                score += 15
                
            # MACD得分 (20分)
            if latest['MACD'] > latest['Signal']:
                score += 20
                
            # 成交量得分 (30分)
            if latest['Volume_Ratio'] > 1.5:
                score += 30
            elif latest['Volume_Ratio'] > 1:
                score += 15
                
            return score
            
        except Exception as e:
            self.logger.error(f"计算评分时出错: {str(e)}")
            raise
            
    def get_ai_analysis(self, df, stock_code, stock_type):
        """使用 OpenAI API 进行 AI 分析"""
        try:
            if not self.llm_api_key:
                self.logger.warning("未配置LLM API密钥，使用本地生成的分析报告")
                return self._generate_local_analysis(df, stock_code, stock_type)
                
            # 准备数据
            recent_data = df.tail(14).copy()
            # 将日期转换为字符串
            if 'date' in recent_data.columns:
                recent_data['date'] = recent_data['date'].dt.strftime('%Y-%m-%d')
            
            # 提取关键指标
            latest = df.iloc[-1]
            technical_summary = {
                'trend': 'upward' if latest['MA5'] > latest['MA20'] else 'downward',
                'volatility': f"{latest['Volatility']:.2f}%",
                'volume_trend': 'increasing' if latest['Volume_Ratio'] > 1 else 'decreasing',
                'rsi_level': f"{latest['RSI']:.2f}",
                'macd_signal': 'BUY' if latest['MACD'] > latest['Signal'] else 'SELL',
                'price': f"{latest['close']:.2f}",
                'price_change': f"{(latest['close'] - df.iloc[-2]['close']) / df.iloc[-2]['close'] * 100:.2f}%"
            }
            
            # 构建提示词
            prompt = f"""
            分析{stock_type} {stock_code}：

            技术指标概要：
            - 趋势: {technical_summary['trend']}
            - 波动率: {technical_summary['volatility']}
            - 成交量趋势: {technical_summary['volume_trend']}
            - RSI水平: {technical_summary['rsi_level']}
            - MACD信号: {technical_summary['macd_signal']}
            - 当前价格: {technical_summary['price']}
            - 价格变动: {technical_summary['price_change']}
            
            近14日交易数据摘要：
            - 最高价: {recent_data['high'].max():.2f}
            - 最低价: {recent_data['low'].min():.2f}
            - 平均成交量: {recent_data['volume'].mean():.2f}
            - 平均波动率: {recent_data['Volatility'].mean():.2f}%
            
            请提供：
            1. 趋势分析（包含支撑位和压力位）
            2. 成交量分析及其含义
            3. 风险评估（包含波动率分析）
            4. 短期和中期目标价位
            5. 关键技术位分析
            6. 具体交易建议（包含止损位）
            
            请基于技术指标和市场动态进行分析，给出具体数据支持。
            """
            
            # 根据API类型构建请求
            if self.llm_api_type.lower() == 'openai':
                return self._call_openai_api(prompt)
            elif self.llm_api_type.lower() == 'azure':
                return self._call_azure_openai_api(prompt)
            elif self.llm_api_type.lower() == 'custom':
                return self._call_custom_api(prompt)
            else:
                self.logger.warning(f"不支持的API类型: {self.llm_api_type}，使用本地生成的分析报告")
                return self._generate_local_analysis(df, stock_code, stock_type)
                
        except Exception as e:
            self.logger.error(f"AI 分析发生错误: {str(e)}")
            return "AI 分析过程中发生错误"
            
    def get_recommendation(self, score):
        """根据得分给出建议"""
        if score >= 80:
            return '强烈推荐买入'
        elif score >= 60:
            return '建议买入'
        elif score >= 40:
            return '观望'
        elif score >= 20:
            return '建议卖出'
        else:
            return '强烈建议卖出'
