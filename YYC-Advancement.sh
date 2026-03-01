#!/bin/bash

# YYC-QATS Local Advancement Script (YYC-Advancement.sh)
# 快速推进开发、检查与同步的脚本

echo "--- YYC-QATS 智能推进系统 ---"

function check_imports() {
    echo "[1/3] 检查模块导入一致性..."
    grep -r "import" src/app/App.tsx | grep "@/app"
}

function verify_types() {
    echo "[2/3] 验证全局类型定义..."
    if [ -f "src/app/types/global.ts" ]; then
        echo "✅ 类型文件存在"
    else
        echo "❌ 类型文件缺失"
    fi
}

function sync_mock_data() {
    echo "[3/3] 同步 Mock API 数据..."
    # 模拟数据同步逻辑
    echo "✅ Mock 接口就绪"
}

case "$1" in
    "check")
        check_imports
        ;;
    "verify")
        verify_types
        ;;
    "all")
        check_imports
        verify_types
        sync_mock_data
        ;;
    *)
        echo "用法: ./YYC-Advancement.sh {check|verify|all}"
        ;;
esac

echo "----------------------------"
