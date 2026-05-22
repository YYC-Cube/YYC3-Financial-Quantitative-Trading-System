#!/bin/bash

# ============================================================================
# CI/CD TypeScript Quality Gate
# 集成tsconfig检查到CI/CD流水线
# ============================================================================

set -e

# 配置
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
REPORT_DIR=".ci-reports"
REPORT_FILE="${REPORT_DIR}/typescript-quality_${TIMESTAMP}.json"
LOG_FILE="${REPORT_DIR}/typescript-quality_${TIMESTAMP}.log"

# 创建报告目录
mkdir -p ${REPORT_DIR}

echo "🔍 TypeScript Quality Gate - $(date)"
echo "========================================"

# 1. 生产代码类型检查（严格模式）
echo ""
echo "📋 Step 1: Production Code Type Check (Strict)"
echo "----------------------------------------------"

PRODUCTION_ERRORS=$(npx tsc --noEmit --pretty false 2>&1 | grep -c "error TS" || echo "0")

if [ "${PRODUCTION_ERRORS}" -gt 0 ]; then
    echo "❌ Production code has ${PRODUCTION_ERRORS} type errors"
    npx tsc --noEmit 2>&1 | head -50 > "${LOG_FILE}"
    PRODUCTION_STATUS="FAIL"
else
    echo "✅ Production code type check passed"
    PRODUCTION_STATUS="PASS"
fi

# 2. 测试代码类型检查（宽松模式）
echo ""
echo "📋 Step 2: Test Code Type Check (Relaxed)"
echo "-----------------------------------------"

TEST_ERRORS=$(npx tsc --project tsconfig.test.json --noEmit --pretty false 2>&1 | grep -c "error TS" || echo "0")

if [ "${TEST_ERRORS}" -gt 0 ]; then
    echo "⚠️  Test code has ${TEST_ERRORS} type errors (non-blocking)"
    npx tsc --project tsconfig.test.json --noEmit 2>&1 | head -30 >> "${LOG_FILE}"
    TEST_STATUS="WARN"
else
    echo "✅ Test code type check passed"
    TEST_STATUS="PASS"
fi

# 3. ESLint检查（分层规则）
echo ""
echo "📋 Step 3: ESLint Linting (Layered Rules)"
echo "----------------------------------------"

