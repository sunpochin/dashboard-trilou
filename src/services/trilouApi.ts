/**
 * Trilou API 服務模組
 * 負責與 Supabase 資料庫互動，提供任務列表和卡片的 CRUD 操作
 * 包含儀表板統計資料的計算與彙整功能
 */
import { supabase } from '../lib/supabaseClient';

/**
 * 卡片資料介面
 * 代表任務管理系統中的單一任務項目
 */
export interface Card {
  id: string;
  title: string;
  description?: string;
  position?: number;
  list_id: string;
  status?: string;
  priority?: string;
  created_at?: string;
}

/**
 * 列表資料介面
 * 代表任務管理系統中的任務分類或群組
 */
export interface List {
  id: string;
  title: string;
  position?: number;
  user_id: string;
  created_at?: string;
}

/**
 * 儀表板統計資料介面
 * 包含所有用於視覺化展示的統計數據
 */
export interface WorkEfficiencyStats {
  averageCompletionRate: number;
  dailyProductivity: { date: string; completed: number; created: number }[];
  priorityEfficiency: { priority: string; avgDays: number; count: number }[];
  weeklyTrend: { week: string; productivity: number }[];
}

export interface DashboardStats {
  totalLists: number;
  totalCards: number;
  cardsByStatus: { name: string; value: number; color: string }[];
  cardsByPriority: { name: string; value: number; color: string }[];
  listActivity: { name: string; cards: number }[];
  monthlyActivity: { date: string; cards: number; completed: number }[];
  completionRate: number;
  workEfficiency: WorkEfficiencyStats;
}

/**
 * Trilou API 服務類別
 * 封裝所有與 Supabase 資料庫互動的方法
 */
