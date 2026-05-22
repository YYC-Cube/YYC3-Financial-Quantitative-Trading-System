/**
 * @file src/app/components/D3CandlestickChart.tsx
 * @description YYC3 D3.js K线图组件,基于D3.js的SVG蜡烛图,支持缩放、平移、十字准星、MA/EMA/BOLL指标、成交量子图
 * @author YanYuCloudCube Team <admin@0379.email>
 * @version v1.0.0
 * @created 2026-03-20
 * @updated 2026-03-20
 * @status stable
 * @license MIT
 * @copyright Copyright (c) 2026 YanYuCloudCube Team
 * @tags component,react,typescript,chart,public
 * @depends react,d3,@/app/contexts/SettingsContext
 */

/**
 * YYC-QATS D3.js Candlestick Chart (Phase 16B → Phase 17B Enhanced)
 * ──────────────────────────────────────────────────────────────────
 * SVG-based K-line candlestick chart powered by D3.js.
 * Features:
 *   - D3 scales (scaleLinear for index-based x axis)
 *   - d3-zoom: scroll zoom + drag pan (Phase 17B)
 *   - Crosshair snapping to nearest K-line (Phase 17B)
 *   - MA / EMA / BOLL overlays
 *   - Volume sub-chart
 *   - Responsive resize (ResizeObserver)
 *   - Dark-only chart (preserves dark bg in light theme)
 *   - Zoom reset button
 *   - No forwardRef, no radix-ui
 */


import { area, curveMonotoneX, line, max, pointer, scaleLinear, select, zoom, zoomIdentity } from 'd3';
import React, { useCallback, useEffect, useRef, useState } from 'react';

const d3 = {
  select,
  pointer,
  scaleLinear,
  max,
  line,
  area,
  zoom,
  zoomIdentity,
  curveMonotoneX,
} as const;

import { useSettings } from '@/app/contexts/SettingsContext';

// ─── Types ───

export interface CandleDataPoint {
  time: number;     // unix ms
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export type OverlayType = 'ma' | 'ema' | 'boll' | 'none';

interface D3CandlestickChartProps {
  data: CandleDataPoint[];
  width?: number;
  height?: number;
  overlay?: OverlayType;
  showVolume?: boolean;
  symbol?: string;
  /** External current price for live line */
  livePrice?: number;
}

// ─── Indicator Calculations ───

function calcSMA(data: CandleDataPoint[], period: number): (number | null)[] {
  return data.map((_, i) => {
    if (i < period - 1) return null;
    let sum = 0;
    for (let j = i - period + 1; j <= i; j++) sum += data[j].close;
    return sum / period;
  });
}

function calcEMA(data: CandleDataPoint[], period: number): (number | null)[] {
  const k = 2 / (period + 1);
  const result: (number | null)[] = [];
  let ema: number | null = null;
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      result.push(null);
    } else if (ema === null) {
      let sum = 0;
      for (let j = i - period + 1; j <= i; j++) sum += data[j].close;
      ema = sum / period;
      result.push(ema);
    } else {
      ema = data[i].close * k + ema * (1 - k);
      result.push(ema);
    }
  }
  return result;
}

function calcBOLL(data: CandleDataPoint[], period: number = 20, mult: number = 2) {
  const middle = calcSMA(data, period);
  const upper: (number | null)[] = [];
  const lower: (number | null)[] = [];
  for (let i = 0; i < data.length; i++) {
    if (middle[i] === null) { upper.push(null); lower.push(null); continue; }
    let sumSq = 0;
    for (let j = i - period + 1; j <= i; j++) sumSq += Math.pow(data[j].close - middle[i]!, 2);
    const std = Math.sqrt(sumSq / period);
    upper.push(middle[i]! + mult * std);
    lower.push(middle[i]! - mult * std);
  }
  return { upper, middle, lower };
}

// ─── Component ───

