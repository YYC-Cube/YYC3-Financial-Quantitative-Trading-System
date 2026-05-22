#!/bin/bash

# CI/CD Test Baseline Monitor
# Phase4 - Performance & Quality Gate
# Author: Intelligent Application Implementation Expert

set -e

echo "🔍 YYC3 Financial Quantitative Trading System"
echo "═══════════════════════════════════════════"
echo "📊 CI/CD Baseline Monitor"
echo "═══════════════════════════════════════════"
echo ""

# Configuration
BASELINE_DIR=".baseline"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
REPORT_FILE="${BASELINE_DIR}/report_${TIMESTAMP}.json"

mkdir -p ${BASELINE_DIR}

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Baseline thresholds (from Phase4 optimization)
BASELINE_DURATION_MAX=3500  # 3.5s target
BASELINE_COVERAGE_MIN=12.0   # 12% minimum
BASELINE_AS_ANY_MAX=25       # Maximum allowed 'as any'
BASELINE_TEST_COUNT_MIN=570  # Minimum test count

echo -e "${BLUE}⏱️ Running Tests...${NC}"
START_TIME=$(date +%s%N)

# Run tests with coverage
TEST_OUTPUT=$(pnpm vitest run --coverage 2>&1) || true

END_TIME=$(date +%s%N)
DURATION=$(( (END_TIME - START_TIME) / 1000000 ))

echo ""
echo -e "${BLUE}📈 Analyzing Results...${NC}"

# Extract metrics from output
TEST_FILES=$(echo "$TEST_OUTPUT" | grep -oP '\d+(?=\s+passed\s+\(.*\))' | head -1)
TESTS_PASSED=$(echo "$TEST_OUTPUT" | grep -oP '\d+(?=\s+passed\s+\(.*\))' | tail -1)
STATEMENTS_COVERAGE=$(echo "$TEST_OUTPUT" | grep -oP '(?<=Statements\s+:)\s*\d+\.\d+' | tr -d ' ')
AS_ANY_COUNT=$(grep -r "as any" src --include='*.test.ts' | wc -l | tr -d ' ')

echo ""
echo "═══════════════════════════════════════════"
echo -e "${YELLOW}📊 Test Results Summary${NC}"
echo "═══════════════════════════════════════════"
echo ""

# Duration check
echo -n "⏱️  Execution Time: "
if [ $DURATION -le $BASELINE_DURATION_MAX ]; then
    echo -e "${GREEN}${DURATION}ms ✅ (≤${BASELINE_DURATION_MAX}ms)${NC}"
else
    echo -e "${RED}${DURATION}ms ❌ (>${BASELINE_DURATION_MAX}ms)${NC}"
fi

# Coverage check
echo -n "📈 Statements Coverage: "
if [ ! -z "$STATEMENTS_COVERAGE" ]; then
    COVERAGE_NUM=$(echo $STATEMENTS_COVERAGE | awk '{printf "%.2f", $1}')
    if (( $(echo "$COVERAGE_NUM >= $BASELINE_COVERAGE_MIN" | bc -l) )); then
        echo -e "${GREEN}${COVERAGE_NUM}% ✅ (≥${BASELINE_COVERAGE_MIN}%)${NC}"
    else
        echo -e "${RED}${COVERAGE_NUM}% ❌ (<${BASELINE_COVERAGE_MIN}%)${NC}"
    fi
else
    echo -e "${YELLOW}N/A ⚠️${NC}"
fi

# AS ANY count check
echo -n "🔧 Type Safety (as any): "
if [ $AS_ANY_COUNT -le $BASELINE_AS_ANY_MAX ]; then
    echo -e "${GREEN}${AS_ANY_COUNT} ✅ (≤${BASELINE_AS_ANY_MAX})${NC}"
else
    echo -e "${RED}${AS_ANY_COUNT} ❌ (>${BASELINE_AS_ANY_MAX})${NC}"
fi

# Test count check
echo -n "🧪 Total Tests: "
if [ ! -z "$TESTS_PASSED" ]; then
    if [ $TESTS_PASSED -ge $BASELINE_TEST_COUNT_MIN ]; then
        echo -e "${GREEN}${TESTS_PASSED} ✅ (≥${BASELINE_TEST_COUNT_MIN})${NC}"
    else
        echo -e "${RED}${TESTS_PASSED} ❌ (<${BASELINE_TEST_COUNT_MIN})${NC}"
    fi
else
    echo -e "${YELLOW}N/A ⚠️${NC}"
fi

echo ""
echo "═══════════════════════════════════════════"
echo -e "${BLUE}💾 Saving Report...${NC}"

# Generate JSON report
cat > ${REPORT_FILE} << EOF
{
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "metrics": {
    "duration_ms": ${DURATION},
    "duration_threshold_ms": ${BASELINE_DURATION_MAX},
    "coverage_percent": ${STATEMENTS_COVERAGE:-0},
    "coverage_threshold_percent": ${BASELINE_COVERAGE_MIN},
    "as_any_count": ${AS_ANY_COUNT},
    "as_any_threshold": ${BASELINE_AS_ANY_MAX},
    "tests_passed": ${TESTS_PASSED:-0},
    "test_count_threshold": ${BASELINE_TEST_COUNT_MIN}
  },
  "status": {
    "duration_pass": $([ $DURATION -le $BASELINE_DURATION_MAX ] && echo true || echo false),
    "coverage_pass": $(if [ ! -z "$STATEMENTS_COVERAGE" ] && (( $(echo "$STATEMENTS_COVERAGE >= $BASELINE_COVERAGE_MIN" | bc -l) )); then echo true; else echo false; fi),
    "type_safety_pass": $([ $AS_ANY_COUNT -le $BASELINE_AS_ANY_MAX ] && echo true || echo false),
    "test_count_pass": $([ ! -z "$TESTS_PASSED" ] && [ $TESTS_PASSED -ge $BASELINE_TEST_COUNT_MIN ] && echo true || echo false)
  }
}
EOF

echo -e "${GREEN}✅ Report saved to: ${REPORT_FILE}${NC}"
echo ""

# Final status
PASS=true
if [ $DURATION -gt $BASELINE_DURATION_MAX ]; then PASS=false; fi
if [ ! -z "$STATEMENTS_COVERAGE" ] && (( $(echo "$STATEMENTS_COVERAGE < $BASELINE_COVERAGE_MIN" | bc -l) )); then PASS=false; fi
if [ $AS_ANY_COUNT -gt $BASELINE_AS_ANY_MAX ]; then PASS=false; fi
if [ ! -z "$TESTS_PASSED" ] && [ $TESTS_PASSED -lt $BASELINE_TEST_COUNT_MIN ]; then PASS=false; fi

if [ "$PASS" = true ]; then
    echo -e "${GREEN}🎉 All Quality Gates PASSED!${NC}"
    exit 0
else
    echo -e "${RED}❌ Some Quality Gates FAILED!${NC}"
    exit 1
fi
