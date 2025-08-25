import React from 'react';
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

// 模擬資料 - 實際使用時應該從API獲取
const boardsData = [
  { name: '團隊專案', boards: 12 },
  { name: '個人任務', boards: 8 },
  { name: '產品開發', boards: 15 },
  { name: '行銷活動', boards: 6 }
];

const cardStatusData = [
  { name: '待辦', value: 45, color: '#8884d8' },
  { name: '進行中', value: 28, color: '#82ca9d' },
  { name: '已完成', value: 67, color: '#ffc658' }
];

const activityData = [
  { date: '1月', cards: 20, completed: 15 },
  { date: '2月', cards: 32, completed: 28 },
  { date: '3月', cards: 28, completed: 25 },
  { date: '4月', cards: 35, completed: 30 },
  { date: '5月', cards: 42, completed: 38 },
  { date: '6月', cards: 38, completed: 35 }
];

const Dashboard: React.FC = () => {
  const totalCards = cardStatusData.reduce((sum, item) => sum + item.value, 0);
  const completionRate = Math.round((cardStatusData.find(item => item.name === '已完成')?.value || 0) / totalCards * 100);

  return (
    <div style={{ padding: '20px', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <h1 style={{ textAlign: 'center', color: '#333', marginBottom: '30px' }}>
        Trilou Dashboard
      </h1>
      
      {/* 統計卡片 */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '20px', 
        marginBottom: '30px' 
      }}>
        <div style={{ 
          backgroundColor: 'white', 
          padding: '20px', 
          borderRadius: '8px', 
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#666' }}>總板子數</h3>
          <p style={{ fontSize: '32px', fontWeight: 'bold', margin: '0', color: '#333' }}>
            {boardsData.reduce((sum, item) => sum + item.boards, 0)}
          </p>
        </div>
        
        <div style={{ 
          backgroundColor: 'white', 
          padding: '20px', 
          borderRadius: '8px', 
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#666' }}>總卡片數</h3>
          <p style={{ fontSize: '32px', fontWeight: 'bold', margin: '0', color: '#333' }}>
            {totalCards}
          </p>
        </div>
        
        <div style={{ 
          backgroundColor: 'white', 
          padding: '20px', 
          borderRadius: '8px', 
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#666' }}>完成率</h3>
          <p style={{ fontSize: '32px', fontWeight: 'bold', margin: '0', color: '#4CAF50' }}>
            {completionRate}%
          </p>
        </div>
      </div>

      {/* 圖表區域 */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
        gap: '20px' 
      }}>
        {/* 板子數量統計 */}
        <div style={{ 
          backgroundColor: 'white', 
          padding: '20px', 
          borderRadius: '8px', 
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)' 
        }}>
          <h3 style={{ marginBottom: '20px', color: '#333' }}>各類別板子數量</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={boardsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="boards" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* 卡片狀態分布 */}
        <div style={{ 
          backgroundColor: 'white', 
          padding: '20px', 
          borderRadius: '8px', 
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)' 
        }}>
          <h3 style={{ marginBottom: '20px', color: '#333' }}>卡片狀態分布</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={cardStatusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {cardStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* 活動趨勢 */}
        <div style={{ 
          backgroundColor: 'white', 
          padding: '20px', 
          borderRadius: '8px', 
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          gridColumn: '1 / -1'
        }}>
          <h3 style={{ marginBottom: '20px', color: '#333' }}>月度活動趨勢</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={activityData}>
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