export const D3CandlestickChart: React.FC<D3CandlestickChartProps> = ({
  data,
  width: propWidth,
  height: propHeight = 480,
  overlay = 'ma',
  showVolume = true,
  symbol = 'BTC/USDT',
  livePrice,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  const [dimensions, setDimensions] = useState({ width: propWidth || 800, height: propHeight });
  const [crosshair, setCrosshair] = useState<{ x: number; y: number; candle: CandleDataPoint | null } | null>(null);
  const [isZoomed, setIsZoomed] = useState(false);
  const { getUpColor, getDownColor } = useSettings();

  const upColor = getUpColor();
  const downColor = getDownColor();

  // Responsive sizing
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width } = entry.contentRect;
        if (width > 0) setDimensions({ width, height: propHeight });
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [propHeight]);

  // Main D3 render with zoom support
  const renderChart = useCallback(() => {
    const svgEl = svgRef.current;
    if (!svgEl || data.length === 0) return;
    const svg = d3.select(svgEl as SVGSVGElement);

    svg.selectAll('*').remove();

    const W = dimensions.width;
    const H = dimensions.height;
    const margin = { top: 24, right: 70, bottom: showVolume ? 80 : 30, left: 10 };
    const chartW = W - margin.left - margin.right;
    const volumeH = showVolume ? 50 : 0;
    const priceH = H - margin.top - margin.bottom - volumeH;

    if (chartW <= 0 || priceH <= 0) return;

    // Clip path for zoom
    svg.append('defs').append('clipPath')
      .attr('id', 'chart-clip')
      .append('rect')
      .attr('width', chartW)
      .attr('height', priceH + volumeH + 10);

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);
    const chartContent = g.append('g').attr('clip-path', 'url(#chart-clip)');

    // ── Base Scales ──
    const baseXScale = d3.scaleLinear().domain([0, data.length - 1]).range([0, chartW]);

    const allPrices = data.flatMap(d => [d.high, d.low]);
    const [minP, maxP] = [Math.min(...allPrices) * 0.999, Math.max(...allPrices) * 1.001];
    const yScale = d3.scaleLinear().domain([minP, maxP]).range([priceH, 0]);

    // Current (zoomed) x scale — starts as copy of base
    let xScale = baseXScale.copy();

    // ── Render function (called on zoom) ──
    function renderContent(transform?: d3.ZoomTransform) {
      chartContent.selectAll('*').remove();
      // Also clear non-clipped elements like grid labels
      g.selectAll('.grid-labels').remove();
      g.selectAll('.price-axis').remove();

      // Apply zoom transform to xScale
      if (transform) {
        xScale = transform.rescaleX(baseXScale);
      } else {
        xScale = baseXScale.copy();
      }

      // Determine visible range
      const x0 = Math.max(0, Math.floor(xScale.invert(0)));
      const x1 = Math.min(data.length - 1, Math.ceil(xScale.invert(chartW)));
      const visibleData = data.slice(x0, x1 + 1);

      if (visibleData.length === 0) return;

      // Recalculate y scale for visible data
      const visiblePrices = visibleData.flatMap(d => [d.high, d.low]);
      const [vMinP, vMaxP] = [Math.min(...visiblePrices) * 0.999, Math.max(...visiblePrices) * 1.001];
      yScale.domain([vMinP, vMaxP]);

      const candleWidth = Math.max(1, Math.abs(xScale(1) - xScale(0)) * 0.6);

      // ── Grid ──
      const gridG = chartContent.append('g').attr('class', 'grid');
      const yTicks = yScale.ticks(5);
      yTicks.forEach(tick => {
        gridG.append('line')
          .attr('x1', 0).attr('x2', chartW)
          .attr('y1', yScale(tick)).attr('y2', yScale(tick))
          .attr('stroke', '#233554').attr('stroke-width', 0.5);
      });

      // Price axis labels (outside clip)
      const axisG = g.append('g').attr('class', 'price-axis');
      yTicks.forEach(tick => {
        axisG.append('text')
          .attr('x', chartW + 6).attr('y', yScale(tick) + 3)
          .attr('fill', '#8892B0').attr('font-size', '10px').attr('font-family', 'monospace')
          .text(tick.toFixed(tick > 100 ? 2 : 4));
      });

      // Time labels (outside clip)
      const labelsG = g.append('g').attr('class', 'grid-labels');
      const timeStep = Math.max(1, Math.floor(visibleData.length / 7));
      for (let i = 0; i < visibleData.length; i += timeStep) {
        const dataIdx = x0 + i;
        const x = xScale(dataIdx);
        if (x < 0 || x > chartW) continue;
        const date = new Date(visibleData[i].time);
        const label = `${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}`;
        labelsG.append('text')
          .attr('x', x).attr('y', priceH + volumeH + 18)
          .attr('fill', '#8892B0').attr('font-size', '10px').attr('text-anchor', 'middle').attr('font-family', 'monospace')
          .text(label);
      }

      // ── Volume Bars ──
      if (showVolume) {
        const visMaxVol = d3.max(visibleData, d => d.volume) || 1;
        const visVolScale = d3.scaleLinear().domain([0, visMaxVol]).range([volumeH, 0]);
        const volG = chartContent.append('g').attr('transform', `translate(0,${priceH})`);
        visibleData.forEach((d, i) => {
          const dataIdx = x0 + i;
          const x = xScale(dataIdx);
          if (x < -candleWidth || x > chartW + candleWidth) return;
          const isUpV = d.close >= d.open;
          volG.append('rect')
            .attr('x', x - candleWidth / 2)
            .attr('y', visVolScale(d.volume))
            .attr('width', candleWidth)
            .attr('height', Math.max(0, volumeH - visVolScale(d.volume)))
            .attr('fill', isUpV ? upColor + '40' : downColor + '40');
        });
      }

      // ── Indicator Overlays ──
      const drawOverlayLine = (values: (number | null)[], color: string, width: number = 1.2) => {
        const lineData: { x: number; y: number }[] = [];
        values.forEach((v, i) => {
          if (v !== null) {
            const px = xScale(i);
            if (px >= -20 && px <= chartW + 20) {
              lineData.push({ x: px, y: yScale(v) });
            }
          }
        });
        if (lineData.length < 2) return;
        const line = d3.line<{ x: number; y: number }>().x(d => d.x).y(d => d.y).curve(d3.curveMonotoneX);
        chartContent.append('path').datum(lineData).attr('d', line).attr('fill', 'none').attr('stroke', color).attr('stroke-width', width);
      };

      if (overlay === 'ma') {
        drawOverlayLine(calcSMA(data, 10), '#ECC94B');
        drawOverlayLine(calcSMA(data, 30), '#4299E1');
      } else if (overlay === 'ema') {
        drawOverlayLine(calcEMA(data, 12), '#9F7AEA');
        drawOverlayLine(calcEMA(data, 26), '#F56565');
      } else if (overlay === 'boll') {
        const boll = calcBOLL(data, 20, 2);
        drawOverlayLine(boll.upper, '#38B2AC', 0.8);
        drawOverlayLine(boll.middle, '#ECC94B', 0.8);
        drawOverlayLine(boll.lower, '#F56565', 0.8);
        const areaData: { x: number; upper: number; lower: number }[] = [];
        data.forEach((_, i) => {
          if (boll.upper[i] !== null && boll.lower[i] !== null) {
            const px = xScale(i);
            if (px >= -20 && px <= chartW + 20) {
              areaData.push({ x: px, upper: yScale(boll.upper[i]!), lower: yScale(boll.lower[i]!) });
            }
          }
        });
        if (areaData.length > 1) {
          const area = d3.area<{ x: number; upper: number; lower: number }>()
            .x(d => d.x).y0(d => d.lower).y1(d => d.upper).curve(d3.curveMonotoneX);
          chartContent.append('path').datum(areaData).attr('d', area).attr('fill', '#38B2AC').attr('fill-opacity', 0.05);
        }
      }

      // ── Candlesticks ──
      const candleG = chartContent.append('g').attr('class', 'candles');
      visibleData.forEach((d, i) => {
        const dataIdx = x0 + i;
        const x = xScale(dataIdx);
        if (x < -candleWidth || x > chartW + candleWidth) return;
        const isUpC = d.close >= d.open;
        const color = isUpC ? upColor : downColor;

        // Wick
        candleG.append('line')
          .attr('x1', x).attr('x2', x)
          .attr('y1', yScale(d.high)).attr('y2', yScale(d.low))
          .attr('stroke', color).attr('stroke-width', 1);

        // Body
        const bodyTop = yScale(Math.max(d.open, d.close));
        const bodyBottom = yScale(Math.min(d.open, d.close));
        const bodyH = Math.max(1, bodyBottom - bodyTop);

        candleG.append('rect')
          .attr('x', x - candleWidth / 2)
          .attr('y', bodyTop)
          .attr('width', candleWidth)
          .attr('height', bodyH)
          .attr('fill', isUpC ? '#071425' : color)
          .attr('stroke', color)
          .attr('stroke-width', isUpC ? 1 : 0);
      });

      // ── Live Price Line ──
      const lastCandle = data[data.length - 1];
      const displayPrice = livePrice ?? lastCandle.close;
      if (displayPrice >= vMinP && displayPrice <= vMaxP) {
        const priceY = yScale(displayPrice);
        const priceColor = displayPrice >= lastCandle.open ? upColor : downColor;

        chartContent.append('line')
          .attr('x1', 0).attr('x2', chartW)
          .attr('y1', priceY).attr('y2', priceY)
          .attr('stroke', priceColor).attr('stroke-width', 1)
          .attr('stroke-dasharray', '3,3');

        axisG.append('rect')
          .attr('x', chartW).attr('y', priceY - 9)
          .attr('width', margin.right).attr('height', 18)
          .attr('fill', priceColor);

        axisG.append('text')
          .attr('x', chartW + 4).attr('y', priceY + 4)
          .attr('fill', '#FFFFFF').attr('font-size', '10px').attr('font-family', 'monospace').attr('font-weight', 'bold')
          .text(displayPrice.toFixed(displayPrice > 100 ? 2 : 4));
      }

      // ── Legend ──
      const legendG = chartContent.append('g').attr('transform', 'translate(8,-8)');
      if (overlay === 'ma') {
        legendG.append('text').attr('x', 0).attr('fill', '#ECC94B').attr('font-size', '10px').text('MA10');
        legendG.append('text').attr('x', 45).attr('fill', '#4299E1').attr('font-size', '10px').text('MA30');
      } else if (overlay === 'ema') {
        legendG.append('text').attr('x', 0).attr('fill', '#9F7AEA').attr('font-size', '10px').text('EMA12');
        legendG.append('text').attr('x', 50).attr('fill', '#F56565').attr('font-size', '10px').text('EMA26');
      } else if (overlay === 'boll') {
        legendG.append('text').attr('x', 0).attr('fill', '#38B2AC').attr('font-size', '10px').text('BOLL(20,2)');
      }

      // ── Crosshair with snap-to-nearest (Phase 17B) ──
      const crosshairG = chartContent.append('g').style('display', 'none');
      const hLineC = crosshairG.append('line').attr('stroke', '#8892B050').attr('stroke-dasharray', '4,4').attr('x1', 0).attr('x2', chartW);
      const vLineC = crosshairG.append('line').attr('stroke', '#8892B050').attr('stroke-dasharray', '4,4').attr('y1', 0).attr('y2', priceH + volumeH);
      // Snap dot
      const snapDot = crosshairG.append('circle').attr('r', 3).attr('fill', '#4299E1').attr('stroke', '#FFF').attr('stroke-width', 0.5);
      const priceLabel = crosshairG.append('g');
      priceLabel.append('rect').attr('width', margin.right).attr('height', 16).attr('fill', '#4299E1');
      const priceTxt = priceLabel.append('text').attr('fill', '#FFF').attr('font-size', '10px').attr('font-family', 'monospace').attr('x', 4).attr('y', 11);
      // Time label at bottom
      const timeLabel = crosshairG.append('g');
      timeLabel.append('rect').attr('width', 50).attr('height', 14).attr('fill', '#4299E1').attr('rx', 2);
      const timeTxt = timeLabel.append('text').attr('fill', '#FFF').attr('font-size', '9px').attr('font-family', 'monospace').attr('x', 3).attr('y', 10);

      const overlay_rect = chartContent.append('rect')
        .attr('width', chartW).attr('height', priceH + volumeH)
        .attr('fill', 'transparent').style('cursor', 'crosshair');

      overlay_rect.on('mousemove', function (event: MouseEvent) {
        const [mx, my] = d3.pointer(event);
        crosshairG.style('display', null);

        // Phase 17B: Snap to nearest candle
        const rawIdx = xScale.invert(mx);
        const snapIdx = Math.max(0, Math.min(data.length - 1, Math.round(rawIdx)));
        const snapX = xScale(snapIdx);
        const snapCandle = data[snapIdx];

        // Vertical line snaps to candle center
        vLineC.attr('x1', snapX).attr('x2', snapX);
        hLineC.attr('y1', my).attr('y2', my);

        // Snap dot on the close price
        const snapY = yScale(snapCandle.close);
        snapDot.attr('cx', snapX).attr('cy', snapY);

        // Price label
        const hoverPrice = yScale.invert(my);
        priceLabel.attr('transform', `translate(${chartW},${my - 8})`);
        priceTxt.text(hoverPrice.toFixed(hoverPrice > 100 ? 2 : 4));

        // Time label
        const snapDate = new Date(snapCandle.time);
        const timeStr = `${(snapDate.getMonth() + 1).toString().padStart(2, '0')}/${snapDate.getDate().toString().padStart(2, '0')} ${snapDate.getHours().toString().padStart(2, '0')}:${snapDate.getMinutes().toString().padStart(2, '0')}`;
        timeLabel.attr('transform', `translate(${snapX - 25},${priceH + volumeH + 2})`);
        timeTxt.text(timeStr);

        setCrosshair({ x: snapX, y: my, candle: snapCandle });
      });

      overlay_rect.on('mouseleave', () => {
        crosshairG.style('display', 'none');
        setCrosshair(null);
      });
    }

    // Initial render
    renderContent();

    // ── d3-zoom (Phase 17B) ──
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 20])
      .translateExtent([[-chartW * 0.5, 0], [chartW * 1.5, H]])
      .extent([[0, 0], [chartW, H]])
      .on('zoom', (event: d3.D3ZoomEvent<SVGSVGElement, unknown>) => {
        // Only transform x axis (no vertical zoom)
        const t = event.transform;
        renderContent(t);
        setIsZoomed(t.k !== 1 || t.x !== 0);
      });

    svg.call(zoom);
    zoomRef.current = zoom;

  }, [data, dimensions, overlay, showVolume, upColor, downColor, livePrice]);

  useEffect(() => {
    renderChart();
  }, [renderChart]);

  const handleResetZoom = useCallback(() => {
    const svgEl = svgRef.current;
    if (svgEl && zoomRef.current) {
      d3.select(svgEl)
        .transition()
        .duration(300)
        .call(zoomRef.current.transform, d3.zoomIdentity);
      setIsZoomed(false);
    }
  }, []);

  const displayCandle = crosshair?.candle || (data.length > 0 ? data[data.length - 1] : null);
  const isUp = displayCandle ? displayCandle.close >= displayCandle.open : true;
  const decimals = (displayCandle?.close ?? 0) > 100 ? 2 : 4;

  return (
    <div ref={containerRef} className="relative w-full" style={{ height: propHeight }}>
      {/* OHLCV overlay */}
      {displayCandle && (
        <div className="absolute top-1 left-3 z-10 flex items-center gap-3 text-[10px]" style={{ color: '#CCD6F6' }}>
          <span style={{ color: '#FFF', fontWeight: 500 }}>{symbol}</span>
          <span style={{ color: '#8892B0' }}>O <span className="font-mono" style={{ color: '#CCD6F6' }}>{displayCandle.open.toFixed(decimals)}</span></span>
          <span style={{ color: '#8892B0' }}>H <span className="font-mono" style={{ color: '#38B2AC' }}>{displayCandle.high.toFixed(decimals)}</span></span>
          <span style={{ color: '#8892B0' }}>L <span className="font-mono" style={{ color: '#F56565' }}>{displayCandle.low.toFixed(decimals)}</span></span>
          <span style={{ color: '#8892B0' }}>C <span className={`font-mono`} style={{ color: isUp ? '#38B2AC' : '#F56565' }}>{displayCandle.close.toFixed(decimals)}</span></span>
          <span style={{ color: '#8892B0' }}>V <span className="font-mono" style={{ color: '#CCD6F6' }}>{displayCandle.volume.toFixed(0)}</span></span>
        </div>
      )}
      {/* Zoom reset button (Phase 17B) */}
      {isZoomed && (
        <button
          onClick={handleResetZoom}
          className="absolute top-1 right-[76px] z-10 px-2 py-0.5 text-[10px] rounded"
          style={{ background: '#4299E1', color: '#FFF', border: 'none', cursor: 'pointer' }}
        >
          重置缩放
        </button>
      )}
      <svg
        ref={svgRef}
        width={dimensions.width}
        height={dimensions.height}
        className="block"
        style={{ background: '#071425' }}
      />
    </div>
  );
};

export default D3CandlestickChart;
