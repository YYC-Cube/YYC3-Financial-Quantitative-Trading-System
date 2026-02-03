import React from 'react';
import { Card } from '@/app/components/ui/Card';
import { Users, Shield, Edit, Trash2, Plus } from 'lucide-react';

const USERS = [
  { id: 1, name: 'Alex Quant', email: 'alex@cloudhub.io', role: 'Super Admin', status: 'Active', lastLogin: '2024-01-29 10:25' },
  { id: 2, name: 'Sarah Trader', email: 'sarah@cloudhub.io', role: 'Trader', status: 'Active', lastLogin: '2024-01-29 09:15' },
  { id: 3, name: 'Mike Risk', email: 'mike@cloudhub.io', role: 'Risk Manager', status: 'Active', lastLogin: '2024-01-28 16:40' },
  { id: 4, name: 'Bot Account 01', email: 'bot01@cloudhub.io', role: 'API Bot', status: 'Inactive', lastLogin: '2023-12-15 11:20' },
];

const ROLES = [
  { name: 'Super Admin', users: 2, desc: 'Full system access', color: '#F56565' },
  { name: 'Trader', users: 15, desc: 'Trade execution & Market data', color: '#38B2AC' },
  { name: 'Risk Manager', users: 4, desc: 'Risk monitoring & Limits', color: '#ECC94B' },
  { name: 'Analyst', users: 8, desc: 'Read-only data access', color: '#4299E1' },
];

export const AuthManager = () => {
  return (
    <div className="h-[calc(100vh-140px)] grid grid-cols-12 gap-6">
      <Card className="col-span-3 p-6 flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <h4 className="text-white font-bold flex items-center gap-2">
            <Shield className="w-5 h-5 text-[#ECC94B]" /> 角色管理
          </h4>
          <button className="p-1.5 bg-[#233554] rounded hover:text-white text-[#8892B0]"><Plus className="w-4 h-4" /></button>
        </div>
        
        <div className="space-y-3 overflow-auto">
          {ROLES.map((role, i) => (
            <div key={i} className="p-4 bg-[#0A192F] rounded border border-[#233554] hover:border-[#CCD6F6] cursor-pointer group transition-colors">
              <div className="flex justify-between items-start mb-2">
                 <h5 className="font-bold text-white text-sm" style={{ color: role.color }}>{role.name}</h5>
                 <span className="text-xs bg-[#112240] text-[#8892B0] px-1.5 py-0.5 rounded">{role.users} Users</span>
              </div>
              <p className="text-xs text-[#8892B0]">{role.desc}</p>
            </div>
          ))}
        </div>
      </Card>

      <Card className="col-span-9 p-6 flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h4 className="text-white font-bold flex items-center gap-2">
            <Users className="w-5 h-5 text-[#4299E1]" /> 用户列表
          </h4>
          <div className="flex gap-3">
             <input type="text" placeholder="Search users..." className="bg-[#0A192F] border border-[#233554] rounded px-3 py-1.5 text-xs text-white outline-none w-64" />
             <button className="px-3 py-1.5 bg-[#4299E1] text-white text-xs rounded hover:brightness-110 font-medium">
               + 添加用户
             </button>
             <button className="px-3 py-1.5 bg-[#233554] text-[#F56565] text-xs rounded hover:brightness-110">
               批量删除
             </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          <table className="w-full">
            <thead className="text-xs text-[#8892B0] bg-[#0A192F]">
              <tr>
                <th className="py-3 px-4 text-left w-10"><input type="checkbox" className="accent-[#4299E1]" /></th>
                <th className="py-3 px-4 text-left">用户</th>
                <th className="py-3 px-4 text-left">角色</th>
                <th className="py-3 px-4 text-left">状态</th>
                <th className="py-3 px-4 text-left">上次登录</th>
                <th className="py-3 px-4 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {USERS.map((user) => (
                <tr key={user.id} className="border-b border-[#233554]/50 hover:bg-[#112240]">
                  <td className="py-3 px-4"><input type="checkbox" className="accent-[#4299E1]" /></td>
                  <td className="py-3 px-4">
                    <div>
                      <div className="text-white font-medium">{user.name}</div>
                      <div className="text-xs text-[#8892B0]">{user.email}</div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 bg-[#233554] text-[#CCD6F6] text-xs rounded">{user.role}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded text-xs ${
                      user.status === 'Active' ? 'bg-[#38B2AC]/20 text-[#38B2AC]' : 'bg-[#8892B0]/20 text-[#8892B0]'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-[#8892B0] text-xs font-mono">{user.lastLogin}</td>
                  <td className="py-3 px-4 text-right flex justify-end gap-2">
                    <button className="p-1.5 hover:bg-[#233554] rounded text-[#4299E1]"><Edit className="w-4 h-4" /></button>
                    <button className="p-1.5 hover:bg-[#233554] rounded text-[#F56565]"><Trash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};