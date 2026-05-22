/**
 * @file src/app/modules/admin/BackupModule.tsx
 * @description 备份模块 - 数据备份配置、恢复管理、定时任务设置
 * @author YanYuCloudCube Team <admin@0379.email>
 * @version v1.0.0
 * @created 2026-05-22
 * @status stable
 * @license MIT
 */

import React, { useState } from 'react';
import { toast } from 'sonner';
import { Card } from '@/app/components/ui/card';

type IconProps = React.SVGProps<SVGSVGElement>;
const Database = (props: IconProps) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" /></svg>;

export const BackupModule = () => {
  const [backups] = useState([
    { id: 1, name: '每日自动备份', size: '2.3 GB', time: '2026-05-22 03:00', status: 'success' },
    { id: 2, name: '策略配置备份', size: '156 MB', time: '2026-05-21 18:30', status: 'success' },
    { id: 3, name: '用户数据导出', size: '89 MB', time: '2026-05-20 12:15', status: 'warning' },
    { id: 4, name: '全量系统快照', size: '5.1 GB', time: '2026-05-19 02:00', status: 'failed' },
  ]);

  const handleRestore = (id: number) => {
    toast.info(`正在准备恢复备份 #${id}...`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Database className="w-5 h-5" /> 数据备份中心
        </h2>
        <button className="px-3 py-1.5 bg-[#38B2AC] text-white text-xs rounded hover:brightness-110">
          + 创建备份
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="text-[#8892B0] text-xs mb-1">总备份数</div>
          <div className="text-2xl font-bold text-white">{backups.length}</div>
        </Card>
        <Card className="p-4">
          <div className="text-[#8892B0] text-xs mb-1">总占用空间</div>
          <div className="text-2xl font-bold text-white">7.6 GB</div>
        </Card>
        <Card className="p-4">
          <div className="text-[#8892B0] text-xs mb-1">上次备份</div>
          <div className="text-sm text-[#CCD6F6]">3小时前</div>
        </Card>
      </div>

      <Card className="p-4">
        <h3 className="text-white text-sm mb-4">备份历史记录</h3>
        <table className="w-full text-xs">
          <thead className="text-[#8892B0] uppercase border-b border-[#233554]">
            <tr>
              <th className="py-2 px-3 text-left">备份名称</th>
              <th className="py-2 px-3 text-left">大小</th>
              <th className="py-2 px-3 text-left">时间</th>
              <th className="py-2 px-3 text-left">状态</th>
              <th className="py-2 px-3 text-right">操作</th>
            </tr>
          </thead>
          <tbody>
            {backups.map(b => (
              <tr key={b.id} className="border-b border-[#233554]/30 hover:bg-[#112240]">
                <td className="py-2 px-3 text-[#CCD6F6]">{b.name}</td>
                <td className="py-2 px-3 text-[#8892B0]">{b.size}</td>
                <td className="py-2 px-3 text-[#8892B0]">{b.time}</td>
                <td className="py-2 px-3">
                  <span className={`px-2 py-0.5 rounded text-[10px] ${
                    b.status === 'success' ? 'bg-[#065F46]/20 text-[#38B2AC]' :
                    b.status === 'warning' ? 'bg-[#92400E]/20 text-[#ECC94B]' :
                    'bg-[#991B1B]/20 text-[#F56565]'
                  }`}>
                    {b.status === 'success' ? '成功' : b.status === 'warning' ? '警告' : '失败'}
                  </span>
                </td>
                <td className="py-2 px-3 text-right">
                  <button onClick={() => handleRestore(b.id)} className="text-[#4299E1] hover:text-[#63B3ED] mr-2">恢复</button>
                  <button className="text-[#F56565] hover:text-[#FC8181]">删除</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
};
