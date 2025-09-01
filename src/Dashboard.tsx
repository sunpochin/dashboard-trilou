/**
 * Dashboard 主控台組件
 * 顯示 Trilou 任務管理系統的統計資料和視覺化圖表
 * 包含總覽統計卡片、列表活動長條圖、卡片狀態圓餅圖、月度趨勢折線圖
 */
import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  ResponsiveContainer
} from 'recharts';
import { trilouApi, type DashboardStats } from './services/trilouApi';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    /**
     * 載入 Dashboard 統計資料
     * 從 Trilou API 獲取列表、卡片、完成率等統計數據
     */
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        const dashboardStats = await trilouApi.getDashboardStats();
        setStats(dashboardStats);
      } catch (err) {
        setError('無法載入 dashboard 資料，請確認 trilou 服務是否運行在 localhost:3000');
        console.error('Dashboard loading error:', err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />
          <p>載入 Trilou 資料中...</p>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <div className="bg-white p-10 rounded-lg shadow-md text-center max-w-lg">
          <h2 className="text-red-500 text-xl font-semibold mb-4">⚠️ 連線錯誤</h2>
          <p className="mb-4">{error || '載入資料時發生錯誤'}</p>
          <p className="text-sm text-gray-600">
            請確認：<br/>
            1. trilou 服務正在運行（localhost:3000）<br/>
            2. 網路連線正常<br/>
            3. API 端點可以正常存取
          </p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-5 px-5 py-2.5 bg-blue-500 text-white border-none rounded cursor-pointer hover:bg-blue-600"
          >
            重新載入
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-5 bg-gray-200 min-h-screen w-full">
      <h1 className="text-center text-gray-800 text-3xl font-bold mb-8">
        Trilou Dashboard
      </h1>
      
      {/* 統計卡片 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
        <div className="bg-white p-5 rounded-lg shadow text-center">
          <h3 className="m-0 mb-2.5 text-gray-600">總列表數</h3>
          <p className="text-3xl font-bold m-0 text-gray-800">
            {stats.totalLists}
          </p>
        </div>
        
        <div className="bg-white p-5 rounded-lg shadow text-center">
          <h3 className="m-0 mb-2.5 text-gray-600">總卡片數</h3>
          <p className="text-3xl font-bold m-0 text-gray-800">
            {stats.totalCards}
          </p>
        </div>
        
        <div className="bg-white p-5 rounded-lg shadow text-center">
          <h3 className="m-0 mb-2.5 text-gray-600">完成率</h3>
          <p className="text-3xl font-bold m-0 text-green-500">
            {stats.completionRate}%
          </p>
        </div>
      </div>

      {/* 圖表區域 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* 列表卡片數量統計 */}
        <div className="bg-white p-5 rounded-lg shadow">
          <h3 className="mb-5 text-gray-800">各列表卡片數量</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.listActivity}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="cards" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* 卡片狀態分布 */}
        <div className="bg-white p-5 rounded-lg shadow">
          <h3 className="mb-5 text-gray-800">卡片狀態分布</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={stats.cardsByStatus}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {stats.cardsByStatus.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* 活動趨勢 */}
        <div className="bg-white p-5 rounded-lg shadow lg:col-span-2">
          <h3 className="mb-5 text-gray-800">月度活動趨勢</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={stats.monthlyActivity}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="cards" stroke="#8884d8" name="新增卡片" />
              <Line type="monotone" dataKey="completed" stroke="#82ca9d" name="完成卡片" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;