/**
 * 應用程式進入點
 * 負責初始化 React 應用程式並將根組件掛載到 DOM
 * 使用 StrictMode 進行開發階段的額外檢查和警告
 */
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

/**
 * 建立 React 根節點並渲染應用程式
 * 將 App 組件掛載到 index.html 中的 root 元素
 */
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
