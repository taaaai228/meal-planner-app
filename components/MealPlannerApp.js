import React, { useState, useEffect, Fragment } from 'react';
import { 
  getIngredients, 
  addIngredient, 
  updateIngredient, 
  deleteIngredient,
  getBookmarkedRecipes,
  addBookmarkedRecipe,
  deleteBookmarkedRecipe,
  getMealPlans,
  addMealPlan,
  deleteMealPlan
} from '../lib/database';

const MealPlannerApp = () => {
  // === State Management ===
  const [activeTab, setActiveTab] = useState('ingredients');
  const [ingredients, setIngredients] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [bookmarkedRecipes, setBookmarkedRecipes] = useState([]);
  const [mealPlans, setMealPlans] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [showRecipeModal, setShowRecipeModal] = useState(false);
  const [showIngredientModal, setShowIngredientModal] = useState(false);
  const [showShoppingList, setShowShoppingList] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState(null);

  // Form states
  const [ingredientForm, setIngredientForm] = useState({
    name: '',
    quantity: '',
    unit: '',
    category: '',
    expiry_date: ''
  });

  // === Data Loading ===
  useEffect(() => {
    loadIngredients();
    loadBookmarkedRecipes();
    loadMealPlans();
  }, []);

  const loadIngredients = async () => {
    try {
      const data = await getIngredients();
      setIngredients(data || []);
    } catch (error) {
      console.error('Error loading ingredients:', error);
    }
  };

  const loadBookmarkedRecipes = async () => {
    try {
      const data = await getBookmarkedRecipes();
      setBookmarkedRecipes(data || []);
    } catch (error) {
      console.error('Error loading bookmarked recipes:', error);
    }
  };

  const loadMealPlans = async () => {
    try {
      const data = await getMealPlans();
      setMealPlans(data || []);
    } catch (error) {
      console.error('Error loading meal plans:', error);
    }
  };

  // === Ingredient Management ===
  const handleSubmitIngredient = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (editingIngredient) {
        await updateIngredient(editingIngredient.id, ingredientForm);
      } else {
        await addIngredient(ingredientForm);
      }
      
      await loadIngredients();
      resetIngredientForm();
      setShowIngredientModal(false);
    } catch (error) {
      console.error('Error saving ingredient:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditIngredient = (ingredient) => {
    setEditingIngredient(ingredient);
    setIngredientForm({
      name: ingredient.name,
      quantity: ingredient.quantity,
      unit: ingredient.unit,
      category: ingredient.category,
      expiry_date: ingredient.expiry_date || ''
    });
    setShowIngredientModal(true);
  };

  const handleDeleteIngredient = async (id) => {
    if (window.confirm('この食材を削除しますか？')) {
      try {
        await deleteIngredient(id);
        await loadIngredients();
      } catch (error) {
        console.error('Error deleting ingredient:', error);
      }
    }
  };

  const resetIngredientForm = () => {
    setIngredientForm({
      name: '',
      quantity: '',
      unit: '',
      category: '',
      expiry_date: ''
    });
    setEditingIngredient(null);
  };

  // === Recipe Search ===
  const searchRecipes = async () => {
    if (!searchTerm.trim()) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/search-recipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          ingredients: [searchTerm],
          includeBookmarked: true 
        })
      });

      if (response.ok) {
        const data = await response.json();
        setRecipes(data.recipes || []);
      } else {
        console.error('Recipe search failed');
        setRecipes([]);
      }
    } catch (error) {
      console.error('Error searching recipes:', error);
      setRecipes([]);
    } finally {
      setIsLoading(false);
    }
  };

  // === Recipe Details ===
  const fetchRecipeDetails = async (recipeId) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/recipe-detail?id=${recipeId}`);
      if (response.ok) {
        const data = await response.json();
        setSelectedRecipe(data);
        setShowRecipeModal(true);
      }
    } catch (error) {
      console.error('Error fetching recipe details:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // === Bookmark Management ===
  const handleBookmarkRecipe = async (recipe) => {
    try {
      const isBookmarked = bookmarkedRecipes.some(r => r.recipe_id === recipe.id);
      
      if (isBookmarked) {
        const bookmark = bookmarkedRecipes.find(r => r.recipe_id === recipe.id);
        await deleteBookmarkedRecipe(bookmark.id);
      } else {
        await addBookmarkedRecipe({
          recipe_id: recipe.id,
          title: recipe.title,
          image_url: recipe.image,
          source_url: recipe.sourceUrl
        });
      }
      
      await loadBookmarkedRecipes();
    } catch (error) {
      console.error('Error managing bookmark:', error);
    }
  };

  // === Shopping List ===
  const generateShoppingList = () => {
    if (!selectedRecipe) return [];

    const neededIngredients = [];
    const userIngredients = ingredients.reduce((acc, ingredient) => {
      acc[ingredient.name.toLowerCase()] = {
        quantity: parseFloat(ingredient.quantity) || 0,
        unit: ingredient.unit
      };
      return acc;
    }, {});

    selectedRecipe.extendedIngredients?.forEach(recipeIngredient => {
      const ingredientName = recipeIngredient.name.toLowerCase();
      const requiredAmount = recipeIngredient.amount || 0;
      const requiredUnit = recipeIngredient.unit || '';

      const userIngredient = userIngredients[ingredientName];
      
      if (!userIngredient || userIngredient.quantity < requiredAmount) {
        const shortfall = userIngredient 
          ? Math.max(0, requiredAmount - userIngredient.quantity)
          : requiredAmount;

        if (shortfall > 0) {
          neededIngredients.push({
            name: recipeIngredient.name,
            amount: shortfall,
            unit: requiredUnit,
            original: recipeIngredient.original
          });
        }
      }
    });

    return neededIngredients;
  };

  // === Meal Planning ===
  const addToMealPlan = async (recipe, date, mealType) => {
    try {
      await addMealPlan({
        date,
        meal_type: mealType,
        recipe_id: recipe.id,
        recipe_title: recipe.title,
        notes: ''
      });
      await loadMealPlans();
      alert('献立に追加しました！');
    } catch (error) {
      console.error('Error adding to meal plan:', error);
    }
  };

  const removeMealPlan = async (mealPlanId) => {
    if (window.confirm('この献立を削除しますか？')) {
      try {
        await deleteMealPlan(mealPlanId);
        await loadMealPlans();
      } catch (error) {
        console.error('Error removing meal plan:', error);
      }
    }
  };

  // === Filter Functions ===
  const filteredIngredients = ingredients.filter(ingredient =>
    ingredient.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isRecipeBookmarked = (recipeId) => {
    return bookmarkedRecipes.some(bookmark => bookmark.recipe_id === recipeId);
  };

  // === Render Functions ===
  const renderIngredientsList = () => (
    <Fragment>
      <div className="search-container">
        <input
          type="text"
          placeholder="食材を検索..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="flex justify-between items-center mb-4">
        <h2 className="font-semibold text-gray-800">食材一覧 ({filteredIngredients.length})</h2>
        <button
          onClick={() => setShowIngredientModal(true)}
          className="btn-mobile btn-primary"
        >
          + 追加
        </button>
      </div>

      <div>
        {filteredIngredients.map(ingredient => (
          <div key={ingredient.id} className="ingredient-item">
            <div className="ingredient-info">
              <div className="ingredient-name">{ingredient.name}</div>
              <div className="ingredient-details">
                {ingredient.quantity} {ingredient.unit} | {ingredient.category}
                {ingredient.expiry_date && (
                  <span className="text-red-600 ml-2">
                    期限: {new Date(ingredient.expiry_date).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
            <div className="ingredient-actions">
              <button
                onClick={() => handleEditIngredient(ingredient)}
                className="btn-mobile btn-secondary"
                style={{minWidth: '32px', padding: '6px'}}
              >
                ✏️
              </button>
              <button
                onClick={() => handleDeleteIngredient(ingredient.id)}
                className="btn-mobile btn-secondary"
                style={{minWidth: '32px', padding: '6px', color: '#dc2626'}}
              >
                🗑️
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredIngredients.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          {searchTerm ? '検索結果がありません' : '食材が登録されていません'}
        </div>
      )}
    </Fragment>
  );

  const renderRecipeSearch = () => (
    <Fragment>
      <div className="search-container">
        <input
          type="text"
          placeholder="レシピを検索... (例: 鶏肉、トマト)"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
          onKeyPress={(e) => e.key === 'Enter' && searchRecipes()}
        />
        <button
          onClick={searchRecipes}
          disabled={isLoading || !searchTerm.trim()}
          className="btn-mobile btn-primary mt-3"
          style={{width: '100%'}}
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="loading-spinner"></span>
              検索中...
            </span>
          ) : (
            '🔍 レシピを検索'
          )}
        </button>
      </div>

      <div>
        {recipes.map(recipe => (
          <div key={recipe.id} className="recipe-card">
            {recipe.image && (
              <img
                src={recipe.image}
                alt={recipe.title}
                className="recipe-image"
              />
            )}
            <div className="recipe-content">
              <h3 className="recipe-title">{recipe.title}</h3>
              <div className="recipe-meta">
                <span>🕒 {recipe.readyInMinutes || 30}分</span>
                <span>👥 {recipe.servings || 2}人分</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => fetchRecipeDetails(recipe.id)}
                  className="btn-mobile btn-primary"
                  style={{flex: 1}}
                >
                  詳細を見る
                </button>
                <button
                  onClick={() => handleBookmarkRecipe(recipe)}
                  className={`btn-mobile ${isRecipeBookmarked(recipe.id) ? 'btn-primary' : 'btn-secondary'}`}
                  style={{minWidth: '44px'}}
                >
                  {isRecipeBookmarked(recipe.id) ? '❤️' : '🤍'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {recipes.length === 0 && searchTerm && !isLoading && (
        <div className="text-center py-8 text-gray-500">
          検索結果が見つかりませんでした
        </div>
      )}
    </Fragment>
  );

  const renderBookmarks = () => (
    <Fragment>
      <h2 className="font-semibold text-gray-800 mb-4">
        お気に入りレシピ ({bookmarkedRecipes.length})
      </h2>

      <div>
        {bookmarkedRecipes.map(bookmark => (
          <div key={bookmark.id} className="recipe-card">
            {bookmark.image_url && (
              <img
                src={bookmark.image_url}
                alt={bookmark.title}
                className="recipe-image"
              />
            )}
            <div className="recipe-content">
              <h3 className="recipe-title">{bookmark.title}</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => fetchRecipeDetails(bookmark.recipe_id)}
                  className="btn-mobile btn-primary"
                  style={{flex: 1}}
                >
                  詳細を見る
                </button>
                <button
                  onClick={() => handleBookmarkRecipe({id: bookmark.recipe_id, title: bookmark.title, image: bookmark.image_url})}
                  className="btn-mobile btn-secondary"
                  style={{minWidth: '44px', color: '#dc2626'}}
                >
                  🗑️
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {bookmarkedRecipes.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          お気に入りレシピがありません
        </div>
      )}
    </Fragment>
  );

  const renderMealPlans = () => {
    const today = new Date().toISOString().split('T')[0];
    const nextWeek = [];
    
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      nextWeek.push(date.toISOString().split('T')[0]);
    }

    return (
      <Fragment>
        <h2 className="font-semibold text-gray-800 mb-4">週間献立</h2>

        {nextWeek.map(date => {
          const dayMeals = mealPlans.filter(meal => meal.date === date);
          const dayName = new Date(date).toLocaleDateString('ja-JP', { 
            weekday: 'short', 
            month: 'short', 
            day: 'numeric' 
          });

          return (
            <div key={date} className="card-mobile">
              <h3 className="font-medium text-gray-800 mb-3">
                {dayName} {date === today && '(今日)'}
              </h3>

              {['朝食', '昼食', '夕食'].map(mealType => {
                const meal = dayMeals.find(m => m.meal_type === mealType);
                
                return (
                  <div key={mealType} className="mb-3 pb-3 border-b border-gray-100 last:border-b-0 last:mb-0 last:pb-0">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-gray-600">{mealType}</span>
                      {meal && (
                        <button
                          onClick={() => removeMealPlan(meal.id)}
                          className="btn-mobile btn-secondary"
                          style={{minWidth: '32px', padding: '4px', fontSize: '0.75rem', color: '#dc2626'}}
                        >
                          削除
                        </button>
                      )}
                    </div>
                    
                    {meal ? (
                      <div className="text-gray-800">{meal.recipe_title}</div>
                    ) : (
                      <div className="text-gray-400 text-sm">未設定</div>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </Fragment>
    );
  };

  // === Modal Components ===
  const IngredientModal = () => (
    <div className="modal-overlay" onClick={() => setShowIngredientModal(false)}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">
            {editingIngredient ? '食材を編集' : '新しい食材を追加'}
          </h2>
          <button
            onClick={() => {
              setShowIngredientModal(false);
              resetIngredientForm();
            }}
            className="modal-close"
          >
            ✕
          </button>
        </div>

        <div className="modal-body">
          <form onSubmit={handleSubmitIngredient}>
            <div className="form-group">
              <label className="form-label">食材名</label>
              <input
                type="text"
                value={ingredientForm.name}
                onChange={(e) => setIngredientForm({...ingredientForm, name: e.target.value})}
                className="input-mobile"
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">数量</label>
                <input
                  type="number"
                  step="0.1"
                  value={ingredientForm.quantity}
                  onChange={(e) => setIngredientForm({...ingredientForm, quantity: e.target.value})}
                  className="input-mobile"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">単位</label>
                <select
                  value={ingredientForm.unit}
                  onChange={(e) => setIngredientForm({...ingredientForm, unit: e.target.value})}
                  className="select-mobile"
                  required
                >
                  <option value="">選択</option>
                  <option value="g">g</option>
                  <option value="kg">kg</option>
                  <option value="ml">ml</option>
                  <option value="L">L</option>
                  <option value="個">個</option>
                  <option value="本">本</option>
                  <option value="袋">袋</option>
                  <option value="パック">パック</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">カテゴリ</label>
              <select
                value={ingredientForm.category}
                onChange={(e) => setIngredientForm({...ingredientForm, category: e.target.value})}
                className="select-mobile"
                required
              >
                <option value="">選択</option>
                <option value="野菜">野菜</option>
                <option value="肉類">肉類</option>
                <option value="魚介類">魚介類</option>
                <option value="乳製品">乳製品</option>
                <option value="調味料">調味料</option>
                <option value="穀物">穀物</option>
                <option value="その他">その他</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">賞味期限（任意）</label>
              <input
                type="date"
                value={ingredientForm.expiry_date}
                onChange={(e) => setIngredientForm({...ingredientForm, expiry_date: e.target.value})}
                className="input-mobile"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-mobile btn-primary"
              style={{width: '100%'}}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="loading-spinner"></span>
                  保存中...
                </span>
              ) : (
                editingIngredient ? '更新' : '追加'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );

  const RecipeModal = () => {
    const shoppingList = generateShoppingList();
    
    return (
      <div className="modal-overlay" onClick={() => setShowRecipeModal(false)}>
        <div className="modal-content" onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <h2 className="modal-title">{selectedRecipe?.title}</h2>
            <button
              onClick={() => setShowRecipeModal(false)}
              className="modal-close"
            >
              ✕
            </button>
          </div>

          <div className="modal-body">
            {selectedRecipe?.image && (
              <img
                src={selectedRecipe.image}
                alt={selectedRecipe.title}
                className="w-full h-48 object-cover rounded-lg mb-4"
              />
            )}

            <div className="recipe-meta mb-4 text-center">
              <span className="text-gray-600 mr-4">🕒 {selectedRecipe?.readyInMinutes || 30}分</span>
              <span className="text-gray-600">👥 {selectedRecipe?.servings || 2}人分</span>
            </div>

            {selectedRecipe?.summary && (
              <div className="mb-4">
                <h3 className="font-semibold mb-2">概要</h3>
                <p className="text-gray-700 text-sm" dangerouslySetInnerHTML={{
                  __html: selectedRecipe.summary.replace(/<[^>]*>/g, '')
                }} />
              </div>
            )}

            <div className="mb-4">
              <h3 className="font-semibold mb-2">材料</h3>
              <div className="space-y-1">
                {selectedRecipe?.extendedIngredients?.map((ingredient, index) => (
                  <div key={index} className="text-sm text-gray-700 py-1 border-b border-gray-100">
                    {ingredient.original}
                  </div>
                ))}
              </div>
            </div>

            {selectedRecipe?.analyzedInstructions?.[0]?.steps && (
              <div className="mb-4">
                <h3 className="font-semibold mb-2">作り方</h3>
                <div className="space-y-2">
                  {selectedRecipe.analyzedInstructions[0].steps.map((step, index) => (
                    <div key={index} className="flex gap-3">
                      <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium flex-shrink-0">
                        {step.number}
                      </span>
                      <p className="text-sm text-gray-700">{step.step}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setShowShoppingList(!showShoppingList)}
                className="btn-mobile btn-secondary"
                style={{flex: 1}}
              >
                🛒 買い物リスト ({shoppingList.length})
              </button>
              <button
                onClick={() => {
                  const date = prompt('献立に追加する日付を入力してください (YYYY-MM-DD):', new Date().toISOString().split('T')[0]);
                  const mealType = prompt('食事の種類を入力してください (朝食/昼食/夕食):', '夕食');
                  if (date && mealType && ['朝食', '昼食', '夕食'].includes(mealType)) {
                    addToMealPlan(selectedRecipe, date, mealType);
                  }
                }}
                className="btn-mobile btn-primary"
              >
                📅 献立に追加
              </button>
            </div>

            {showShoppingList && (
              <div className="card-mobile bg-blue-50">
                <h4 className="font-semibold mb-2 text-blue-800">買い物リスト</h4>
                {shoppingList.length > 0 ? (
                  <div className="space-y-1">
                    {shoppingList.map((item, index) => (
                      <div key={index} className="text-sm text-blue-700 py-1">
                        • {item.name}: {item.amount} {item.unit}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-blue-600 text-sm">必要な食材はすべて揃っています！</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // === Main Render ===
  return (
    <div className="main-container safe-area-top safe-area-bottom">
      <header className="header-mobile">
        🍽️ Meal Planner
      </header>

      <nav className="tab-navigation">
        <button
          onClick={() => setActiveTab('ingredients')}
          className={`tab-button ${activeTab === 'ingredients' ? 'active' : ''}`}
        >
          🥬 食材
        </button>
        <button
          onClick={() => setActiveTab('recipes')}
          className={`tab-button ${activeTab === 'recipes' ? 'active' : ''}`}
        >
          🔍 レシピ
        </button>
        <button
          onClick={() => setActiveTab('bookmarks')}
          className={`tab-button ${activeTab === 'bookmarks' ? 'active' : ''}`}
        >
          ❤️ お気に入り
        </button>
        <button
          onClick={() => setActiveTab('mealPlan')}
          className={`tab-button ${activeTab === 'mealPlan' ? 'active' : ''}`}
        >
          📅 献立
        </button>
      </nav>

      <main>
        {activeTab === 'ingredients' && renderIngredientsList()}
        {activeTab === 'recipes' && renderRecipeSearch()}
        {activeTab === 'bookmarks' && renderBookmarks()}
        {activeTab === 'mealPlan' && renderMealPlans()}
      </main>

      {showIngredientModal && <IngredientModal />}
      {showRecipeModal && selectedRecipe && <RecipeModal />}
    </div>
  );
};

export default MealPlannerApp;