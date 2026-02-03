import React, { useEffect, useRef } from 'react';
import { createChart, ColorType, IChartApi, CandlestickSeries, CrosshairMode } from 'lightweight-charts';

interface KLineChartProps {
  data: { time: string; open: number; high: number; low: number; close: number }[];
  colors?: {
    backgroundColor?: string;
    lineColor?: string;
    textColor?: string;
    areaTopColor?: string;
    areaBottomColor?: string;
  };
}

export const KLineChart: React.FC<KLineChartProps> = ({ data, colors = {} }) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const {
      backgroundColor = '#112240',
      textColor = '#8892B0',
    } = colors;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: backgroundColor },
        textColor,
      },
      width: chartContainerRef.current.clientWidth,
      height: chartContainerRef.current.clientHeight,
      grid: {
        vertLines: { color: '#233554' },
        horzLines: { color: '#233554' },
      },
      timeScale: {
        borderColor: '#233554',
        timeVisible: true,
        secondsVisible: false,
        // Optimization for mobile pinch-to-zoom and pan
        shiftVisibleRangeOnNewBar: true,
        rightOffset: 12,
        barSpacing: 6,
        minBarSpacing: 0.5,
      },
      rightPriceScale: {
        borderColor: '#233554',
        autoScale: true,
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: {
          labelBackgroundColor: '#38B2AC',
        },
        horzLine: {
          labelBackgroundColor: '#38B2AC',
        },
      },
      // Mobile-specific touch handling optimization
      handleScroll: {
        mouseWheel: true,
        pressedMouseMove: true,
        horzTouchDrag: true,
        vertTouchDrag: true,
      },
      handleScale: {
        axisPressedMouseMove: true,
        mouseWheel: true,
        pinch: true, // Explicitly enable pinch
      },
    });

    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#38B2AC',
      downColor: '#F56565',
      borderVisible: false,
      wickUpColor: '#38B2AC',
      wickDownColor: '#F56565',
    });

    const sortedData = [...data].sort((a, b) => {
      const timeA = typeof a.time === 'string' ? new Date(a.time).getTime() : a.time;
      const timeB = typeof b.time === 'string' ? new Date(b.time).getTime() : b.time;
      return (timeA as number) - (timeB as number);
    });
    
    candlestickSeries.setData(sortedData);

    chartRef.current = chart;

    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({ 
          width: chartContainerRef.current.clientWidth,
          height: chartContainerRef.current.clientHeight 
        });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [data, colors]);

  return (
    <div className="w-full h-full relative group">
      <div ref={chartContainerRef} className="w-full h-full" />
      {/* Mobile Interaction Hint */}
      <div className="absolute top-2 right-2 flex gap-1 pointer-events-none opacity-0 group-hover:opacity-100 lg:group-hover:opacity-0 transition-opacity">
        <span className="bg-[#112240]/80 backdrop-blur px-2 py-0.5 rounded text-[8px] text-[#38B2AC] border border-[#38B2AC]/30">
          双指缩放
        </span>
      </div>
    </div>
  );
};
