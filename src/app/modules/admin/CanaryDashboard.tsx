/**
 * @file src/app/modules/admin/CanaryDashboard.tsx
 * @description 金丝雀发布仪表盘 - 灰度发布管理、A/B测试监控、版本回滚控制
 * @author YanYuCloudCube Team <admin@0379.email>
 * @version v1.0.0
 * @created 2026-05-22
 * @status stable
 * @license MIT
 */

import { useState } from 'react';
import { toast } from 'sonner';

import { quickDegradationTest, runCanaryValidation, type CanaryReport } from '@/app/api/canary-validator';
import { Card } from '@/app/components/ui/card';

type IconProps = React.SVGProps<SVGSVGElement>;
const RocketIcon = (props: IconProps) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 00-2.91-.09zM12 15l-3-3a22 22 0 012-3.95A12.88 12.88 0 0122 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 01-4 2z" /></svg>;
const FlagIcon = (props: IconProps) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" /><line x1="4" y1="22" x2="4" y2="15" strokeWidth={2} /></svg>;

export const CanaryDashboard = () => {
  const [canaryReports, setCanaryReports] = useState<CanaryReport[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState('v3.6.0-beta');

  const handleRunCanary = async () => {
    setIsRunning(true);
    toast.info('正在执行金丝雀验证...');
    try {
      const report = await runCanaryValidation();
      setCanaryReports(prev => [...prev, report]);
      const passRate = (report.results.filter(r => r.passed).length / report.results.length) * 100;
      if (passRate >= 90) {
        toast.success(`金丝雀测试通过 (${passRate.toFixed(1)}%)`);
      } else {
        toast.warning(`金丝雀测试通过率较低 (${passRate.toFixed(1)}%)`);
      }
    } catch (_error) {
      toast.error('金丝雀验证失败');
    }
    setIsRunning(false);
  };

  const handleDegradationTest = async () => {
    toast.info('正在执行降级测试...');
    try {
      const degraded = await quickDegradationTest();
      if (degraded) {
        toast.success('系统降级成功，核心功能正常运行');
      } else {
        toast.warning('降级测试未完全通过');
      }
    } catch (_error) {
      toast.error('降级测试失败');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <RocketIcon className="w-5 h-5" /> 金丝雀发布中心
        </h2>
        <div className="flex gap-2">
          <select value={selectedVersion} onChange={e => setSelectedVersion(e.target.value)} className="bg-[#071425] border border-[#233554] rounded px-3 py-1.5 text-xs text-[#CCD6F6]">
            <option value="v3.6.0-beta">v3.6.0-beta</option>
            <option value="v3.5.2-stable">v3.5.2-stable</option>
            <option value="v3.5.1-hotfix">v3.5.1-hotfix</option>
          </select>
          <button onClick={handleRunCanary} disabled={isRunning} className="px-3 py-1.5 bg-[#4299E1] text-white text-xs rounded hover:brightness-110 disabled:opacity-50">
            {isRunning ? '验证中...' : '运行验证'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-[#8892B0] text-xs mb-1 flex items-center gap-1">
            <FlagIcon className="w-3 h-3" /> 当前版本
          </div>
          <div className="text-lg font-bold text-white">{selectedVersion}</div>
        </Card>
        <Card className="p-4">
          <div className="text-[#8892B0] text-xs mb-1">验证次数</div>
          <div className="text-lg font-bold text-white">{canaryReports.length}</div>
        </Card>
        <Card className="p-4">
          <div className="text-[#8892B0] text-xs mb-1">通过率</div>
          <div className={`text-lg font-bold ${canaryReports.length > 0 && canaryReports[canaryReports.length - 1].results.filter(r => r.passed).length / canaryReports[canaryReports.length - 1].results.length >= 0.9 ? 'text-[#38B2AC]' : 'text-[#F56565]'}`}>
            {canaryReports.length > 0 ? `${((canaryReports[canaryReports.length - 1].results.filter(r => r.passed).length / canaryReports[canaryReports.length - 1].results.length) * 100).toFixed(1)}%` : '-'}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-[#8892B0] text-xs mb-1">系统健康度</div>
          <div className="text-lg font-bold text-[#38B2AC]">98.5%</div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-4">
          <h3 className="text-white text-sm mb-3">快速操作</h3>
          <div className="space-y-2">
            <button onClick={handleDegradationTest} className="w-full px-3 py-2 bg-[#ECC94B]/10 border border-[#ECC94B]/30 rounded text-[#ECC94B] text-xs hover:bg-[#ECC94B]/20">
              ⚡ 执行降级测试
            </button>
            <button onClick={() => toast.info('版本回滚功能开发中...')} className="w-full px-3 py-2 bg-[#F56565]/10 border border-[#F56565]/30 rounded text-[#F56565] text-xs hover:bg-[#F56565]/20">
              ↩️ 一键回滚至上一个稳定版
            </button>
          </div>
        </Card>

        <Card className="p-4">
          <h3 className="text-white text-sm mb-3">最近验证记录</h3>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {canaryReports.slice(-5).reverse().map((report, i) => (
              <div key={i} className="flex items-center justify-between p-2 bg-[#0A192F] rounded text-xs">
                <span className="text-[#CCD6F6]">#{canaryReports.length - i}</span>
                <span className={`${report.results.filter(r => r.passed).length / report.results.length >= 0.9 ? 'text-[#38B2AC]' : 'text-[#F56565]'}`}>
                  {(report.results.filter(r => r.passed).length / report.results.length * 100).toFixed(1)}% 通过
                </span>
                <span className="text-[#8892B0]">{new Date(report.timestamp).toLocaleTimeString()}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
