import { createClient } from './supabase'

const supabase = createClient()

// 食材関連の操作
export const ingredientOperations = {
  // 全食材取得
  async getAll() {
    const { data, error } = await supabase
      .from('ingredients')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  // 食材追加
  async create(ingredient) {
    const { data, error } = await supabase
      .from('ingredients')
      .insert([ingredient])
      .select()
    
    if (error) throw error
    return data[0]
  },

  // 食材更新
  async update(id, updates) {
    const { data, error } = await supabase
      .from('ingredients')
      .update(updates)
      .eq('id', id)
      .select()
    
    if (error) throw error
    return data[0]
  },

  // 食材削除
  async delete(id) {
    const { error } = await supabase
      .from('ingredients')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }
}

// レシピ関連の操作
export const recipeOperations = {
  async getAll() {
    const { data, error } = await supabase
      .from('recipes')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  // お気に入りレシピのみ取得
  async getFavorites() {
    const { data, error } = await supabase
      .from('recipes')
      .select('*')
      .eq('is_favorite', true)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  async create(recipe) {
    const { data, error } = await supabase
      .from('recipes')
      .insert([recipe])
      .select()
    
    if (error) throw error
    return data[0]
  },

  // レシピ削除
  async delete(id) {
    const { error } = await supabase
      .from('recipes')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  },

  // お気に入り状態を更新
  async updateFavoriteStatus(id, isFavorite) {
    const { data, error } = await supabase
      .from('recipes')
      .update({ is_favorite: isFavorite })
      .eq('id', id)
      .select()
    
    if (error) throw error
    return data[0]
  }
}

// 献立プラン関連の操作
export const mealPlanOperations = {
  // 期間指定で献立取得
  async getByDateRange(startDate, endDate) {
    const { data, error } = await supabase
      .from('meal_plans')
      .select('*')
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: true })
      .order('meal_type', { ascending: true })
    
    if (error) throw error
    return data
  },

  // 特定日の献立取得
  async getByDate(date) {
    const { data, error } = await supabase
      .from('meal_plans')
      .select('*')
      .eq('date', date)
      .order('meal_type', { ascending: true })
    
    if (error) throw error
    return data
  },

  // 献立追加
  async create(mealPlan) {
    const { data, error } = await supabase
      .from('meal_plans')
      .insert([mealPlan])
      .select()
    
    if (error) throw error
    return data[0]
  },

  // 献立更新
  async update(id, updates) {
    const { data, error } = await supabase
      .from('meal_plans')
      .update(updates)
      .eq('id', id)
      .select()
    
    if (error) throw error
    return data[0]
  },

  // 献立削除
  async delete(id) {
    const { error } = await supabase
      .from('meal_plans')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  },

  // 特定の日付・食事タイプの献立削除
  async deleteByDateAndMealType(date, mealType) {
    const { error } = await supabase
      .from('meal_plans')
      .delete()
      .eq('date', date)
      .eq('meal_type', mealType)
    
    if (error) throw error
  },

  // 特定期間の献立から必要な食材を抽出
  async getRequiredIngredients(startDate, endDate) {
    try {
      // 期間内の献立を取得
      const mealPlans = await this.getByDateRange(startDate, endDate);
      
      // レシピIDを抽出して重複除去
      const recipeIds = [...new Set(mealPlans
        .filter(plan => plan.recipe_id)
        .map(plan => plan.recipe_id))];

      if (recipeIds.length === 0) {
        return [];
      }

      // レシピの詳細情報を取得
      const { data: recipes, error } = await supabase
        .from('recipes')
        .select('*')
        .in('id', recipeIds);

      if (error) throw error;

      // 必要な食材を集計
      const requiredIngredients = {};

      recipes.forEach(recipe => {
        if (recipe.ingredients_needed && Array.isArray(recipe.ingredients_needed)) {
          recipe.ingredients_needed.forEach(ingredient => {
            const key = ingredient.name.toLowerCase();
            if (requiredIngredients[key]) {
              requiredIngredients[key].quantity += ingredient.quantity || 1;
              requiredIngredients[key].recipes.push(recipe.title);
            } else {
              requiredIngredients[key] = {
                name: ingredient.name,
                quantity: ingredient.quantity || 1,
                unit: ingredient.unit || '適量',
                recipes: [recipe.title]
              };
            }
          });
        }
      });

      return Object.values(requiredIngredients);
    } catch (error) {
      console.error('Error getting required ingredients:', error);
      throw error;
    }
  }
}