import { useEffect, useRef } from 'react';
import { useGameStore } from '../store/gameStore';

export const GameLoop: React.FC = () => {
  const {
    isIdleProducing,
    isGamebarExpanded,
    goldPerSecond,
    updateProduction,
    addGold,
    generateEvent,
    activeEvent
  } = useGameStore();

  const lastUpdateRef = useRef<number>(Date.now());
  const eventTimerRef = useRef<number>(0);

  useEffect(() => {
    const gameLoop = () => {
      const now = Date.now();
      const deltaTime = (now - lastUpdateRef.current) / 1000; // 转换为秒
      lastUpdateRef.current = now;

      // 更新生产速度计算
      updateProduction();

      // 只有在挂机状态（侧边栏收起）时才自动生产金币
      if (!isGamebarExpanded && isIdleProducing && goldPerSecond > 0) {
        const goldToAdd = goldPerSecond * deltaTime;
        addGold(goldToAdd);
      }

      // 事件生成逻辑
      eventTimerRef.current += deltaTime;
      
      // 每60-90秒随机生成一个事件（只有在没有活跃事件时）
      if (eventTimerRef.current >= 60 && !activeEvent) {
        const shouldGenerateEvent = Math.random() < 0.6; // 60%概率生成事件
        if (shouldGenerateEvent) {
          generateEvent();
          eventTimerRef.current = 0;
        }
      }

      // 如果超过90秒还没生成事件，强制生成
      if (eventTimerRef.current >= 90 && !activeEvent) {
        generateEvent();
        eventTimerRef.current = 0;
      }
    };

    // 设置游戏循环，每100ms执行一次
    const interval = setInterval(gameLoop, 100);

    return () => clearInterval(interval);
  }, [
    isIdleProducing,
    isGamebarExpanded,
    goldPerSecond,
    updateProduction,
    addGold,
    generateEvent,
    activeEvent
  ]);

  // 这个组件不渲染任何UI
  return null;
};