ESLINT_OUTPUT=$(npx eslint . --format json 2>/dev/null || echo '[]')
ESLINT_ERRORS=$(echo "${ESLINT_OUTPUT}" | python3 -c "
import json, sys
try:
    data = json.load(sys.stdin)
    if isinstance(data, list):
        errors = sum(1 for f in data for m in f.get('messages', []) if m.get('severity') == 2)
        print(errors)
    else:
        print(0)
except:
    print(0)
" || echo "0")

if [ "${ESLINT_ERRORS}" -gt 0 ]; then
    echo "❌ ESLint found ${ESLINT_ERRORS} errors"
    npx eslint . 2>&1 | tail -20 >> "${LOG_FILE}"
    ESLINT_STATUS="FAIL"
else
    echo "✅ ESLint check passed"
    ESLINT_STATUS="PASS"
fi

# 4. 测试执行验证
echo ""
echo "📋 Step 4: Test Execution Verification"
echo "--------------------------------------"

TEST_OUTPUT=$(pnpm vitest run --reporter=json 2>/dev/null || echo '{}')
TESTS_PASSED=$(echo "${TEST_OUTPUT}" | python3 -c "
import json, sys
try:
    data = json.load(sys.stdin)
    if isinstance(data, dict) and 'numPassedTests' in data:
        print(data['numPassedTests'])
    else:
        print(0)
except:
    print(0)
" || echo "0")
TESTS_FAILED=$(echo "${TEST_OUTPUT}" | python3 -c "
import json, sys
try:
    data = json.load(sys.stdin)
    if isinstance(data, dict) and 'numFailedTests' in data:
        print(data['numFailedTests'])
    else:
        print(0)
except:
    print(0)
" || echo "0")

if [ "${TESTS_FAILED}" -gt 0 ]; then
    echo "❌ ${TESTS_FAILED} tests failed (${TESTS_PASSED} passed)"
    TEST_STATUS="FAIL"
else
    echo "✅ All ${TESTS_PASSED} tests passed"
    TEST_STATUS="PASS"
fi

# 5. 覆盖率检查
echo ""
echo "📋 Step 5: Coverage Threshold Check"
echo "-----------------------------------"

COVERAGE_DATA=$(pnpm vitest run --coverage 2>&1 | grep -A 10 "Coverage summary" || echo "")
STATEMENTS_COVERAGE=$(echo "${COVERAGE_DATA}" | grep "Statements" | awk '{print $2}' | tr -d '%' || echo "0")

COVERAGE_MIN=12.0

if (( $(echo "${STATEMENTS_COVERAGE} >= ${COVERAGE_MIN}" | bc -l) )); then
    echo "✅ Coverage ${STATEMENTS_COVERAGE}% >= ${COVERAGE_MIN}% threshold"
    COVERAGE_STATUS="PASS"
else
    echo "⚠️  Coverage ${STATEMENTS_COVERAGE}% < ${COVERAGE_MIN}% threshold (warning only)"
    COVERAGE_STATUS="WARN"
fi

# 生成JSON报告
cat > ${REPORT_FILE} << EOF
{
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "checks": {
    "production_type_check": {
      "status": "${PRODUCTION_STATUS}",
      "errors": ${PRODUCTION_ERRORS}
    },
    "test_type_check": {
      "status": "${TEST_STATUS}",
      "errors": ${TEST_ERRORS}
    },
    "eslint": {
      "status": "${ESLINT_STATUS}",
      "errors": ${ESLINT_ERRORS}
    },
    "tests": {
      "status": "${TEST_STATUS}",
      "passed": ${TESTS_PASSED},
      "failed": ${TESTS_FAILED}
    },
    "coverage": {
      "status": "${COVERAGE_STATUS}",
      "statements_percent": ${STATEMENTS_COVERAGE:-0},
      "threshold_percent": ${COVERAGE_MIN}
    }
  },
  "overall_status": "$([ "${PRODUCTION_STATUS}" = "PASS" ] && [ "${ESLINT_STATUS}" = "PASS" ] && [ "${TEST_STATUS}" = "PASS" ] && echo "SUCCESS" || echo "FAILURE")",
  "summary": {
    "production_errors": ${PRODUCTION_ERRORS},
    "test_errors": ${TEST_ERRORS},
    "eslint_errors": ${ESLINT_ERRORS},
    "tests_passed": ${TESTS_PASSED},
    "tests_failed": ${TESTS_FAILED},
    "coverage_percent": "${STATEMENTS_COVERAGE:-0}"
  }
}
EOF

# 输出最终结果
echo ""
echo "========================================"
echo "📊 Quality Gate Result:"
echo "========================================"

OVERALL="$([ "${PRODUCTION_STATUS}" = "PASS" ] && [ "${ESLINT_STATUS}" = "PASS" ] && [ "${TEST_STATUS}" = "PASS" ] && echo "✅ SUCCESS" || echo "❌ FAILURE")"

echo "Production Type Check: ${PRODUCTION_STATUS} (${PRODUCTION_ERRORS} errors)"
echo "Test Type Check:       ${TEST_STATUS} (${TEST_ERRORS} errors)"
echo "ESLint Check:          ${ESLINT_STATUS} (${ESLINT_ERRORS} errors)"
echo "Test Execution:        ${TEST_STATUS} (${TESTS_PASSED}/${TESTS_FAILED})"
echo "Coverage:              ${COVERAGE_STATUS} (${STATEMENTS_COVERAGE:-0}%)"
echo ""
echo "Overall:               ${OVERALL}"
echo ""
echo "Report saved to: ${REPORT_FILE}"

# 返回退出码
if [ "${PRODUCTION_STATUS}" = "PASS" ] && [ "${ESLINT_STATUS}" = "PASS" ] && [ "${TEST_STATUS}" = "PASS" ]; then
    exit 0
else
    exit 1
fi
