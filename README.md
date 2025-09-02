# Trilou Dashboard

## 專案簡介

Trilou Dashboard 是一個資料視覺化儀表板，專門設計來配合 [Trilou](https://github.com/sunpochin/trilou)（一個 Trello clone 專案）使用。此儀表板提供即時的任務管理統計資料和視覺化圖表，協助使用者更好地了解和追蹤專案進度。

### DEMO
https://dashboard-trilou.up.railway.app/

## 功能特色

### 📊 統計總覽
- **總列表數**：顯示所有任務列表的數量
- **總卡片數**：顯示所有任務卡片的總數
- **完成率**：以百分比顯示已完成任務的比例
- **近30天效率**：短期工作效率追蹤

### 📈 視覺化圖表
- **列表活動統計**：長條圖顯示各列表中的卡片數量分布
- **卡片狀態分布**：圓餅圖呈現不同狀態卡片的比例
- **卡片優先度分布**：圓餅圖顯示 high/medium/low 優先度任務比例
- **月度活動趨勢**：折線圖追蹤過去 6 個月的任務創建和完成情況

### 🚀 工作效率分析系統
- **每日生產力趨勢**：過去14天的任務創建 vs 完成對比分析
- **優先度完成效率**：各優先度任務的平均完成天數統計
- **週生產力趨勢**：過去4週的工作效率百分比變化
- **智能效率計算**：基於歷史資料的生產力指標分析

## 技術架構

### 前端框架
- **React 18** + **TypeScript**：提供型別安全的開發體驗
- **Vite**：快速的開發環境和建置工具
- **Tailwind CSS v4**：現代化的 utility-first CSS 框架

### 資料視覺化
- **Recharts**：React 專用的圖表庫，提供互動式資料視覺化

### 後端整合
- **Supabase**：
  - 使用 PostgreSQL 資料庫儲存任務資料
  - Google OAuth 認證整合
  - 即時資料同步

## 安裝與執行

### 環境需求
- Node.js 18.0 或以上版本
- Yarn 或 npm 套件管理器

### 安裝步驟

1. Clone 專案
```bash
git clone https://github.com/yourusername/dashboard-trilou.git
cd dashboard-trilou
```

2. 安裝依賴套件
```bash
yarn install
# 或
npm install
```

3. 設定環境變數
創建 `.env` 檔案並加入以下設定：
```env
VITE_SUPABASE_URL=你的_supabase_url
VITE_SUPABASE_ANON_KEY=你的_supabase_anon_key
```

4. 啟動開發伺服器
```bash
yarn dev
# 或
npm run dev
```

5. 開啟瀏覽器並訪問 `http://localhost:5173`

## 專案結構

```
dashboard-trilou/
├── src/
│   ├── components/         # React 組件
│   │   └── GoogleLoginButton.tsx  # Google 登入按鈕
│   ├── hooks/              # 自定義 React Hooks
│   │   └── useAuth.ts      # 認證相關 Hook
│   ├── lib/                # 外部服務設定
│   │   └── supabaseClient.ts  # Supabase 客戶端設定
│   ├── services/           # API 服務層
│   │   └── trilouApi.ts    # Trilou API 整合
│   ├── App.tsx             # 主應用程式組件
│   ├── Dashboard.tsx       # 儀表板主頁面
│   └── main.tsx           # 應用程式進入點
├── .env                    # 環境變數設定
├── tailwind.config.js      # Tailwind CSS 設定
├── postcss.config.js       # PostCSS 設定
├── vite.config.ts          # Vite 建置設定
└── package.json           # 專案依賴和腳本

```

## 資料庫架構

Dashboard 從 Supabase 讀取以下資料表：

### lists 表
- `id`: 列表唯一識別碼
- `title`: 列表標題
- `position`: 列表排序位置
- `user_id`: 使用者 ID
- `created_at`: 創建時間

### cards 表
- `id`: 卡片唯一識別碼
- `title`: 卡片標題
- `description`: 卡片描述
- `position`: 卡片排序位置
- `list_id`: 所屬列表 ID
- `status`: 卡片狀態（未分類、進行中、已完成等）
- `priority`: 卡片優先度（high、medium、low）
- `created_at`: 創建時間

## 部署

### 建置專案
```bash
yarn build
# 或
npm run build
```

建置完成後，`dist` 資料夾包含可部署的靜態檔案。

### 部署選項
- **Vercel**：支援自動部署和預覽環境
- **Netlify**：簡單的靜態網站託管
- **GitHub Pages**：免費的靜態網站託管服務

## 開發紀錄

### 2024-08-17
- 初始化專案架構
- 整合 Supabase 認證和資料庫
- 實作 Google OAuth 登入功能
- 建立基礎儀表板 UI
- 加入 Recharts 圖表視覺化

### 2024-09-01
- 整合 Tailwind CSS v4 樣式框架
- 加入中文註解和文件說明

### 2024-09-02
- 🚀 **重大功能更新**：實作工作效率分析系統
- 新增 priority 屬性支援和對應的統計分析
- 加入每日生產力趨勢圖（14天）
- 實作優先度完成效率分析
- 新增週生產力趨勢統計
- 智能效率計算演算法實作
- 統計卡片擴展至4欄式設計

### 待開發功能
- [ ] 即時資料更新
- [ ] 更多篩選和排序選項
- [ ] 匯出報表功能
- [ ] 深色模式支援
- [ ] 行動裝置響應式優化
- [ ] 更詳細的任務分析指標

## 授權

MIT License - 詳見 [LICENSE](LICENSE) 檔案

## 聯絡資訊

如有任何問題或建議，歡迎透過以下方式聯繫：
- GitHub Issues: [專案 Issues 頁面](https://github.com/yourusername/dashboard-trilou/issues)
- Email: sunpochin@gmail.com

---

**注意**：此儀表板需要配合 Trilou 主專案使用，請確保 Trilou 服務正在運行並正確設定資料庫連線。