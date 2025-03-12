import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import os
import requests
from typing import Dict, List, Optional, Tuple
from dotenv import load_dotenv
import logging
from base_analyzer import BaseAnalyzer

class FuturesAnalyzer(BaseAnalyzer):
    """期货分析器类，用于分析各种期货合约"""
    
    def __init__(self):
        # 调用父类的初始化方法
        super().__init__()
        
        # 期货特有参数
        self.futures_params = {
            'momentum_period': 10,
            'open_interest_ma_period': 14,
            'basis_threshold': 0.02  # 基差阈值
        }
    
    def get_futures_data(self, symbol, market='CN', start_date=None, end_date=None):
        """获取期货数据，支持国内期货和国际期货"""
        import akshare as ak
        
        if start_date is None:
            start_date = (datetime.now() - timedelta(days=365)).strftime('%Y%m%d')
        if end_date is None:
            end_date = datetime.now().strftime('%Y%m%d')
            
        try:
            df = None
            
            # 根据市场类型获取数据
            if market == 'CN':
                # 国内期货数据
                df = ak.futures_main_sina(symbol=symbol)
                
                # 重命名列以匹配分析需求
                df = df.rename(columns={
                    "日期": "date",
                    "开盘价": "open",
                    "收盘价": "close",
                    "最高价": "high",
                    "最低价": "low",
                    "成交量": "volume",
                    "持仓量": "open_interest"
                })
                
            elif market == 'GLOBAL':
                # 国际期货数据
                df = ak.futures_global_commodity_hist(symbol=symbol)
                
                # 重命名列以匹配分析需求
                df = df.rename(columns={
                    "date": "date",
                    "open": "open",
                    "close": "close",
                    "high": "high",
                    "low": "low",
                    "volume": "volume"
                })
                
                # 国际期货可能没有持仓量数据，添加空列
                if 'open_interest' not in df.columns:
                    df['open_interest'] = np.nan
                
            else:
                raise ValueError(f"不支持的市场类型: {market}")
            
            # 确保日期格式正确
            df['date'] = pd.to_datetime(df['date'])
            
            # 数据类型转换
            numeric_columns = ['open', 'close', 'high', 'low', 'volume', 'open_interest']
            df[numeric_columns] = df[numeric_columns].apply(pd.to_numeric, errors='coerce')
            
            # 删除空值
            df = df.dropna(subset=['close', 'volume'])
            
            return df.sort_values('date')
            
        except Exception as e:
            self.logger.error(f"获取期货数据失败: {str(e)}")
            raise Exception(f"获取期货数据失败: {str(e)}")
    
    def calculate_futures_indicators(self, df):
        """计算期货特有的技术指标"""
        try:
            # 首先计算基础技术指标
            df = self.calculate_indicators(df)
            
            # 计算期货特有指标
            
            # 1. 持仓量变化
            df['OI_Change'] = df['open_interest'].pct_change() * 100
            df['OI_MA'] = df['open_interest'].rolling(window=self.futures_params['open_interest_ma_period']).mean()
            
            # 2. 价格动量
            df['Momentum'] = df['close'].diff(self.futures_params['momentum_period'])
            
            # 3. 成交量与持仓量比率 (Volume/Open Interest Ratio)
            df['VOI_Ratio'] = df['volume'] / df['open_interest']
            
            # 4. 价格波动性
            df['TR'] = pd.DataFrame({
                'a': df['high'] - df['low'],
                'b': abs(df['high'] - df['close'].shift(1)),
                'c': abs(df['low'] - df['close'].shift(1))
            }).max(axis=1)
            df['ATR14'] = df['TR'].rolling(window=14).mean()
            
            # 5. 合约溢价/折价指标 (如果有现货价格数据)
            # 这里需要外部数据，暂时跳过
            
            return df
            
        except Exception as e:
            self.logger.error(f"计算期货技术指标时出错: {str(e)}")
            raise
    
    def calculate_futures_score(self, df):
        """计算期货评分"""
        try:
            # 获取最新数据
            latest = df.iloc[-1]
            
            # 初始化评分
            score = 50
            
            # 1. 趋势评分 (30分)
            # MA趋势
            if latest['MA5'] > latest['MA20'] and latest['MA20'] > latest['MA60']:
                score += 15  # 强上升趋势
            elif latest['MA5'] > latest['MA20']:
                score += 10  # 上升趋势
            elif latest['MA5'] < latest['MA20'] and latest['MA20'] < latest['MA60']:
                score -= 15  # 强下降趋势
            elif latest['MA5'] < latest['MA20']:
                score -= 10  # 下降趋势
            
            # MACD信号
            if latest['MACD'] > latest['Signal'] and latest['MACD_hist'] > 0:
                score += 10
            elif latest['MACD'] < latest['Signal'] and latest['MACD_hist'] < 0:
                score -= 10
            
            # 2. 动量评分 (20分)
            # RSI
            if latest['RSI'] > 70:
                score += 5  # 超买
            elif latest['RSI'] < 30:
                score -= 5  # 超卖
            
            # 价格动量
            if latest['Momentum'] > 0:
                score += 5
            else:
                score -= 5
            
            # 3. 波动性评分 (20分)
            # 布林带位置
            if latest['close'] > latest['BB_upper']:
                score -= 10  # 价格超出上轨，可能回落
            elif latest['close'] < latest['BB_lower']:
                score += 10  # 价格低于下轨，可能反弹
            
            # 4. 成交量评分 (15分)
            # 成交量趋势
            if latest['Volume_Ratio'] > 1.5:
                score += 5  # 成交量放大
            elif latest['Volume_Ratio'] < 0.5:
                score -= 5  # 成交量萎缩
            # 5. 持仓量评分 (15分)
            # 持仓量变化
            prev_close = df.iloc[-2]["close"] if len(df) > 1 else latest["close"]
            if latest["OI_Change"] > 5 and latest["close"] > prev_close:
                score += 10  # 持仓量增加且价格上涨，看多信号
            elif latest["OI_Change"] < -5 and latest["close"] < prev_close:
                score -= 10  # 持仓量减少且价格下跌，看空信号
            
            # 确保评分在0-100之间
            return max(0, min(100, score))
            
        except Exception as e:
            self.logger.error(f"计算期货评分时出错: {str(e)}")
            raise
    
    def analyze_futures(self, symbol, market='CN'):
        """分析期货合约"""
        try:
            # 获取期货数据
            df = self.get_futures_data(symbol, market)
            
            # 计算技术指标
            df = self.calculate_futures_indicators(df)
            
            # 评分系统
            score = self.calculate_futures_score(df)
            
            # 获取最新数据
            latest = df.iloc[-1]
            prev = df.iloc[-2]
            
            # 获取期货名称
            futures_name = self.get_futures_name(symbol, market)
            
            # 生成报告
            report = {
                'futures_code': symbol,
                'market': market,
                'futures_name': futures_name,
                'analysis_date': datetime.now().strftime('%Y-%m-%d'),
                'score': score,
                'price': latest['close'],
                'price_change': (latest['close'] - prev['close']) / prev['close'] * 100,
                'ma_trend': 'UP' if latest['MA5'] > latest['MA20'] else 'DOWN',
                'rsi': latest['RSI'],
                'macd_signal': 'BUY' if latest['MACD'] > latest['Signal'] else 'SELL',
                'volume_status': 'HIGH' if latest['Volume_Ratio'] > 1.5 else 'NORMAL',
                'open_interest_change': latest['OI_Change'],
                'recommendation': self.get_recommendation(score),
                'ai_analysis': self.get_ai_analysis(df, symbol, 'futures')
            }
            
            return report
            
        except Exception as e:
            self.logger.error(f"分析期货时出错: {str(e)}")
            raise
    
            return symbol
    def get_futures_name(self, symbol, market='CN'):
        """获取期货名称，支持本地缓存和网络错误处理"""
        import akshare as ak
        import json
        import os
        
        # 定义缓存文件路径
        cache_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'cache')
        os.makedirs(cache_dir, exist_ok=True)
        cache_file = os.path.join(cache_dir, f'futures_names_{market}.json')
        
        # 尝试从缓存加载
        futures_names = {}
        if os.path.exists(cache_file):
            try:
                with open(cache_file, 'r', encoding='utf-8') as f:
                    futures_names = json.load(f)
                    if symbol in futures_names:
                        self.logger.info(f"从缓存获取期货名称: {symbol} -> {futures_names[symbol]}")
                        return futures_names[symbol]
            except Exception as e:
                self.logger.warning(f"读取期货名称缓存失败: {str(e)}")
        
        # 缓存中没有，尝试从网络获取
        try:
            name = None
            if market == 'CN':
                # 获取国内期货名称
                futures_info_df = ak.futures_zh_spot()
                filtered = futures_info_df[futures_info_df['symbol'] == symbol]
                if not filtered.empty:
                    name = filtered.iloc[0]['name']
                
            elif market == 'GLOBAL':
                # 获取国际期货名称 - 这里可能需要根据实际API调整
                # 由于可能没有直接的API，我们使用映射表
                global_futures_map = {
                    'CL': '原油期货',
                    'GC': '黄金期货',
                    'SI': '白银期货',
                    'HG': '铜期货',
                    'NG': '天然气期货',
                    'ZC': '玉米期货',
                    'ZW': '小麦期货',
                    'ZS': '大豆期货',
                    'KC': '咖啡期货',
                    'CT': '棉花期货',
                    'LB': '木材期货',
                    'ES': '标普500期货',
                    'NQ': '纳斯达克期货',
                    'YM': '道琼斯期货',
                    'RTY': '罗素2000期货',
                }
                
                # 提取合约代码的前两个字符作为基础代码
                base_code = symbol[:2] if len(symbol) >= 2 else symbol
                if base_code in global_futures_map:
                    name = global_futures_map[base_code]
            
            # 如果找到名称，更新缓存
            if name:
                futures_names[symbol] = name
                try:
                    with open(cache_file, 'w', encoding='utf-8') as f:
                        json.dump(futures_names, f, ensure_ascii=False, indent=2)
                    self.logger.info(f"更新期货名称缓存: {symbol} -> {name}")
                except Exception as e:
                    self.logger.warning(f"更新期货名称缓存失败: {str(e)}")
                return name
            
            # 如果找不到名称，使用默认名称
            default_name = f"{market}期货-{symbol}"
            self.logger.warning(f"无法获取期货名称，使用默认名称: {default_name}")
            return default_name
            
        except Exception as e:
            self.logger.error(f"获取期货名称失败: {str(e)}")
            # 网络错误时使用默认名称
            default_name = f"{market}期货-{symbol}"
            self.logger.warning(f"由于网络错误，使用默认名称: {default_name}")
            return default_name
    
    def scan_futures_market(self, futures_list=None, market='CN', min_score=60):
        """扫描期货市场，寻找符合条件的合约"""
        if futures_list is None:
            # 如果没有提供期货列表，获取市场所有期货
            futures_list = self.get_futures_market(market)
            
        recommendations = []
        
        total = len(futures_list)
        for i, symbol in enumerate(futures_list):
            try:
                report = self.analyze_futures(symbol, market)
                if report['score'] >= min_score:
                    recommendations.append(report)
                # 打印进度
                if (i + 1) % 5 == 0 or (i + 1) == total:
                    self.logger.info(f"已分析 {i + 1}/{total} 个期货合约")
            except Exception as e:
                self.logger.error(f"分析期货 {symbol} 时出错: {str(e)}")
                continue
                
        # 按得分排序
        recommendations.sort(key=lambda x: x['score'], reverse=True)
        return recommendations
    
    def get_futures_market(self, market='CN'):
        """获取市场所有期货代码"""
        import akshare as ak
        
        try:
            if market == 'CN':
                # 获取国内期货
                futures_info_df = ak.futures_zh_spot()
                return futures_info_df['symbol'].tolist()
                
            elif market == 'GLOBAL':
                # 获取国际期货
                # 这里可能需要根据实际API调整
                # 暂时返回一些常见的国际期货代码
                return ["CL", "GC", "SI", "HG", "NG"]
                
            else:
                raise ValueError(f"不支持的市场类型: {market}")
                
        except Exception as e:
            self.logger.error(f"获取期货市场列表失败: {str(e)}")
            raise
