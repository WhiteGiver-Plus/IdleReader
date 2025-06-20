import React, { useEffect, useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { X, AlertTriangle, Zap, Gift } from 'lucide-react';

export const EventPopup: React.FC = () => {
  const { activeEvent, handleEvent, dismissEvent } = useGameStore();
  const [timeLeft, setTimeLeft] = useState(15); // 15秒自动关闭

  useEffect(() => {
    if (!activeEvent) return;

    setTimeLeft(15);
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // 时间到，自动忽略事件
          handleEvent('ignore');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [activeEvent, handleEvent]);

  if (!activeEvent) return null;

  const getEventConfig = () => {
    switch (activeEvent.type) {
      case 'malfunction':
        return {
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          iconColor: 'text-red-600',
          icon: AlertTriangle,
          acceptText: '立即修复',
          acceptColor: 'bg-red-600 hover:bg-red-700',
          ignoreText: '稍后处理',
          ignoreColor: 'bg-gray-500 hover:bg-gray-600'
        };
      case 'boost':
        return {
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          iconColor: 'text-green-600',
          icon: Zap,
          acceptText: '激活加速',
          acceptColor: 'bg-green-600 hover:bg-green-700',
          ignoreText: '忽略',
          ignoreColor: 'bg-gray-500 hover:bg-gray-600'
        };
      case 'reward':
        return {
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          iconColor: 'text-yellow-600',
          icon: Gift,
          acceptText: '收集奖励',
          acceptColor: 'bg-yellow-600 hover:bg-yellow-700',
          ignoreText: '忽略',
          ignoreColor: 'bg-gray-500 hover:bg-gray-600'
        };
      default:
        return {
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          iconColor: 'text-gray-600',
          icon: AlertTriangle,
          acceptText: '确认',
          acceptColor: 'bg-blue-600 hover:bg-blue-700',
          ignoreText: '忽略',
          ignoreColor: 'bg-gray-500 hover:bg-gray-600'
        };
    }
  };

  const config = getEventConfig();
  const IconComponent = config.icon;

  const formatReward = (reward?: number) => {
    if (!reward) return '';
    if (reward >= 1e6) return `${(reward / 1e6).toFixed(2)}M`;
    if (reward >= 1e3) return `${(reward / 1e3).toFixed(2)}K`;
    return reward.toString();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className={`relative max-w-md w-full mx-4 ${config.bgColor} ${config.borderColor} border-2 rounded-xl shadow-2xl transform transition-all duration-300 scale-100`}>
        {/* 关闭按钮 */}
        <button
          onClick={dismissEvent}
          className="absolute top-3 right-3 p-1 hover:bg-white hover:bg-opacity-50 rounded-full transition-colors"
        >
          <X size={20} className="text-gray-600" />
        </button>

        {/* 倒计时指示器 */}
        <div className="absolute top-3 left-3 flex items-center space-x-2">
          <div className="w-8 h-8 relative">
            <svg className="w-8 h-8 transform -rotate-90" viewBox="0 0 36 36">
              <path
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeDasharray={`${(timeLeft / 15) * 100}, 100`}
                className="text-gray-400"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-medium text-gray-600">{timeLeft}</span>
            </div>
          </div>
        </div>

        <div className="p-6 pt-12">
          {/* 事件图标和标题 */}
          <div className="text-center mb-4">
            <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-white shadow-lg mb-3`}>
              <div className="text-3xl">{activeEvent.icon}</div>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              {activeEvent.title}
            </h3>
            <p className="text-gray-600 leading-relaxed">
              {activeEvent.description}
            </p>
          </div>

          {/* 事件详情 */}
          <div className="bg-white bg-opacity-50 rounded-lg p-3 mb-4">
            {activeEvent.type === 'malfunction' && (
              <div className="text-center">
                <div className="text-red-600 font-medium mb-1">⚠️ 生产效率降低90%</div>
                <div className="text-sm text-gray-600">
                  立即修复可恢复正常，否则故障将持续1分钟
                </div>
              </div>
            )}
            {activeEvent.type === 'boost' && (
              <div className="text-center">
                <div className="text-green-600 font-medium mb-1">
                  🚀 生产速度提升{activeEvent.boostMultiplier}倍
                </div>
                <div className="text-sm text-gray-600">
                  持续时间：{(activeEvent.boostDuration || 0) / 1000}秒
                </div>
              </div>
            )}
            {activeEvent.type === 'reward' && (
              <div className="text-center">
                <div className="text-yellow-600 font-medium mb-1">
                  💰 奖励金币：{formatReward(activeEvent.reward)}
                </div>
                <div className="text-sm text-gray-600">
                  立即收集可获得额外金币
                </div>
              </div>
            )}
          </div>

          {/* 操作按钮 */}
          <div className="flex space-x-3">
            <button
              onClick={() => handleEvent('accept')}
              className={`flex-1 py-3 px-4 text-white font-medium rounded-lg transition-colors ${config.acceptColor}`}
            >
              {config.acceptText}
            </button>
            <button
              onClick={() => handleEvent('ignore')}
              className={`flex-1 py-3 px-4 text-white font-medium rounded-lg transition-colors ${config.ignoreColor}`}
            >
              {config.ignoreText}
            </button>
          </div>

          {/* 快速提示 */}
          <div className="mt-3 text-center text-xs text-gray-500">
            💡 提示：及时处理事件可以提高游戏效率
          </div>
        </div>
      </div>
    </div>
  );
};
