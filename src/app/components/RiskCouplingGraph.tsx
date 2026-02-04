import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { Card } from '@/app/components/ui/Card';
import { ShieldCheck, ZoomIn, ZoomOut, RefreshCw, Activity, Link2, AlertTriangle, Box, Monitor } from '@/app/components/SafeIcons';
import { toast } from 'sonner';
// Temporarily disable 3D graph to fix import error
// import ForceGraph3D from 'react-force-graph-3d';

interface Node extends d3.SimulationNodeDatum {
  id: string;
  group: number;
  val: number; // Asset Value / Risk Weight
  risk: number; // 0-100 Risk Score
}

interface Link extends d3.SimulationLinkDatum<Node> {
  value: number; // Coupling Strength (0-1)
}

interface RiskCouplingGraphProps {
  onNodeSelect?: (node: any) => void;
}

const INITIAL_NODES: Node[] = [
  { id: "BTC", group: 1, val: 50, risk: 85 },
  { id: "ETH", group: 1, val: 40, risk: 75 },
  { id: "SOL", group: 2, val: 20, risk: 90 },
  { id: "USDT", group: 3, val: 30, risk: 10 },
  { id: "BNB", group: 1, val: 15, risk: 60 },
  { id: "XRP", group: 2, val: 10, risk: 65 },
  { id: "ADA", group: 2, val: 8, risk: 55 },
  { id: "DOGE", group: 4, val: 12, risk: 95 },
  { id: "AVAX", group: 2, val: 14, risk: 70 },
  { id: "DOT", group: 2, val: 10, risk: 60 },
];

const INITIAL_LINKS: Link[] = [
  { source: "BTC", target: "ETH", value: 0.85 },
  { source: "BTC", target: "SOL", value: 0.65 },
  { source: "ETH", target: "SOL", value: 0.70 },
  { source: "USDT", target: "BTC", value: 0.1 },
  { source: "USDT", target: "ETH", value: 0.1 },
  { source: "BNB", target: "BTC", value: 0.75 },
  { source: "XRP", target: "BTC", value: 0.4 },
  { source: "DOGE", target: "BTC", value: 0.5 },
  { source: "AVAX", target: "SOL", value: 0.8 },
  { source: "DOT", target: "ETH", value: 0.6 },
];

