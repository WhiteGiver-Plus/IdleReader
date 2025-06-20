import React, { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { ChevronLeft, ChevronRight, Coins, ShoppingCart, Star, Zap, RefreshCw } from 'lucide-react';

interface GameSidebarProps {
  className?: string;
}

export const GameSidebar: React.FC<GameSidebarProps> = ({ className = '' }) => {
  const {
    gold,
    goldPerSecond,
    isGamebarExpanded,
    equipment,
    upgrades,
    productionMultiplier,
    boostEndTime,
    malfunctionEndTime,
    toggleGamebar,
    buyEquipment,
    buyUpgrade,
    initializeGame
  } = useGameStore();

  const [activeTab, setActiveTab] = useState<'equipment' | 'upgrades'>('equipment');

  // 重置游戏数据
  const handleResetGame = () => {
    if (window.confirm('确定要重置游戏数据吗？所有金币、设备和升级都会丢失！')) {
      // 清除cookie
      document.cookie = 'pdf-idle-game-storage=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      // 重新加载页面
      window.location.reload();
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
    return num.toFixed(2);
  };

  const formatBigNumber = (num: number): string => {
    if (num >= 1e12) return (num / 1e12).toFixed(2) + 'T';
    if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
    return Math.floor(num).toString();
  };

  const getStatusIcon = () => {
    const now = Date.now();
    if (now < malfunctionEndTime) return { icon: '⚠️', color: 'text-red-500', label: '故障中' };
    if (now < boostEndTime) return { icon: '🚀', color: 'text-green-500', label: '加速中' };
    return { icon: '💰', color: 'text-yellow-500', label: '正常运行' };
  };

  const status = getStatusIcon();

  if (!isGamebarExpanded) {
    // 收起状态 - 显示简化信息
    return (
      <div className={`fixed right-0 top-1/2 transform -translate-y-1/2 z-40 ${className}`}>
        <div className="bg-white rounded-l-xl shadow-lg border border-gray-200 p-2 sm:p-3">
          <button
            onClick={toggleGamebar}
            className="flex items-center space-x-1 sm:space-x-2 hover:bg-gray-50 rounded-lg p-1 sm:p-2 transition-colors"
            title="展开游戏栏"
          >
            <ChevronLeft size={16} className="text-gray-600" />
            <div className="text-right">
              <div className="flex items-center space-x-1">
                <span className={status.color}>{status.icon}</span>
                <span className="font-bold text-yellow-600 text-xs sm:text-sm">
                  {formatBigNumber(gold)}
                </span>
                <Coins size={12} className="text-yellow-600 sm:hidden" />
                <Coins size={16} className="text-yellow-600 hidden sm:block" />
              </div>
              <div className="text-xs text-gray-500">
                +{formatNumber(goldPerSecond)}/秒
              </div>
            </div>
          </button>
        </div>
      </div>
    );
  }

  // 展开状态 - 显示完整游戏界面
  return (
    <div className={`fixed right-0 top-0 h-full w-full sm:w-80 bg-white shadow-xl border-l border-gray-200 z-40 flex flex-col ${className}`}>
      {/* 标题栏 */}
      <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-purple-600 text-white flex-shrink-0">
        <div className="flex items-center space-x-2">
          <span className={status.color}>{status.icon}</span>
          <h2 className="font-bold text-sm sm:text-base">挂机工厂</h2>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleResetGame}
            className="p-1 hover:bg-white hover:bg-opacity-20 rounded"
            title="重置游戏"
          >
            <RefreshCw size={14} />
          </button>
          <button
            onClick={toggleGamebar}
            className="p-1 hover:bg-white hover:bg-opacity-20 rounded"
            title="收起游戏栏"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* 金币信息 */}
      <div className="p-3 sm:p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <Coins size={20} className="text-yellow-600 sm:hidden" />
            <Coins size={24} className="text-yellow-600 hidden sm:block" />
            <span className="text-lg sm:text-2xl font-bold text-gray-800">
              {formatBigNumber(gold)}
            </span>
          </div>
          <div className="text-right">
            <div className="text-xs sm:text-sm text-gray-600">每秒收益</div>
            <div className="text-sm sm:text-lg font-semibold text-green-600">
              +{formatNumber(goldPerSecond)}
            </div>
          </div>
        </div>
        <div className="text-xs text-gray-500">
          状态: <span className={status.color}>{status.label}</span>
          {productionMultiplier > 1 && (
            <span className="ml-2 text-blue-600">
              • 效率倍数: {productionMultiplier.toFixed(1)}x
            </span>
          )}
        </div>
      </div>

      {/* 标签页 */}
      <div className="flex border-b border-gray-200 flex-shrink-0">
        <button
          onClick={() => setActiveTab('equipment')}
          className={`flex-1 flex items-center justify-center space-x-1 sm:space-x-2 py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm ${
            activeTab === 'equipment'
              ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <ShoppingCart size={16} />
          <span>设备</span>
        </button>
        <button
          onClick={() => setActiveTab('upgrades')}
          className={`flex-1 flex items-center justify-center space-x-1 sm:space-x-2 py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm ${
            activeTab === 'upgrades'
              ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Star size={16} />
          <span>升级</span>
        </button>
      </div>

      {/* 内容区域 */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {activeTab === 'equipment' && (
          <div className="p-3 sm:p-4 space-y-2 sm:space-y-3">
            <h3 className="font-semibold text-gray-800 mb-2 sm:mb-3 text-sm sm:text-base">生产设备</h3>
            {equipment.map((item) => {
              const canAfford = gold >= item.cost;
              const totalProduction = item.baseProduction * item.count * productionMultiplier;
              
              return (
                <div
                  key={item.id}
                  className={`p-2 sm:p-3 border rounded-lg ${
                    canAfford
                      ? 'border-green-200 bg-green-50 hover:bg-green-100'
                      : 'border-gray-200 bg-gray-50'
                  } transition-colors`}
                >
                  <div className="flex items-start space-x-2 sm:space-x-3">
                    <div className="text-xl sm:text-2xl">{item.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-medium text-gray-800 truncate text-sm sm:text-base">
                          {item.name}
                        </h4>
                        <span className="text-xs sm:text-sm font-medium text-gray-600">
                          {item.count}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                        {item.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="text-xs">
                          <div className="text-gray-500">
                            +{formatNumber(item.baseProduction)}/秒
                          </div>
                          {totalProduction > 0 && (
                            <div className="text-green-600 font-medium">
                              总产出: +{formatNumber(totalProduction)}/秒
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => buyEquipment(item.id)}
                          disabled={!canAfford}
                          className={`px-2 sm:px-3 py-1 rounded text-xs sm:text-sm font-medium ${
                            canAfford
                              ? 'bg-green-600 text-white hover:bg-green-700'
                              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          } transition-colors`}
                        >
                          {formatBigNumber(item.cost)}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {activeTab === 'upgrades' && (
          <div className="p-3 sm:p-4 space-y-2 sm:space-y-3">
            <h3 className="font-semibold text-gray-800 mb-2 sm:mb-3 text-sm sm:text-base">效率升级</h3>
            {upgrades.map((upgrade) => {
              const canAfford = gold >= upgrade.cost && !upgrade.isPurchased;
              
              return (
                <div
                  key={upgrade.id}
                  className={`p-2 sm:p-3 border rounded-lg ${
                    upgrade.isPurchased
                      ? 'border-blue-200 bg-blue-50'
                      : canAfford
                      ? 'border-purple-200 bg-purple-50 hover:bg-purple-100'
                      : 'border-gray-200 bg-gray-50'
                  } transition-colors`}
                >
                  <div className="flex items-start space-x-2 sm:space-x-3">
                    <div className="text-xl sm:text-2xl">{upgrade.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-medium text-gray-800 truncate text-sm sm:text-base">
                          {upgrade.name}
                        </h4>
                        {upgrade.isPurchased && (
                          <span className="text-xs bg-blue-100 text-blue-800 px-1 sm:px-2 py-1 rounded">
                            已购买
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                        {upgrade.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="text-xs">
                          <span className="text-purple-600 font-medium">
                            效率: {upgrade.multiplier}x
                          </span>
                        </div>
                        {!upgrade.isPurchased && (
                          <button
                            onClick={() => buyUpgrade(upgrade.id)}
                            disabled={!canAfford}
                            className={`px-2 sm:px-3 py-1 rounded text-xs sm:text-sm font-medium ${
                              canAfford
                                ? 'bg-purple-600 text-white hover:bg-purple-700'
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            } transition-colors`}
                          >
                            {formatBigNumber(upgrade.cost)}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
