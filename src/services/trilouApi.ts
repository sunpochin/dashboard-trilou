import { supabase } from '../lib/supabaseClient';

export interface Card {
  id: string;
  title: string;
  description?: string;
  position?: number;
  list_id: string;
  status?: string;
  created_at?: string;
}

export interface List {
  id: string;
  title: string;
  position?: number;
  user_id: string;
  created_at?: string;
}

export interface DashboardStats {
  totalLists: number;
  totalCards: number;
  cardsByStatus: { name: string; value: number; color: string }[];
  listActivity: { name: string; cards: number }[];
  monthlyActivity: { date: string; cards: number; completed: number }[];
  completionRate: number;
}

class TrilouApiService {
  async fetchLists(): Promise<List[]> {
    try {
      // 獲取當前用戶
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        console.error('User not authenticated:', userError);
        return [];
      }

      // 直接從 Supabase 查詢 lists 表
      const { data, error } = await supabase
        .from('lists')
        .select('id, title, position, user_id, created_at')
        .eq('user_id', user.id)
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

  async fetchCards(listId?: string): Promise<Card[]> {
    try {
      // 獲取當前用戶
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        console.error('User not authenticated:', userError);
        return [];
      }

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
          created_at,
          lists!inner(user_id)
        `)
        .eq('lists.user_id', user.id)
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
        const { lists, ...cardData } = card as any;
        return cardData;
      }) || [];

      return cleanedData;
    } catch (error) {
      console.error('Error fetching cards:', error);
      return [];
    }
  }

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

      // 計算各列表的卡片數量
      const listCardCounts = lists.map(list => {
        const cardCount = cards.filter(card => card.list_id === list.id).length;
        return {
          name: list.title,
          cards: cardCount
        };
      });

      // 基於真實創建時間的月度活動數據
      const monthlyActivity = this.generateMonthlyActivity(cards);

      // 計算完成率（假設有 'done' 或 '已完成' 狀態的卡片為已完成）
      const completedCards = cards.filter(card => 
        card.status === 'done' || 
        card.status === '已完成' || 
        card.status === 'completed'
      ).length;
      const completionRate = cards.length > 0 ? Math.round((completedCards / cards.length) * 100) : 0;

      return {
        totalLists: lists.length,
        totalCards: cards.length,
        cardsByStatus,
        listActivity: listCardCounts,
        monthlyActivity,
        completionRate
      };
    } catch (error) {
      console.error('Error getting dashboard stats:', error);
      
      // 返回空數據而不是拋出錯誤，讓 dashboard 可以顯示
      return {
        totalLists: 0,
        totalCards: 0,
        cardsByStatus: [],
        listActivity: [],
        monthlyActivity: [],
        completionRate: 0
      };
    }
  }

  private generateMonthlyActivity(cards: Card[]): { date: string; cards: number; completed: number }[] {
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
        card.status === 'done' || 
        card.status === '已完成' || 
        card.status === 'completed'
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