export const RiskCouplingGraph = ({ onNodeSelect }: RiskCouplingGraphProps) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [isLive, setIsLive] = useState(true);
  // Removed 3D functionality to fix rendering issues
  // const [is3D, setIs3D] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  
  // Data refs to maintain state across D3 ticks without re-rendering
  const nodesRef = useRef<Node[]>(JSON.parse(JSON.stringify(INITIAL_NODES)));
  const linksRef = useRef<Link[]>(JSON.parse(JSON.stringify(INITIAL_LINKS)));
  const simulationRef = useRef<d3.Simulation<Node, Link> | null>(null);

  useEffect(() => {
    if (containerRef.current) {
      const resizeObserver = new ResizeObserver((entries) => {
         if (entries[0]) {
             setDimensions({
                 width: entries[0].contentRect.width,
                 height: entries[0].contentRect.height
             });
         }
      });
      resizeObserver.observe(containerRef.current);
      return () => resizeObserver.disconnect();
    }
  }, []);

  // Real-time Feed Simulation (WebSocket Mock)
  useEffect(() => {
    if (!isLive) return;

    const interval = setInterval(() => {
      // 1. Perturb Link Strengths (Coupling volatility)
      linksRef.current.forEach(link => {
        const volatility = (Math.random() - 0.5) * 0.1; // +/- 0.05 change
        link.value = Math.max(0.1, Math.min(1.0, link.value + volatility));
      });

      // 2. Perturb Node Risk Scores (Market Events)
      nodesRef.current.forEach(node => {
        if (Math.random() > 0.7) { // 30% chance to change risk
           const riskChange = (Math.random() - 0.5) * 10;
           node.risk = Math.max(0, Math.min(100, node.risk + riskChange));
        }
      });

      // 3. Re-heat simulation to adjust positions
      if (simulationRef.current) {
        simulationRef.current.alpha(0.1).restart();
        update2DGraph(); // Trigger visual update for 2D
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [isLive]);

  // Visual Update Function for D3 (separated from init)
  const update2DGraph = () => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    
    // Update Lines (Thickness based on new values)
    svg.selectAll("line")
      .attr("stroke-width", (d: any) => Math.sqrt(d.value * 10))
      .attr("stroke-opacity", (d: any) => 0.3 + d.value * 0.5);

    // Update Node Colors (Risk based)
    const colorScale = d3.scaleLinear<string>()
      .domain([0, 50, 100])
      .range(["#38B2AC", "#ECC94B", "#F56565"]);

    svg.selectAll(".node-circle-main")
      .transition().duration(500)
      .attr("stroke", (d: any) => colorScale(d.risk));
      
    svg.selectAll(".node-circle-glow")
      .transition().duration(500)
      .attr("fill", (d: any) => colorScale(d.risk));

    svg.selectAll(".node-text-risk")
      .text((d: any) => `R:${Math.round(d.risk)}`)
      .attr("fill", (d: any) => colorScale(d.risk));
  };

  // D3 2D Effect
  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear previous render

    // Color scale
    const colorScale = d3.scaleLinear<string>()
      .domain([0, 50, 100])
      .range(["#38B2AC", "#ECC94B", "#F56565"]);

    // Simulation setup
    simulationRef.current = d3.forceSimulation(nodesRef.current)
      .force("link", d3.forceLink(linksRef.current)
        .id((d: any) => d.id)
        .distance((d: any) => 150 * (1.2 - d.value)) // Stronger coupling = closer
      )
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collide", d3.forceCollide().radius((d: any) => d.val + 15));

    // Elements Container (for Zoom)
    const g = svg.append("g");

    // Links
    const link = g.append("g")
      .attr("stroke", "#233554")
      .selectAll("line")
      .data(linksRef.current)
      .join("line")
      .attr("stroke-width", (d: any) => Math.sqrt(d.value * 10))
      .attr("stroke-opacity", 0.6);

    // Nodes Group
    const node = g.append("g")
      .selectAll("g")
      .data(nodesRef.current)
      .join("g")
      .attr("cursor", "pointer")
      .on("click", (event, d) => {
        event.stopPropagation();
        if (onNodeSelect) onNodeSelect(d);
      })
      .call(d3.drag<any, any>()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended)
      );

    // Node circles (Outer Glow)
    node.append("circle")
      .attr("class", "node-circle-glow")
      .attr("r", (d: any) => d.val * 1.4)
      .attr("fill", (d: any) => colorScale(d.risk))
      .attr("fill-opacity", 0.2)
      .attr("filter", "blur(4px)");

    // Node circles (Main)
    node.append("circle")
      .attr("class", "node-circle-main")
      .attr("r", (d: any) => d.val)
      .attr("fill", "#0A192F")
      .attr("stroke", (d: any) => colorScale(d.risk))
      .attr("stroke-width", 2);

    // Labels
    node.append("text")
      .text((d: any) => d.id)
      .attr("x", 0)
      .attr("y", 4)
      .attr("text-anchor", "middle")
      .attr("fill", "#CCD6F6")
      .attr("font-size", "10px")
      .attr("font-weight", "bold")
      .attr("pointer-events", "none");

    // Risk Value Label (Small)
    node.append("text")
      .attr("class", "node-text-risk")
      .text((d: any) => `R:${d.risk}`)
      .attr("x", 0)
      .attr("y", (d: any) => d.val + 12)
      .attr("text-anchor", "middle")
      .attr("fill", (d: any) => colorScale(d.risk))
      .attr("font-size", "8px")
      .attr("pointer-events", "none");

    // Simulation Tick
    simulationRef.current.on("tick", () => {
      link
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);

      node
        .attr("transform", (d: any) => `translate(${d.x},${d.y})`);
    });

    // Zoom behavior
    const zoomBehavior = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
        setZoom(event.transform.k);
      });

    svg.call(zoomBehavior);

    // Drag functions
    function dragstarted(event: any, d: any) {
      if (!event.active && simulationRef.current) simulationRef.current.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event: any, d: any) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event: any, d: any) {
      if (!event.active && simulationRef.current) simulationRef.current.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    return () => {
      if (simulationRef.current) simulationRef.current.stop();
    };
  }, [onNodeSelect]); // Re-run when switching back to 2D

  const colorScale = useMemo(() => 
    d3.scaleLinear<string>()
      .domain([0, 50, 100])
      .range(["#38B2AC", "#ECC94B", "#F56565"]), 
  []);

  return (
    <Card className="h-[500px] flex flex-col p-0 overflow-hidden bg-[#0A192F] relative border-[#233554]">
      <div className="absolute top-4 left-4 z-10 pointer-events-none">
        <h4 className="text-white font-bold flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-[#38B2AC]"/> 资产风险耦合拓扑 (2D)
        </h4>
        <p className="text-xs text-[#8892B0] mt-1">
          节点: 资产权重 | 连线: 实时相关性系数 (Dynamic)
        </p>
      </div>

      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
         <div className="bg-[#112240]/80 p-2 rounded backdrop-blur border border-[#233554] flex gap-2">
           <button 
             onClick={() => setIsLive(!isLive)} 
             className={`p-1.5 rounded transition-colors ${isLive ? 'text-[#38B2AC] bg-[#38B2AC]/10' : 'text-[#8892B0] hover:bg-[#233554]'}`} 
             title={isLive ? "Live Feed On" : "Live Feed Paused"}
           >
             <Activity className={`w-4 h-4 ${isLive ? 'animate-pulse' : ''}`} />
           </button>
           <button className="p-1.5 hover:bg-[#233554] rounded text-[#8892B0] hover:text-white" title="Reset">
             <RefreshCw className="w-4 h-4" />
           </button>
         </div>
      </div>
      
      {/* Legend */}
      <div className="absolute top-20 right-4 z-10 bg-[#112240]/80 p-2 rounded backdrop-blur border border-[#233554] text-[9px] text-[#8892B0] space-y-1 w-28 pointer-events-none">
         <div className="flex justify-between">
           <span>弱关联</span>
           <span>强耦合</span>
         </div>
         <div className="h-1 w-full bg-gradient-to-r from-[#233554] to-[#38B2AC]"></div>
         <div className="flex justify-between pt-1">
           <span>低风险</span>
           <span>高危</span>
         </div>
         <div className="h-1 w-full bg-gradient-to-r from-[#38B2AC] via-[#ECC94B] to-[#F56565]"></div>
      </div>

      <div ref={containerRef} className="flex-1 w-full h-full relative">
        <svg ref={svgRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
      </div>

      <div className="absolute bottom-4 left-4 z-10 flex items-center gap-2 text-[10px] text-[#8892B0]">
         <AlertTriangle className="w-3 h-3 text-[#ECC94B]" />
         <span>点击节点查看资产详情及穿透报告</span>
      </div>
    </Card>
  );
};