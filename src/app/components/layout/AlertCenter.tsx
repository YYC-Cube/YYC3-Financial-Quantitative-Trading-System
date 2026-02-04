import React from 'react';
import { 
  Popover, PopoverContent, PopoverTrigger 
} from '@/app/components/ui/popover';
import { useAlerts, Alert } from '@/app/contexts/AlertContext';
import { Bell, AlertTriangle, Info, ShieldAlert, Check, Trash2, Settings2 } from '@/app/components/SafeIcons';
import { format } from 'date-fns';
import { cn } from '@/app/components/ui/utils';

export const AlertCenter = () => {
  const { alerts, markAsRead, clearAlerts, thresholds } = useAlerts();
  const unreadCount = alerts.filter(a => !a.read).length;

  const getIcon = (type: Alert['type'], severity: Alert['severity']) => {
    if (severity === 'critical') return <ShieldAlert className="w-4 h-4 text-[#F56565]" />;
    if (severity === 'warning') return <AlertTriangle className="w-4 h-4 text-[#ECC94B]" />;
    switch (type) {
      case 'price': return <Bell className="w-4 h-4 text-[#4299E1]" />;
      case 'technical': return <Info className="w-4 h-4 text-[#38B2AC]" />;
      default: return <Bell className="w-4 h-4 text-[#8892B0]" />;
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="relative p-2 text-[#8892B0] hover:text-[#CCD6F6] transition-colors rounded-full hover:bg-[#112240]">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-[#F56565] text-white text-[10px] flex items-center justify-center rounded-full font-bold border-2 border-[#0A192F]">
              {unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 bg-[#0A192F] border-[#233554] p-0 shadow-2xl z-[100]" align="end">
        <div className="flex items-center justify-between p-4 border-b border-[#233554]">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            智能预警中心
            <span className="text-[10px] bg-[#112240] px-1.5 py-0.5 rounded text-[#8892B0]">
              {thresholds.length} 监控中
            </span>
          </h3>
          <div className="flex gap-2">
            <button 
              onClick={clearAlerts}
              className="text-[#8892B0] hover:text-[#F56565] transition-colors"
              title="清空全部"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="max-h-[400px] overflow-y-auto no-scrollbar">
          {alerts.length === 0 ? (
            <div className="py-12 text-center text-[#8892B0] flex flex-col items-center gap-2">
              <Bell className="w-8 h-8 opacity-20" />
              <p className="text-xs">暂无未处理预警</p>
            </div>
          ) : (
            <div className="flex flex-col">
                {alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={cn(
                      "p-4 border-b border-[#233554]/50 hover:bg-[#112240]/50 transition-colors cursor-pointer relative group",
                      !alert.read && "bg-[#112240]/30"
                    )}
                    onClick={() => markAsRead(alert.id)}
                  >
                    <div className="flex gap-3">
                      <div className="mt-0.5 shrink-0">
                        {getIcon(alert.type, alert.severity)}
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex justify-between items-start">
                          <span className="text-xs font-bold text-white tracking-wide uppercase">
                            {alert.symbol}
                          </span>
                          <span className="text-[10px] text-[#8892B0]">
                            {format(alert.timestamp, 'HH:mm:ss')}
                          </span>
                        </div>
                        <p className="text-xs text-[#CCD6F6] leading-relaxed">
                          {alert.message}
                        </p>
                      </div>
                    </div>
                    {!alert.read && (
                      <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-[#4299E1]" />
                    )}
                  </div>
                ))}
            </div>
          )}
        </div>

        <div className="p-3 border-t border-[#233554] bg-[#112240]/50 flex justify-center">
          <button className="text-[10px] text-[#38B2AC] hover:text-white flex items-center gap-1 transition-colors">
            <Settings2 className="w-3 h-3" />
            配置阈值与指标告警
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
};