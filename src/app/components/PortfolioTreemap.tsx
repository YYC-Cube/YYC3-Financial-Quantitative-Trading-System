import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { useSettings } from '@/app/contexts/SettingsContext';

interface PortfolioData {
  name: string;
  children?: PortfolioData[];
  value?: number;
  change?: number;
}

const mockPortfolio: PortfolioData = {
  name: "Portfolio",
  children: [
    {
      name: "股票 (Stocks)",
      children: [
        { name: "AAPL", value: 45000, change: 1.2 },
        { name: "MSFT", value: 38000, change: -0.5 },
        { name: "NVDA", value: 52000, change: 3.4 },
        { name: "TSLA", value: 15000, change: -2.1 },
        { name: "BABA", value: 12000, change: 0.8 },
      ]
    },
    {
      name: "加密货币 (Crypto)",
      children: [
        { name: "BTC", value: 65000, change: 4.5 },
        { name: "ETH", value: 28000, change: 1.1 },
        { name: "SOL", value: 8500, change: 8.2 },
      ]
    },
    {
      name: "期货 (Futures)",
      children: [
        { name: "Gold", value: 22000, change: 0.2 },
        { name: "Oil", value: 18000, change: -1.4 },
      ]
    }
  ]
};

export const PortfolioTreemap = ({ width = 800, height = 500 }: { width?: number; height?: number }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const { getUpColor, getDownColor } = useSettings();

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const root = d3.hierarchy<PortfolioData>(mockPortfolio)
      .sum((d: any) => d.value || 0)
      .sort((a, b) => (b.value || 0) - (a.value || 0));

    const treemapLayout = d3.treemap<PortfolioData>()
      .size([width, height])
      .paddingOuter(3)
      .paddingTop(19)
      .paddingInner(1)
      .round(true);

    treemapLayout(root);

    const nodes = svg.selectAll("g")
      .data(root.leaves())
      .enter()
      .append("g")
      .attr("transform", (d) => `translate(${d.x0},${d.y0})`);

    nodes.append("rect")
      .attr("width", (d) => d.x1 - d.x0)
      .attr("height", (d) => d.y1 - d.y0)
      .attr("fill", (d) => {
        const change = (d.data as any).change || 0;
        if (change > 0) return getUpColor();
        if (change < 0) return getDownColor();
        return "#233554";
      })
      .attr("fill-opacity", 0.8)
      .attr("stroke", "#071425")
      .attr("stroke-width", 1);

    nodes.append("text")
      .attr("x", 5)
      .attr("y", 15)
      .text((d: any) => d.data.name)
      .attr("fill", "white")
      .attr("font-size", "10px")
      .attr("font-weight", "bold");

    nodes.append("text")
      .attr("x", 5)
      .attr("y", 28)
      .text((d: any) => {
        const change = (d.data as any).change || 0;
        return `${change > 0 ? '+' : ''}${change}%`;
      })
      .attr("fill", "rgba(255,255,255,0.7)")
      .attr("font-size", "9px");

    // Add Parent Labels
    svg.selectAll("titles")
      .data(root.descendants().filter(d => d.depth === 1))
      .enter()
      .append("text")
      .attr("x", (d: any) => d.x0 + 5)
      .attr("y", (d: any) => d.y0 + 14)
      .text((d: any) => d.data.name)
      .attr("font-size", "11px")
      .attr("fill", "#8892B0")
      .attr("font-weight", "medium");

  }, [width, height, getUpColor, getDownColor]);

  return (
    <div className="bg-[#0A192F] p-4 rounded-lg border border-[#233554] overflow-hidden">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">资产持仓穿透 (Portfolio TreeMap)</h3>
        <div className="flex gap-4 text-[10px]">
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: getUpColor() }}></span>
            <span className="text-[#8892B0]">上涨</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: getDownColor() }}></span>
            <span className="text-[#8892B0]">下跌</span>
          </div>
        </div>
      </div>
      <svg 
        ref={svgRef} 
        width={width} 
        height={height} 
        className="w-full h-auto"
        viewBox={`0 0 ${width} ${height}`}
      />
    </div>
  );
};