class TrilouApiService {
  /**
   * 獲取當前用戶的所有任務列表
   * 從 Supabase 查詢 lists 表，並按照 position 排序
   * @returns 任務列表陣列
   */
  async fetchLists(): Promise<List[]> {
    try {
      // 直接從 Supabase 查詢 lists 表
      const { data, error } = await supabase
        .from('lists')
        .select('id, title, position, user_id, created_at')
        .order('position', { ascending: true });

      if (error) {
        console.error('Error fetching lists:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching lists:', error);
      return [];
    }
  }

  /**
   * 獲取卡片資料
   * 可選擇性地按列表 ID 篩選，確保只返回當前用戶的卡片
   * @param listId - 可選的列表 ID，用於篩選特定列表的卡片
   * @returns 卡片陣列
   */
  async fetchCards(listId?: string): Promise<Card[]> {
    try {
      // 建構查詢：使用 JOIN 確保只取得該用戶的卡片
      let query = supabase
        .from('cards')
        .select(`
          id,
          title,
          description,
          position,
          list_id,
          status,
          priority,
          created_at,
          lists!inner(user_id)
        `)
        // .eq('lists.user_id', user.id)
        .order('list_id', { ascending: true })
        .order('position', { ascending: true });

      // 如果指定了 list_id，加上篩選條件
      if (listId) {
        query = query.eq('list_id', listId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching cards:', error);
        return [];
      }

      // 清理回傳資料：移除 JOIN 的額外欄位
      const cleanedData = data?.map(card => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { lists, ...cardData } = card as Record<string, unknown>;
        return cardData as unknown as Card;
      }) || [];

      return cleanedData;
    } catch (error) {
      console.error('Error fetching cards:', error);
      return [];
    }
  }

  /**
   * 判斷卡片是否已完成
   * 檢查卡片狀態或是否在 done 列表中
   */
  private isCardCompleted(card: Card, doneListIds: Set<string>): boolean {
    const status = card.status?.trim().toLowerCase();
    return status === 'done' || 
           status === 'completed' || 
           card.status === '已完成' ||
           doneListIds.has(card.list_id);
  }

  /**
   * 獲取所有完成列表的 ID 集合
   */
  private getDoneListIds(lists: List[]): Set<string> {
    return new Set(
      lists
        .filter(list => list.title.trim().toLowerCase() === 'done')
        .map(list => list.id)
    );
  }

  /**
   * 計算工作效率統計資料
   * 分析任務完成效率、每日生產力等指標
   */
  private calculateWorkEfficiency(cards: Card[], doneListIds: Set<string>): WorkEfficiencyStats {
    const completedCards = cards.filter(card => this.isCardCompleted(card, doneListIds));
    
    // 計算平均完成率（過去30天）
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentCards = cards.filter(card => {
      if (!card.created_at) return false;
      return new Date(card.created_at) >= thirtyDaysAgo;
    });
    
    const averageCompletionRate = recentCards.length > 0 
      ? Math.round((completedCards.filter(card => 
          card.created_at && new Date(card.created_at) >= thirtyDaysAgo
        ).length / recentCards.length) * 100)
      : 0;

    // 計算每日生產力（過去14天）
    const dailyProductivity = this.calculateDailyProductivity(cards, completedCards);

    // 計算優先度效率
    const priorityEfficiency = this.calculatePriorityEfficiency(cards, completedCards, doneListIds);

    // 計算週趨勢
    const weeklyTrend = this.calculateWeeklyTrend(cards, completedCards);

    return {
      averageCompletionRate,
      dailyProductivity,
      priorityEfficiency,
      weeklyTrend
    };
  }

  /**
   * 計算每日生產力數據
   */
  private calculateDailyProductivity(cards: Card[], completedCards: Card[]): { date: string; completed: number; created: number }[] {
    const days: { date: string; completed: number; created: number }[] = [];
    
    for (let i = 13; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString('zh-TW', { month: 'short', day: 'numeric' });
      
      const created = cards.filter(card => {
        if (!card.created_at) return false;
        const cardDate = new Date(card.created_at);
        return cardDate.toDateString() === date.toDateString();
      }).length;
      
      const completed = completedCards.filter(card => {
        if (!card.created_at) return false;
        const cardDate = new Date(card.created_at);
        return cardDate.toDateString() === date.toDateString();
      }).length;
      
      days.push({ date: dateStr, completed, created });
    }
    
    return days;
  }

  /**
   * 計算各優先度的完成效率
   */
  private calculatePriorityEfficiency(cards: Card[], _completedCards: Card[], doneListIds: Set<string>): { priority: string; avgDays: number; count: number }[] {
    const priorities = ['high', 'medium', 'low', '未設定'];
    
    return priorities.map(priority => {
      const priorityCards = cards.filter(card => (card.priority || '未設定') === priority);
      const priorityCompleted = priorityCards.filter(card => this.isCardCompleted(card, doneListIds));
      
      // 計算平均完成天數（簡化版：假設現在就是完成時間）
      let avgDays = 0;
      if (priorityCompleted.length > 0) {
        const totalDays = priorityCompleted.reduce((sum, card) => {
          if (card.created_at) {
            const created = new Date(card.created_at);
            const now = new Date();
            const diffTime = Math.abs(now.getTime() - created.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return sum + diffDays;
          }
          return sum;
        }, 0);
        avgDays = Math.round(totalDays / priorityCompleted.length);
      }
      
      return {
        priority,
        avgDays,
        count: priorityCards.length
      };
    }).filter(item => item.count > 0);
  }

  /**
   * 計算週趨勢
   */
  private calculateWeeklyTrend(cards: Card[], completedCards: Card[]): { week: string; productivity: number }[] {
    const weeks: { week: string; productivity: number }[] = [];
    
    for (let i = 3; i >= 0; i--) {
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - (i * 7) - weekStart.getDay());
      weekStart.setHours(0, 0, 0, 0);
      
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);
      
      const weekStr = `${weekStart.getMonth() + 1}/${weekStart.getDate()}`;
      
      const weekCards = cards.filter(card => {
        if (!card.created_at) return false;
        const cardDate = new Date(card.created_at);
        return cardDate >= weekStart && cardDate <= weekEnd;
      });
      
      const weekCompleted = completedCards.filter(card => {
        if (!card.created_at) return false;
        const cardDate = new Date(card.created_at);
        return cardDate >= weekStart && cardDate <= weekEnd;
      });
      
      const productivity = weekCards.length > 0 
        ? Math.round((weekCompleted.length / weekCards.length) * 100)
        : 0;
      
      weeks.push({ week: weekStr, productivity });
    }
    
    return weeks;
  }

