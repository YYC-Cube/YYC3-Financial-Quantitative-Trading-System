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

PRODUCTION_TS_OUT=$( { npx tsc --noEmit --pretty false 2>&1 || true; } )
PRODUCTION_ERRORS=$(printf '%s' "${PRODUCTION_TS_OUT}" | grep -c "error TS" || true)
PRODUCTION_ERRORS=${PRODUCTION_ERRORS:-0}

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

TEST_TS_OUT=$( { npx tsc --project tsconfig.test.json --noEmit --pretty false 2>&1 || true; } )
TEST_ERRORS=$(printf '%s' "${TEST_TS_OUT}" | grep -c "error TS" || true)
TEST_ERRORS=${TEST_ERRORS:-0}

if [ "${TEST_ERRORS}" -gt 0 ]; then
    echo "⚠️  Test code has ${TEST_ERRORS} type errors (non-blocking)"
    npx tsc --project tsconfig.test.json --noEmit 2>&1 | head -30 >> "${LOG_FILE}"
    TEST_TYPE_STATUS="WARN"
else
    echo "✅ Test code type check passed"
    TEST_TYPE_STATUS="PASS"
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

# 4 & 5. 测试执行 + 覆盖率检查（单次运行，同时产出结构化结果）
echo ""
echo "📋 Step 4: Test Execution & Coverage Verification"
echo "-------------------------------------------------"

VITEST_JSON="${REPORT_DIR}/vitest-result_${TIMESTAMP}.json"
COVERAGE_SUMMARY="coverage/coverage-summary.json"

VITEST_LOG="${REPORT_DIR}/vitest_${TIMESTAMP}.log"

# 单次运行：json 报告器写入文件（避免 stdout 干扰），同时生成覆盖率 json-summary
# 输出保留到日志，便于 CI 失败时定位（如 Node 版本不满足要求导致未执行任何用例）
npx vitest run \
    --reporter=json --outputFile="${VITEST_JSON}" \
    --coverage --coverage.reporter=json-summary --coverage.reporter=text \
    >"${VITEST_LOG}" 2>&1 || true

TESTS_PASSED=$(python3 -c "
import json
try:
    print(json.load(open('${VITEST_JSON}')).get('numPassedTests', 0))
except Exception:
    print(0)
" 2>/dev/null || echo 0)
TESTS_FAILED=$(python3 -c "
import json
try:
    print(json.load(open('${VITEST_JSON}')).get('numFailedTests', 0))
except Exception:
    print(0)
" 2>/dev/null || echo 0)
TESTS_PASSED=${TESTS_PASSED:-0}
TESTS_FAILED=${TESTS_FAILED:-0}

if [ "${TESTS_FAILED}" -gt 0 ] || [ "${TESTS_PASSED}" -eq 0 ]; then
    echo "❌ Tests failed or not detected (passed=${TESTS_PASSED}, failed=${TESTS_FAILED})"
    TEST_STATUS="FAIL"
else
    echo "✅ All ${TESTS_PASSED} tests passed"
    TEST_STATUS="PASS"
fi

# 覆盖率（读取 json-summary 的 statements 百分比）
STATEMENTS_COVERAGE=$(python3 -c "
import json
try:
    print(json.load(open('${COVERAGE_SUMMARY}'))['total']['statements']['pct'])
except Exception:
    print(0)
" 2>/dev/null || echo 0)
STATEMENTS_COVERAGE=${STATEMENTS_COVERAGE:-0}

COVERAGE_MIN=20.0

if awk "BEGIN{exit !(${STATEMENTS_COVERAGE} >= ${COVERAGE_MIN})}"; then
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
      "status": "${TEST_TYPE_STATUS}",
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
echo "Test Type Check:       ${TEST_TYPE_STATUS} (${TEST_ERRORS} errors)"
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
