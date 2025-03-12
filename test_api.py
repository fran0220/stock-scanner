#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
股票与期货分析系统API测试脚本
用于测试API服务器是否正常工作
"""

import requests
import json
import sys
import time
from datetime import datetime

# API基础URL
BASE_URL = "http://localhost:8000"

def print_colored(text, color="green"):
    """打印彩色文本"""
    colors = {
        "green": "\033[92m",
        "red": "\033[91m",
        "yellow": "\033[93m",
        "blue": "\033[94m",
        "end": "\033[0m"
    }
    print(f"{colors.get(color, '')}{text}{colors['end']}")

def test_health_check():
    """测试健康检查接口"""
    try:
        response = requests.get(f"{BASE_URL}/health")
        if response.status_code == 200:
            print_colored("✅ 健康检查接口测试通过")
            return True
        else:
            print_colored(f"❌ 健康检查接口测试失败: {response.status_code}", "red")
            return False
    except Exception as e:
        print_colored(f"❌ 健康检查接口测试失败: {str(e)}", "red")
        return False

def test_stock_analysis():
    """测试股票分析接口"""
    try:
        # 测试单只股票分析
        data = {
            "stock_code": "600000",
            "market": "A"
        }
        response = requests.post(f"{BASE_URL}/api/stock/analyze", json=data)
        if response.status_code == 200:
            result = response.json()
            print_colored("✅ 单只股票分析接口测试通过")
            print_colored(f"   分析结果: {json.dumps(result, ensure_ascii=False, indent=2)}", "blue")
            return True
        else:
            print_colored(f"❌ 单只股票分析接口测试失败: {response.status_code}", "red")
            return False
    except Exception as e:
        print_colored(f"❌ 单只股票分析接口测试失败: {str(e)}", "red")
        return False

def test_futures_analysis():
    """测试期货分析接口"""
    try:
        # 测试单个期货分析
        data = {
            "futures_code": "IF2406",
            "market": "CN"
        }
        response = requests.post(f"{BASE_URL}/api/futures/analyze", json=data)
        if response.status_code == 200:
            result = response.json()
            print_colored("✅ 单个期货分析接口测试通过")
            print_colored(f"   分析结果: {json.dumps(result, ensure_ascii=False, indent=2)}", "blue")
            return True
        else:
            print_colored(f"❌ 单个期货分析接口测试失败: {response.status_code}", "red")
            return False
    except Exception as e:
        print_colored(f"❌ 单个期货分析接口测试失败: {str(e)}", "red")
        return False

def main():
    """主函数"""
    print_colored(f"开始测试股票与期货分析系统API - {datetime.now()}", "yellow")
    print_colored("=" * 60, "yellow")
    
    # 等待API服务器启动
    print_colored("等待API服务器启动...", "yellow")
    time.sleep(2)
    
    # 测试健康检查
    health_ok = test_health_check()
    if not health_ok:
        print_colored("API服务器未正常运行，请先启动服务器", "red")
        sys.exit(1)
    
    print_colored("-" * 60, "yellow")
    
    # 测试股票分析
    stock_ok = test_stock_analysis()
    
    print_colored("-" * 60, "yellow")
    
    # 测试期货分析
    futures_ok = test_futures_analysis()
    
    print_colored("=" * 60, "yellow")
    
    # 测试结果汇总
    if health_ok and stock_ok and futures_ok:
        print_colored("🎉 所有测试通过！API服务器工作正常", "green")
    else:
        print_colored("⚠️ 部分测试未通过，请检查API服务器日志", "red")

if __name__ == "__main__":
    main()
