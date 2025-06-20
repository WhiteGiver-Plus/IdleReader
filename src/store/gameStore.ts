import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface Equipment {
  id: string;
  name: string;
  cost: number;
  baseProduction: number;
  count: number;
  description: string;
  icon: string;
}

export interface Upgrade {
  id: string;
  name: string;
  cost: number;
  multiplier: number;
  isPurchased: boolean;
  description: string;
  icon: string;
}

export interface GameEvent {
  id: string;
  type: 'malfunction' | 'boost' | 'reward';
  title: string;
  description: string;
  reward?: number;
  boostMultiplier?: number;
  boostDuration?: number;
  icon: string;
  timestamp: number;
}

export interface GameState {
  // 游戏基础状态
  gold: number;
  goldPerSecond: number;
  isGamebarExpanded: boolean;
  isIdleProducing: boolean;
  
  // 设备和升级
  equipment: Equipment[];
  upgrades: Upgrade[];
  
  // 生产相关
  productionMultiplier: number;
  boostEndTime: number;
  malfunctionEndTime: number;
  
  // 事件系统
  activeEvent: GameEvent | null;
  lastEventTime: number;
  
  // 行动
  toggleGamebar: () => void;
  addGold: (amount: number) => void;
  buyEquipment: (equipmentId: string) => void;
  buyUpgrade: (upgradeId: string) => void;
  handleEvent: (action: 'accept' | 'ignore') => void;
  dismissEvent: () => void;
  updateProduction: () => void;
  setIdleProducing: (producing: boolean) => void;
  generateEvent: () => void;
  
  // 初始化
  initializeGame: () => void;
}

const initialEquipment: Equipment[] = [
  {
    id: 'basic-generator',
    name: '基础发电机',
    cost: 15,
    baseProduction: 0.1,
    count: 0,
    description: '一个简单的金币生产设备',
    icon: '⚡'
  },
  {
    id: 'advanced-generator',
    name: '高级发电机',
    cost: 100,
    baseProduction: 1,
    count: 0,
    description: '效率更高的发电设备',
    icon: '🔋'
  },
  {
    id: 'solar-panel',
    name: '太阳能板',
    cost: 1100,
    baseProduction: 8,
    count: 0,
    description: '利用太阳能的清洁能源',
    icon: '☀️'
  },
  {
    id: 'wind-turbine',
    name: '风力发电机',
    cost: 12000,
    baseProduction: 47,
    count: 0,
    description: '利用风能的大型发电设备',
    icon: '💨'
  },
  {
    id: 'nuclear-plant',
    name: '核电站',
    cost: 130000,
    baseProduction: 260,
    count: 0,
    description: '超高效率的核能发电站',
    icon: '⚛️'
  }
];

