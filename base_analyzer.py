import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import os
import requests
import json
from typing import Dict, List, Optional, Tuple
from dotenv import load_dotenv
import logging

class BaseAnalyzer:
    """基础分析器，包含共用的技术指标计算逻辑"""
    
    def __init__(self):
        # 设置日志
        logging.basicConfig(level=logging.INFO,
                          format='%(asctime)s - %(levelname)s - %(message)s')
        self.logger = logging.getLogger(__name__)
        
        # 加载环境变量
        load_dotenv()
        
        # 设置 LLM API
        self.llm_api_key = os.getenv('LLM_API_KEY')
        self.llm_api_base_url = os.getenv('LLM_API_BASE_URL', 'https://api.openai.com/v1')
        self.llm_model_name = os.getenv('LLM_MODEL_NAME', 'gpt-3.5-turbo')
        self.llm_api_type = os.getenv('LLM_API_TYPE', 'openai')
        
        # 配置参数
        self.params = {
            'ma_periods': {'short': 5, 'medium': 20, 'long': 60},
            'rsi_period': 14,
            'bollinger_period': 20,
            'bollinger_std': 2,
            'volume_ma_period': 20,
            'atr_period': 14
        }
    
    def _setup_logger(self):
        """设置日志记录器"""
        logging.basicConfig(level=logging.INFO,
                          format='%(asctime)s - %(levelname)s - %(message)s')
        return logging.getLogger(__name__)
    
    def _setup_params(self):
        """设置分析参数"""
        return {
            'ma_periods': {'short': 5, 'medium': 20, 'long': 60},
            'rsi_period': 14,
            'bollinger_period': 20,
            'bollinger_std': 2,
            'volume_ma_period': 20,
            'atr_period': 14
        }
    
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
            df['MA5'] = self.calculate_ema(df['close'], self.params['ma_periods']['short'])
            df['MA20'] = self.calculate_ema(df['close'], self.params['ma_periods']['medium'])
            df['MA60'] = self.calculate_ema(df['close'], self.params['ma_periods']['long'])
            
            # 计算RSI
            df['RSI'] = self.calculate_rsi(df['close'], self.params['rsi_period'])
            
            # 计算MACD
            df['MACD'], df['Signal'], df['MACD_hist'] = self.calculate_macd(df['close'])
            
            # 计算布林带
            df['BB_upper'], df['BB_middle'], df['BB_lower'] = self.calculate_bollinger_bands(
                df['close'],
                self.params['bollinger_period'],
                self.params['bollinger_std']
            )
            
            # 成交量分析
            df['Volume_MA'] = df['volume'].rolling(window=self.params['volume_ma_period']).mean()
            df['Volume_Ratio'] = df['volume'] / df['Volume_MA']
            
            # 计算ATR和波动率
            df['ATR'] = self.calculate_atr(df, self.params['atr_period'])
            df['Volatility'] = df['ATR'] / df['close'] * 100
            
            # 动量指标
            df['ROC'] = df['close'].pct_change(periods=10) * 100
            
            return df
            
        except Exception as e:
            self.logger.error(f"计算技术指标时出错: {str(e)}")
            raise
    
    def get_ai_analysis(self, df, code, market_type='stock'):
        """使用 LLM API 进行 AI 分析"""
        try:
            if not self.llm_api_key:
                self.logger.warning("未配置LLM API密钥，使用本地生成的分析报告")
                return self._generate_local_analysis(df, code, market_type)
                
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
            分析{market_type} {code}：

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
            if self.llm_api_type.lower() == "openai":
                return self._call_openai_api(prompt)
            elif self.llm_api_type.lower() == "azure":
                return self._call_azure_openai_api(prompt)
            elif self.llm_api_type.lower() == "custom":
                return self._call_custom_api(prompt)
            elif self.llm_api_type.lower() == "gemini" and hasattr(self, "gemini_api_key"):
                # 如果有Gemini API支持，则调用Gemini API
                self.logger.warning("Gemini API尚未实现，使用本地生成的分析报告")
                return self._generate_local_analysis(df, code, market_type)
            else:
                self.logger.warning(f"不支持的API类型: {self.llm_api_type}，使用本地生成的分析报告")
                return self._generate_local_analysis(df, code, market_type)
                
        except Exception as e:
            self.logger.error(f"AI 分析发生错误: {str(e)}")
            self.logger.info("使用本地生成的分析报告作为备选")
            return self._generate_local_analysis(df, code, market_type)
    
    def _call_openai_api(self, prompt):
        """调用OpenAI API"""
        headers = {
            "Authorization": f"Bearer {self.llm_api_key}",
            "Content-Type": "application/json"
        }
        
        data = {
            "model": self.llm_model_name,
            "messages": [{"role": "user", "content": prompt}],
            "temperature": 0.7,
            "max_tokens": 1000
        }
        
        response = requests.post(
            f"{self.llm_api_base_url}/chat/completions",
            headers=headers,
            json=data,
            timeout=30
        )
        
        if response.status_code == 200:
            result = response.json()
            return result['choices'][0]['message']['content']
        else:
            self.logger.error(f"OpenAI API调用失败: {response.status_code}, {response.text}")
            raise Exception(f"API调用失败: {response.status_code}")
    
    def _call_azure_openai_api(self, prompt):
        """调用Azure OpenAI API"""
        headers = {
            "api-key": self.llm_api_key,
            "Content-Type": "application/json"
        }
        
        data = {
            "messages": [{"role": "user", "content": prompt}],
            "temperature": 0.7,
            "max_tokens": 1000
        }
        
        # Azure OpenAI API需要在URL中指定部署名称
        deployment_name = self.llm_model_name
        response = requests.post(
            f"{self.llm_api_base_url}/openai/deployments/{deployment_name}/chat/completions?api-version=2023-05-15",
            headers=headers,
            json=data,
            timeout=30
        )
        
        if response.status_code == 200:
            result = response.json()
            return result['choices'][0]['message']['content']
        else:
            self.logger.error(f"Azure OpenAI API调用失败: {response.status_code}, {response.text}")
            raise Exception(f"API调用失败: {response.status_code}")
    
    def _call_custom_api(self, prompt):
        """调用自定义API"""
        headers = {
            "Authorization": f"Bearer {self.llm_api_key}",
            "Content-Type": "application/json"
        }
        
        data = {
            "model": self.llm_model_name,
            "messages": [{"role": "user", "content": prompt}],
            "temperature": 0.7,
            "max_tokens": 1000
        }
        
        response = requests.post(
            f"{self.llm_api_base_url}/chat/completions",
            headers=headers,
            json=data,
            timeout=30
        )
        
        if response.status_code == 200:
            result = response.json()
            # 尝试兼容不同的API响应格式
            if 'choices' in result and len(result['choices']) > 0:
                if 'message' in result['choices'][0]:
                    return result['choices'][0]['message']['content']
                elif 'text' in result['choices'][0]:
                    return result['choices'][0]['text']
            
            self.logger.error(f"无法解析API响应: {json.dumps(result)}")
            raise Exception("无法解析API响应")
        else:
            self.logger.error(f"自定义API调用失败: {response.status_code}, {response.text}")
            raise Exception(f"API调用失败: {response.status_code}")
    
    def _generate_local_analysis(self, df, code, market_type='stock'):
        """生成本地分析报告（作为API调用失败的备选）"""
        if market_type == 'stock':
            market_name = "股票"
        else:
            market_name = "期货"
            
        trend = "上升" if df.iloc[-1]['MA5'] > df.iloc[-1]['MA20'] else "下降"
        rsi_status = "超买" if df.iloc[-1]['RSI'] > 70 else "超卖" if df.iloc[-1]['RSI'] < 30 else "中性"
        
        return f"""
        {market_name} {code} 技术分析报告：
        
        1. 趋势分析：
           当前处于{trend}趋势。短期移动平均线(MA5)位于{df.iloc[-1]['MA5']:.2f}，
           中期移动平均线(MA20)位于{df.iloc[-1]['MA20']:.2f}。
           支撑位：{df.iloc[-1]['low']:.2f}
           压力位：{df.iloc[-1]['high']:.2f}
        
        2. 成交量分析：
           成交量比率为{df.iloc[-1]['Volume_Ratio']:.2f}，
           {"成交量放大，表明当前趋势得到确认" if df.iloc[-1]['Volume_Ratio'] > 1.2 else "成交量萎缩，表明可能出现趋势转变"}。
        
        3. 风险评估：
           波动率：{df.iloc[-1]['Volatility']:.2f}%
           {"波动率较高，建议谨慎操作" if df.iloc[-1]['Volatility'] > 3 else "波动率适中，可考虑适量参与"}
        
        4. 目标价位：
           短期目标：{df.iloc[-1]['close'] * (1.05 if trend == "上升" else 0.95):.2f}
           中期目标：{df.iloc[-1]['close'] * (1.10 if trend == "上升" else 0.90):.2f}
        
        5. 技术指标：
           RSI：{df.iloc[-1]['RSI']:.2f}（{rsi_status}）
           MACD：{"金叉，看涨信号" if df.iloc[-1]['MACD'] > df.iloc[-1]['Signal'] and df.iloc[-1]['MACD_hist'] > 0 else "死叉，看跌信号"}
        
        6. 交易建议：
           {"建议买入，止损位设置在 " + f"{df.iloc[-1]['close'] * 0.95:.2f}" if trend == "上升" and df.iloc[-1]['RSI'] < 70 else "建议观望" if 30 <= df.iloc[-1]['RSI'] <= 70 else "建议卖出，止损位设置在 " + f"{df.iloc[-1]['close'] * 1.05:.2f}"}
        """
    
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