  /**
   * 獲取儀表板統計資料
   * 彙整列表和卡片資料，計算各種統計指標
   * @returns 包含總數、狀態分布、活動趨勢等統計資料
   */
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      const [lists, cards] = await Promise.all([
        this.fetchLists(),
        this.fetchCards()
      ]);

      // 計算卡片狀態分布
      const statusCounts = cards.reduce((acc, card) => {
        const status = card.status || '未分類';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const cardsByStatus = Object.entries(statusCounts).map(([status, count], index) => {
        const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1'];
        return {
          name: status,
          value: count,
          color: colors[index % colors.length]
        };
      });

      // 計算卡片優先度分布
      const priorityCounts = cards.reduce((acc, card) => {
        const priority = card.priority || '未設定';
        acc[priority] = (acc[priority] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const cardsByPriority = Object.entries(priorityCounts).map(([priority, count], index) => {
        const priorityColors = ['#ff4444', '#ff8c00', '#32cd32', '#87ceeb'];
        return {
          name: priority,
          value: count,
          color: priorityColors[index % priorityColors.length]
        };
      });

      // 計算各列表的卡片數量
      const listCardCounts = lists.map(list => {
        const cardCount = cards.filter(card => card.list_id === list.id).length;
        return {
          name: list.title,
          cards: cardCount
        };
      });

      // 獲取完成列表 ID 集合
      const doneListIds = this.getDoneListIds(lists);
      
      // 基於真實創建時間的月度活動數據
      const monthlyActivity = this.generateMonthlyActivity(cards, doneListIds);

      // 計算完成率
      const completedCards = cards.filter(card => 
        this.isCardCompleted(card, doneListIds)
      ).length;
      const completionRate = cards.length > 0 ? Math.round((completedCards / cards.length) * 100) : 0;

      // 計算工作效率統計
      const workEfficiency = this.calculateWorkEfficiency(cards, doneListIds);

      return {
        totalLists: lists.length,
        totalCards: cards.length,
        cardsByStatus,
        cardsByPriority,
        listActivity: listCardCounts,
        monthlyActivity,
        completionRate,
        workEfficiency
      };
    } catch (error) {
      console.error('Error getting dashboard stats:', error);
      
      // 返回空數據而不是拋出錯誤，讓 dashboard 可以顯示
      return {
        totalLists: 0,
        totalCards: 0,
        cardsByStatus: [],
        cardsByPriority: [],
        listActivity: [],
        monthlyActivity: [],
        completionRate: 0,
        workEfficiency: {
          averageCompletionRate: 0,
          dailyProductivity: [],
          priorityEfficiency: [],
          weeklyTrend: []
        }
      };
    }
  }

  /**
   * 生成月度活動趨勢資料
   * 分析過去 6 個月的卡片創建和完成情況
   * @param cards - 所有卡片資料
   * @param doneListIds - 完成列表的 ID 集合
   * @returns 月度活動統計陣列
   */
  private generateMonthlyActivity(cards: Card[], doneListIds: Set<string>): { date: string; cards: number; completed: number }[] {
    const now = new Date();
    const months = [];
    
    // 生成過去6個月的數據
    for (let i = 5; i >= 0; i--) {
      const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = month.toLocaleString('zh-TW', { month: 'long' });
      
      // 計算該月創建的卡片數
      const monthCards = cards.filter(card => {
        if (!card.created_at) return false;
        const cardDate = new Date(card.created_at);
        return cardDate.getFullYear() === month.getFullYear() && 
               cardDate.getMonth() === month.getMonth();
      });

      // 計算該月完成的卡片數（假設完成時間等於創建時間）
      const completedCards = monthCards.filter(card => 
        this.isCardCompleted(card, doneListIds)
      );

      months.push({
        date: monthName,
        cards: monthCards.length,
        completed: completedCards.length
      });
    }
    
    return months;
  }
}

export const trilouApi = new TrilouApiService();