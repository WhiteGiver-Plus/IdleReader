import React, { useEffect } from 'react';
import { PDFViewer } from './components/PDFViewer';
import { GameSidebar } from './components/GameSidebar';
import { EventPopup } from './components/EventPopup';
import { GameLoop } from './components/GameLoop';
import { useGameStore } from './store/gameStore';
import { BookOpen, Gamepad2 } from 'lucide-react';

function App() {
  const { isGamebarExpanded, initializeGame, setIdleProducing } = useGameStore();

  useEffect(() => {
    // 初始化游戏
    initializeGame();
    
    // 监听页面可见性变化，用于控制挂机生产
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIdleProducing(false);
      } else {
        setIdleProducing(true);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [initializeGame, setIdleProducing]);

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* 标题栏 */}
      <header className="bg-white shadow-sm border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="flex items-center space-x-1 sm:space-x-2">
              <BookOpen className="text-blue-600" size={20} />
              <h1 className="text-lg sm:text-xl font-bold text-gray-800">PDF阅读器</h1>
            </div>
            <div className="text-gray-400 hidden sm:block">|</div>
            <div className="flex items-center space-x-1 sm:space-x-2">
              <Gamepad2 className="text-purple-600" size={16} />
              <span className="text-gray-600 text-sm sm:text-base">挂机工厂</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 sm:space-x-4">
            <div className="text-xs sm:text-sm text-gray-600 hidden sm:block">
              💡 收起游戏栏开始挂机赚钱，专心阅读PDF
            </div>
            <div className="text-xs sm:text-sm text-gray-600 sm:hidden">
              💡 收起游戏栏
            </div>
          </div>
        </div>
      </header>

      {/* 主要内容区域 */}
      <div className="flex-1 relative">
        {/* PDF阅读器 */}
        <div 
          className={`h-full transition-all duration-300 ${
            isGamebarExpanded ? 'mr-0 sm:mr-80' : 'mr-0'
          }`}
        >
          <PDFViewer />
        </div>

        {/* 游戏侧边栏 */}
        <GameSidebar />

        {/* 事件弹窗 */}
        <EventPopup />

        {/* 游戏循环逻辑 */}
        <GameLoop />
      </div>

      {/* 底部状态栏（可选） */}
      <footer className="bg-white border-t border-gray-200 px-4 sm:px-6 py-2">
        <div className="flex items-center justify-between text-xs sm:text-sm text-gray-600">
          <div className="flex items-center space-x-2 sm:space-x-4">
            <span className="hidden sm:inline">💡 快捷键：Ctrl+滚轮缩放，← → 翻页，F11全屏</span>
            <span className="sm:hidden">💡 Ctrl+滚轮缩放</span>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-4">
            <span className="hidden sm:inline">🎮 收起侧边栏进入挂机模式</span>
            <span className="hidden sm:inline">⚡ 每60-90秒触发游戏事件</span>
            <span className="sm:hidden">🎮 收起侧边栏</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