const initialUpgrades: Upgrade[] = [
  {
    id: 'efficiency-1',
    name: '效率提升 I',
    cost: 500,
    multiplier: 2,
    isPurchased: false,
    description: '将所有生产设备效率翻倍',
    icon: '⚙️'
  },
  {
    id: 'efficiency-2',
    name: '效率提升 II',
    cost: 5000,
    multiplier: 2,
    isPurchased: false,
    description: '再次将所有生产设备效率翻倍',
    icon: '🔧'
  },
  {
    id: 'auto-click',
    name: '自动点击',
    cost: 10000,
    multiplier: 1.5,
    isPurchased: false,
    description: '即使在处理事件时也能持续生产',
    icon: '🤖'
  }
];

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      // 初始状态
      gold: 30,
      goldPerSecond: 0,
      isGamebarExpanded: false,
      isIdleProducing: true,
      equipment: initialEquipment,
      upgrades: initialUpgrades,
      productionMultiplier: 1,
      boostEndTime: 0,
      malfunctionEndTime: 0,
      activeEvent: null,
      lastEventTime: Date.now(),

      // 切换游戏栏
      toggleGamebar: () => set((state) => ({
        isGamebarExpanded: !state.isGamebarExpanded,
        isIdleProducing: !state.isGamebarExpanded ? false : true
      })),

      // 添加金币
      addGold: (amount: number) => set((state) => ({
        gold: state.gold + amount
      })),

      // 购买设备
      buyEquipment: (equipmentId: string) => set((state) => {
        const equipment = state.equipment.find(eq => eq.id === equipmentId);
        if (!equipment || state.gold < equipment.cost) return state;

        const newEquipment = state.equipment.map(eq => {
          if (eq.id === equipmentId) {
            return {
              ...eq,
              count: eq.count + 1,
              cost: Math.floor(eq.cost * 1.15) // 每次购买成本增加15%
            };
          }
          return eq;
        });

        return {
          gold: state.gold - equipment.cost,
          equipment: newEquipment
        };
      }),

      // 购买升级
      buyUpgrade: (upgradeId: string) => set((state) => {
        const upgrade = state.upgrades.find(up => up.id === upgradeId);
        if (!upgrade || state.gold < upgrade.cost || upgrade.isPurchased) return state;

        const newUpgrades = state.upgrades.map(up => {
          if (up.id === upgradeId) {
            return { ...up, isPurchased: true };
          }
          return up;
        });

        return {
          gold: state.gold - upgrade.cost,
          upgrades: newUpgrades,
          productionMultiplier: state.productionMultiplier * upgrade.multiplier
        };
      }),

      // 处理事件
      handleEvent: (action: 'accept' | 'ignore') => set((state) => {
        if (!state.activeEvent) return state;

        const now = Date.now();
        let newState = { ...state, activeEvent: null as GameEvent | null };

        if (action === 'accept') {
          switch (state.activeEvent.type) {
            case 'malfunction':
              // 修复故障，恢复正常生产
              newState.malfunctionEndTime = 0;
              break;
            case 'boost':
              // 获得生产加速
              newState.boostEndTime = now + (state.activeEvent.boostDuration || 30000);
              break;
            case 'reward':
              // 获得金币奖励
              newState.gold = state.gold + (state.activeEvent.reward || 0);
              break;
          }
        } else {
          // 忽略事件，根据事件类型可能有负面效果
          if (state.activeEvent.type === 'malfunction') {
            newState.malfunctionEndTime = now + 60000; // 故障持续1分钟
          }
        }

        return newState;
      }),

      // 关闭事件
      dismissEvent: () => set({ activeEvent: null }),

      // 更新生产
      updateProduction: () => set((state) => {
        const now = Date.now();
        let totalProduction = 0;

        // 计算基础生产
        state.equipment.forEach(eq => {
          totalProduction += eq.baseProduction * eq.count;
        });

        // 应用升级倍数
        totalProduction *= state.productionMultiplier;

        // 应用临时加速
        if (now < state.boostEndTime) {
          totalProduction *= 3; // 3倍加速
        }

        // 应用故障减速
        if (now < state.malfunctionEndTime) {
          totalProduction *= 0.1; // 故障时只有10%产出
        }

        return { goldPerSecond: totalProduction };
      }),

      // 设置挂机生产状态
      setIdleProducing: (producing: boolean) => set({ isIdleProducing: producing }),

      // 生成随机事件
      generateEvent: () => set((state) => {
        const now = Date.now();
        
        // 30秒内不重复生成事件
        if (now - state.lastEventTime < 30000 || state.activeEvent) return state;

        const eventTypes = ['malfunction', 'boost', 'reward'] as const;
        const randomType = eventTypes[Math.floor(Math.random() * eventTypes.length)];

        let newEvent: GameEvent;

        switch (randomType) {
          case 'malfunction':
            newEvent = {
              id: `malfunction-${now}`,
              type: 'malfunction',
              title: '设备故障！',
              description: '生产设备出现故障，需要立即修复',
              icon: '⚠️',
              timestamp: now
            };
            break;
          case 'boost':
            newEvent = {
              id: `boost-${now}`,
              type: 'boost',
              title: '生产加速！',
              description: '获得30秒的3倍生产加速',
              boostMultiplier: 3,
              boostDuration: 30000,
              icon: '🚀',
              timestamp: now
            };
            break;
          case 'reward':
            const reward = Math.floor(state.goldPerSecond * 10 + Math.random() * 100);
            newEvent = {
              id: `reward-${now}`,
              type: 'reward',
              title: '意外收获！',
              description: `发现了一些额外的金币！`,
              reward,
              icon: '💰',
              timestamp: now
            };
            break;
        }

        return {
          activeEvent: newEvent,
          lastEventTime: now
        };
      }),

      // 初始化游戏
      initializeGame: () => set((state) => {
        // 重置为初始状态但保留已购买的内容
        return {
          ...state,
          activeEvent: null,
          boostEndTime: 0,
          malfunctionEndTime: 0,
          lastEventTime: Date.now()
        };
      })
    }),
    {
      name: 'pdf-idle-game-storage',
      version: 1,
    }
  )
);
