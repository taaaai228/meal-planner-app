import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Plus, Minus, Edit2, Save, X, Search, Calendar, ChefHat, Refrigerator, AlertTriangle, Package, Trash2, Clock, Users, Heart, ExternalLink, Star, Info, Loader, ShoppingCart } from 'lucide-react';
import { ingredientOperations, recipeOperations, mealPlanOperations } from '../lib/database';
import { translateTexts, translateSingleText } from '../lib/translationHelper';
import MealCalendar from './MealCalendar';

// お気に入り管理セクション（旧ブックマークセクション）
const FavoriteSection = ({ onCalendarRegister }) => {
  const [favoriteRecipes, setFavoriteRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [selectedRecipeId, setSelectedRecipeId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // お気に入りレシピを読み込み
  const loadFavoriteRecipes = async () => {
    setLoading(true);
    try {
      const data = await recipeOperations.getFavorites();
      setFavoriteRecipes(data);
      setMessage(`${data.length}件のお気に入りレシピがあります`);
    } catch (error) {
      setMessage(`読み込みエラー: ${error.message}`);
    }
    setLoading(false);
  };

  // 初期読み込み
  useEffect(() => {
    loadFavoriteRecipes();
  }, []);

  // お気に入りから削除
  const removeFromFavorites = async (id) => {
    if (!confirm('このレシピをお気に入りから削除しますか？')) return;

    try {
      await recipeOperations.updateFavoriteStatus(id, false);
      setFavoriteRecipes(favoriteRecipes.filter(recipe => recipe.id !== id));
      setMessage('お気に入りから削除しました');
    } catch (error) {
      setMessage(`削除エラー: ${error.message}`);
    }
  };

  // レシピ詳細を開く（保存済みレシピの場合はローカルデータを使用）
  const openRecipeDetail = (recipe) => {
    // 保存済みレシピの場合、Spoonacular IDがない可能性があるので
    // まずはローカルデータで詳細表示を試みる
    if (recipe.source_url && recipe.source_url.includes('spoonacular.com')) {
      // Spoonacular由来のレシピの場合、IDを抽出
      const match = recipe.source_url.match(/recipes\/.*-(\d+)$/);
      if (match) {
        setSelectedRecipeId(match[1]);
        setIsModalOpen(true);
        return;
      }
    }
    
    // Spoonacular ID取得できない場合は簡易詳細表示
    setMessage('このレシピは簡易表示のみ利用可能です');
  };

  // レシピ詳細を閉じる
  const closeRecipeDetail = () => {
    setIsModalOpen(false);
    setSelectedRecipeId(null);
  };

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">お気に入りレシピ</h2>
          <button
            onClick={loadFavoriteRecipes}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            更新
          </button>
        </div>

        {/* メッセージ表示 */}
        {message && (
          <div className={`p-3 rounded-lg ${
            message.includes('エラー')
              ? 'bg-red-100 border border-red-300 text-red-700'
              : 'bg-blue-100 border border-blue-300 text-blue-700'
          }`}>
            {message}
            <button 
              onClick={() => setMessage('')}
              className="float-right text-sm underline"
            >
              閉じる
            </button>
          </div>
        )}
      </div>

      {/* レシピ一覧 */}
      {loading ? (
        <div className="bg-white p-8 rounded-lg shadow-sm text-center">
          <div className="inline-flex items-center">
            <Loader className="animate-spin mr-2" size={20} />
            読み込み中...
          </div>
        </div>
      ) : favoriteRecipes.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow-sm text-center">
          <Star className="mx-auto mb-4 text-gray-400" size={48} />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">お気に入りレシピがありません</h3>
          <p className="text-gray-600">レシピ検索から気に入ったレシピをお気に入りに追加してみましょう</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-semibold">お気に入りレシピ ({favoriteRecipes.length}件)</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
            {favoriteRecipes.map((recipe) => (
              <div key={recipe.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                {/* レシピ画像 */}
                <div className="relative h-48 bg-gray-200">
                  {recipe.image_url ? (
                    <img
                      src={recipe.image_url}
                      alt={recipe.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/300x200?text=No+Image';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                      <ChefHat className="text-gray-400" size={48} />
                    </div>
                  )}
                  
                  <div className="absolute top-2 right-2 bg-yellow-500 text-white p-1 rounded-full">
                    <Star size={16} fill="currentColor" />
                  </div>
                </div>

                {/* レシピ情報 */}
                <div className="p-4">
                  <h4 className="font-semibold text-gray-900 mb-2 line-clamp-2">{recipe.title}</h4>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{recipe.description}</p>
                  
                  <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      {recipe.cooking_time || '不明'}分
                    </span>
                    <span className="flex items-center gap-1">
                      <Users size={12} />
                      {recipe.servings || '不明'}人分
                    </span>
                  </div>

                  {/* 材料プレビュー */}
                  {recipe.ingredients_needed && recipe.ingredients_needed.length > 0 && (
                    <div className="mb-3">
                      <span className="text-xs font-medium text-gray-700">材料:</span>
                      <p className="text-xs text-gray-600 truncate">
                        {recipe.ingredients_needed.slice(0, 3).map(ing => ing.name).join(', ')}
                        {recipe.ingredients_needed.length > 3 && '...'}
                      </p>
                    </div>
                  )}

                  {/* 保存日時 */}
                  <div className="text-xs text-gray-400 mb-3">
                    保存日: {new Date(recipe.created_at).toLocaleDateString()}
                  </div>

                  {/* アクションボタン */}
                  <div className="flex gap-2">
                    {recipe.source_url && recipe.source_url !== '#' && (
                      <a
                        href={recipe.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 py-2 px-3 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors text-center"
                      >
                        <ExternalLink size={14} className="inline mr-1" />
                        元サイト
                      </a>
                    )}
                    
                    {recipe.source_url && recipe.source_url.includes('spoonacular.com') && (
                      <button
                        onClick={() => openRecipeDetail(recipe)}
                        className="flex-1 py-2 px-3 bg-purple-500 text-white text-sm rounded-lg hover:bg-purple-600 transition-colors"
                      >
                        <Info size={14} className="inline mr-1" />
                        詳細
                      </button>
                    )}
                    
                    <button
                      onClick={() => removeFromFavorites(recipe.id)}
                      className="py-2 px-3 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition-colors"
                    >
                      <Heart size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* レシピ詳細モーダル */}
      <RecipeDetailModal
        recipeId={selectedRecipeId}
        isOpen={isModalOpen}
        onClose={closeRecipeDetail}
        onCalendarRegister={onCalendarRegister}
      />
    </div>
  );
};

// レシピ詳細モーダルコンポーネント（不足食材機能付き）
const RecipeDetailModal = ({ recipeId, isOpen, onClose, ingredients = [], onCalendarRegister }) => {
  const [recipeDetail, setRecipeDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [missingIngredients, setMissingIngredients] = useState([]);
  const [shoppingList, setShoppingList] = useState([]);
  
  // カレンダー登録用の状態
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedMealType, setSelectedMealType] = useState('dinner');

  const mealTypeOptions = [
    { value: 'breakfast', label: '朝食', icon: '🌅' },
    { value: 'lunch', label: '昼食', icon: '🌞' },
    { value: 'dinner', label: '夕食', icon: '🌙' }
  ];

  // レシピ詳細データを取得
  const fetchRecipeDetail = async (id) => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(`/api/recipe-detail?id=${id}`);
      const data = await response.json();
      
      if (data.success) {
        setRecipeDetail(data.recipe);
        // 不足食材を分析
        analyzeMissingIngredients(data.recipe);
      } else {
        setError('レシピ詳細の取得に失敗しました');
      }
    } catch (error) {
      setError(`エラー: ${error.message}`);
    }
    
    setLoading(false);
  };

  // 不足食材を分析
  const analyzeMissingIngredients = (recipe) => {
    if (!recipe.extendedIngredients || !ingredients.length) {
      setMissingIngredients([]);
      return;
    }

    const currentIngredients = {};
    ingredients.forEach(ing => {
      currentIngredients[ing.name.toLowerCase()] = ing.quantity;
    });

    const missing = [];
    recipe.extendedIngredients.forEach(ingredient => {
      const ingredientName = ingredient.name.toLowerCase();
      const needed = ingredient.amount || 1;
      const current = currentIngredients[ingredientName] || 0;
      
      if (current < needed) {
        missing.push({
          name: ingredient.name,
          needed: needed,
          current: current,
          shortage: needed - current,
          unit: ingredient.unit || '適量',
          image: ingredient.image
        });
      }
    });

    setMissingIngredients(missing);
    
    // 買い物リスト用に整形
    const shoppingItems = missing.map((item, index) => ({
      id: index,
      name: item.name,
      quantity: item.shortage,
      unit: item.unit,
      checked: false
    }));
    setShoppingList(shoppingItems);
  };

  // モーダルが開いた時にデータを取得
  useEffect(() => {
    if (isOpen && recipeId) {
      fetchRecipeDetail(recipeId);
    }
  }, [isOpen, recipeId]);

  // 買い物リストアイテムのチェック状態を切り替え
  const toggleShoppingItem = (itemId) => {
    setShoppingList(prev => 
      prev.map(item => 
        item.id === itemId 
          ? { ...item, checked: !item.checked }
          : item
      )
    );
  };

  // レシピ保存（重複チェック付き、お気に入り専用）
  const saveRecipeToFavorites = async () => {
    if (!recipeDetail) return;

    try {
      // 既存のお気に入りレシピをチェック（タイトルベース）
      const existingRecipes = await recipeOperations.getFavorites();
      const isDuplicate = existingRecipes.some(recipe => 
        recipe.title.toLowerCase() === recipeDetail.title.toLowerCase()
      );

      if (isDuplicate) {
        setError('このレシピは既にお気に入りに登録されています');
        setTimeout(() => setError(''), 3000);
        return;
      }

      const recipeData = {
        title: recipeDetail.title,
        description: recipeDetail.summary ? recipeDetail.summary.substring(0, 200) + '...' : 'レシピの詳細はソースサイトをご確認ください',
        ingredients_needed: recipeDetail.extendedIngredients?.map(ing => ({
          name: ing.name,
          quantity: ing.amount || 1,
          unit: ing.unit || '適量'
        })) || [],
        instructions: recipeDetail.instructions || 'レシピサイトを参照してください',
        cooking_time: recipeDetail.readyInMinutes,
        servings: recipeDetail.servings,
        image_url: recipeDetail.image,
        source_url: recipeDetail.sourceUrl || recipeDetail.spoonacularSourceUrl,
        is_favorite: true // お気に入りフラグ
      };

      await recipeOperations.create(recipeData);
      setError(''); // エラーをクリア
      // 成功メッセージを一時表示
      setError('レシピをお気に入りに追加しました！');
      setTimeout(() => setError(''), 3000);
    } catch (error) {
      setError(`保存エラー: ${error.message}`);
    }
  };

  // カレンダーに登録（自動的にレシピも保存）
  const saveToCalendar = async () => {
    if (!recipeDetail || !selectedDate) return;

    try {
      // 1. レシピをデータベースに保存（お気に入りではない）
      const recipeData = {
        title: recipeDetail.title,
        description: recipeDetail.summary ? recipeDetail.summary.substring(0, 200) + '...' : 'レシピの詳細はソースサイトをご確認ください',
        ingredients_needed: recipeDetail.extendedIngredients?.map(ing => ({
          name: ing.name,
          quantity: ing.amount || 1,
          unit: ing.unit || '適量'
        })) || [],
        instructions: recipeDetail.instructions || 'レシピサイトを参照してください',
        cooking_time: recipeDetail.readyInMinutes,
        servings: recipeDetail.servings,
        image_url: recipeDetail.image,
        source_url: recipeDetail.sourceUrl || recipeDetail.spoonacularSourceUrl,
        is_favorite: false // お気に入りではない（カレンダー用）
      };

      // 既存レシピをチェック（重複回避）
      const existingRecipes = await recipeOperations.getAll();
      let savedRecipe = existingRecipes.find(recipe => 
        recipe.title.toLowerCase() === recipeDetail.title.toLowerCase()
      );

      if (!savedRecipe) {
        savedRecipe = await recipeOperations.create(recipeData);
      }

      // 2. 献立プランを作成
      const mealPlanData = {
        date: selectedDate,
        meal_type: selectedMealType,
        recipe_id: savedRecipe.id,
        recipe_title: recipeDetail.title,
        notes: ''
      };

      await mealPlanOperations.create(mealPlanData);
      
      setError('');
      setError('レシピをカレンダーに登録しました！');
      setTimeout(() => setError(''), 3000);
      
      // モーダルを閉じてカレンダータブに切り替え
      setShowCalendarModal(false);
      onClose(); // レシピ詳細モーダルも閉じる
      
      // 親コンポーネントにカレンダー登録を通知
      if (onCalendarRegister) {
        onCalendarRegister(selectedDate, selectedMealType);
      }
    } catch (error) {
      setError(`カレンダー登録エラー: ${error.message}`);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-7xl w-full max-h-[90vh] overflow-y-auto">
        {/* ヘッダー */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">レシピ詳細</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* コンテンツ */}
        <div className="flex">
          {/* メインコンテンツ */}
          <div className="flex-1 p-6">
            {loading && (
              <div className="flex items-center justify-center py-12">
                <Loader className="animate-spin mr-2" size={20} />
                <span>レシピ詳細を読み込み中...</span>
              </div>
            )}

            {error && (
              <div className={`mb-4 p-3 rounded-lg ${
                error.includes('保存しました') 
                  ? 'bg-green-100 border border-green-300 text-green-700'
                  : 'bg-red-100 border border-red-300 text-red-700'
              }`}>
                {error}
              </div>
            )}

            {recipeDetail && (
              <div className="space-y-6">
                {/* レシピタイトルと画像 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">{recipeDetail.title}</h3>
                    
                    {/* 基本情報 */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Clock size={16} />
                        <span>{recipeDetail.readyInMinutes || '不明'}分</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Users size={16} />
                        <span>{recipeDetail.servings || '不明'}人分</span>
                      </div>
                      {recipeDetail.aggregateLikes > 0 && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <Heart size={16} />
                          <span>{recipeDetail.aggregateLikes} いいね</span>
                        </div>
                      )}
                      {recipeDetail.healthScore && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <Info size={16} />
                          <span>健康度: {recipeDetail.healthScore}/100</span>
                        </div>
                      )}
                    </div>

                    {/* タグ */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {recipeDetail.vegetarian && (
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">ベジタリアン</span>
                      )}
                      {recipeDetail.vegan && (
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">ビーガン</span>
                      )}
                      {recipeDetail.glutenFree && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">グルテンフリー</span>
                      )}
                      {recipeDetail.dairyFree && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">乳製品フリー</span>
                      )}
                      {recipeDetail.veryHealthy && (
                        <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full">とてもヘルシー</span>
                      )}
                    </div>

                    {/* 概要 */}
                    {recipeDetail.summary && (
                      <div className="mb-4">
                        <h4 className="font-semibold text-gray-900 mb-2">概要</h4>
                        <p className="text-gray-700 text-sm leading-relaxed">
                          {recipeDetail.summary.substring(0, 300)}...
                        </p>
                      </div>
                    )}
                  </div>

                  {/* レシピ画像 */}
                  <div>
                    <img
                      src={recipeDetail.image}
                      alt={recipeDetail.title}
                      className="w-full h-64 object-cover rounded-lg"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/400x300?text=No+Image';
                      }}
                    />
                  </div>
                </div>

                {/* 材料リスト */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">材料 ({recipeDetail.servings}人分)</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {recipeDetail.extendedIngredients?.map((ingredient, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        {ingredient.image && (
                          <img
                            src={`https://spoonacular.com/cdn/ingredients_100x100/${ingredient.image}`}
                            alt={ingredient.name}
                            className="w-8 h-8 object-cover rounded"
                          />
                        )}
                        <div className="flex-1">
                          <span className="font-medium text-gray-900">{ingredient.name}</span>
                          <div className="text-sm text-gray-600">
                            {ingredient.amount} {ingredient.unit}
                          </div>
                        </div>
                      </div>
                    )) || (
                      <p className="text-gray-500 col-span-2">材料情報が取得できませんでした</p>
                    )}
                  </div>
                </div>

                {/* 調理手順 */}
                {recipeDetail.instructions && (
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">作り方</h4>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <pre className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                        {recipeDetail.instructions}
                      </pre>
                    </div>
                  </div>
                )}

                {/* 栄養情報 */}
                {recipeDetail.nutrition && (
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">栄養成分 (1人分)</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <div className="text-lg font-bold text-blue-600">{Math.round(recipeDetail.nutrition.calories || 0)}</div>
                        <div className="text-sm text-gray-600">カロリー</div>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <div className="text-lg font-bold text-green-600">{Math.round(recipeDetail.nutrition.protein || 0)}g</div>
                        <div className="text-sm text-gray-600">タンパク質</div>
                      </div>
                      <div className="text-center p-3 bg-yellow-50 rounded-lg">
                        <div className="text-lg font-bold text-yellow-600">{Math.round(recipeDetail.nutrition.carbohydrates || 0)}g</div>
                        <div className="text-sm text-gray-600">炭水化物</div>
                      </div>
                      <div className="text-center p-3 bg-red-50 rounded-lg">
                        <div className="text-lg font-bold text-red-600">{Math.round(recipeDetail.nutrition.fat || 0)}g</div>
                        <div className="text-sm text-gray-600">脂質</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* アクションボタン */}
                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => setShowCalendarModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    <Calendar size={16} />
                    カレンダーに登録
                  </button>
                  <button
                    onClick={saveRecipeToFavorites}
                    className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
                  >
                    <Star size={16} />
                    お気に入りに追加
                  </button>
                  <a
                    href={recipeDetail.sourceUrl || recipeDetail.spoonacularSourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    <ExternalLink size={16} />
                    元のサイトで見る
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* サイドバー：不足食材・買い物リスト */}
          {missingIngredients.length > 0 && (
            <div className="w-80 border-l border-gray-200 bg-gray-50">
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <ShoppingCart size={20} />
                  買い物リスト
                </h3>
                
                <div className="space-y-3">
                  <div className="text-sm text-gray-600 mb-3">
                    {missingIngredients.length}個の食材が不足しています
                  </div>
                  
                  {shoppingList.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm">
                      <input
                        type="checkbox"
                        checked={item.checked}
                        onChange={() => toggleShoppingItem(item.id)}
                        className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                      />
                      <div className={`flex-1 ${item.checked ? 'line-through opacity-60' : ''}`}>
                        <div className="font-medium text-gray-900">{item.name}</div>
                        <div className="text-sm text-gray-600">
                          {item.quantity} {item.unit}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <div className="pt-3 border-t border-gray-200">
                    <div className="text-xs text-gray-500">
                      完了: {shoppingList.filter(item => item.checked).length} / 
                      合計: {shoppingList.length}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* カレンダー登録モーダル */}
      {showCalendarModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">カレンダーに登録</h3>
                <button 
                  onClick={() => setShowCalendarModal(false)} 
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    日付
                  </label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    食事
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {mealTypeOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setSelectedMealType(option.value)}
                        className={`p-3 text-center rounded-lg border transition-colors ${
                          selectedMealType === option.value
                            ? 'bg-blue-500 text-white border-blue-500'
                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className="text-lg mb-1">{option.icon}</div>
                        <div className="text-sm font-medium">{option.label}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-3 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-1">登録するレシピ</h4>
                  <p className="text-sm text-gray-600">{recipeDetail?.title}</p>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={saveToCalendar}
                  disabled={!selectedDate}
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 transition-colors"
                >
                  登録
                </button>
                <button
                  onClick={() => setShowCalendarModal(false)}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  キャンセル
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// レシピ検索セクション
const RecipeSearchSection = ({ ingredients, onCalendarRegister }) => {
  const [searchMode, setSearchMode] = useState('ingredients');
  const [selectedIngredients, setSelectedIngredients] = useState([]);
  const [mainFood, setMainFood] = useState('');
  const [keywordQuery, setKeywordQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [savedRecipeMatches, setSavedRecipeMatches] = useState([]); // 保存済みレシピのマッチング結果
  const [isSearching, setIsSearching] = useState(false);
  const [searchMessage, setSearchMessage] = useState('');
  
  // レシピ詳細モーダル用の状態
  const [selectedRecipeId, setSelectedRecipeId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // レシピ詳細を開く
  const openRecipeDetail = (recipeId) => {
    setSelectedRecipeId(recipeId);
    setIsModalOpen(true);
  };

  // レシピ詳細を閉じる
  const closeRecipeDetail = () => {
    setIsModalOpen(false);
    setSelectedRecipeId(null);
  };

  // 保存済みレシピから検索（Google Translate API使用）
  const searchSavedRecipes = async (searchIngredients) => {
    try {
      // 入力値の検証
      if (!Array.isArray(searchIngredients) || searchIngredients.length === 0) {
        return [];
      }

      const translationResults = await translateTexts(searchIngredients);
      const translatedTerms = translationResults?.map(result => result?.translated).filter(Boolean) || [];
      const allSearchTerms = [...searchIngredients, ...translatedTerms];
      
      const savedRecipes = await recipeOperations.getAll();
      
      const matchingRecipes = savedRecipes.filter(recipe => {
        // レシピデータの検証
        if (!recipe || !Array.isArray(recipe.ingredients_needed)) {
          return false;
        }
        
        const recipeIngredients = recipe.ingredients_needed
          .map(ing => ing?.name?.toLowerCase())
          .filter(Boolean);
        
        const hasMatch = allSearchTerms.some(searchTerm => {
          if (!searchTerm || typeof searchTerm !== 'string') return false;
          
          return recipeIngredients.some(recipeIng => {
            if (!recipeIng) return false;
            
            const searchLower = searchTerm.toLowerCase();
            return recipeIng.includes(searchLower) || searchLower.includes(recipeIng);
          });
        });
        
        return hasMatch;
      });

      return matchingRecipes.map(recipe => {
        const recipeIngredients = recipe.ingredients_needed
          .map(ing => ing?.name?.toLowerCase())
          .filter(Boolean);
        
        const matchCount = allSearchTerms.filter(searchTerm => {
          if (!searchTerm || typeof searchTerm !== 'string') return false;
          
          return recipeIngredients.some(recipeIng => {
            if (!recipeIng) return false;
            
            const searchLower = searchTerm.toLowerCase();
            return recipeIng.includes(searchLower) || searchLower.includes(recipeIng);
          });
        }).length;

        return {
          ...recipe,
          matchCount,
          matchPercentage: searchIngredients.length > 0 
            ? Math.round((matchCount / searchIngredients.length) * 100)
            : 0
        };
      }).sort((a, b) => b.matchCount - a.matchCount);
      
    } catch (error) {
      console.error('保存済みレシピ検索エラー:', error);
      return [];
    }
  };

  // 食材ベース検索
  const searchByIngredients = async () => {
    if (selectedIngredients.length === 0 && !mainFood?.trim()) {
      setSearchMessage('食材を選択するか、メイン食材を入力してください');
      return;
    }

    setIsSearching(true);
    setSearchMessage('');
    setSavedRecipeMatches([]);
    
    try {
      const allIngredients = [...selectedIngredients];
      const trimmedMainFood = mainFood?.trim();
      if (trimmedMainFood && !allIngredients.includes(trimmedMainFood)) {
        allIngredients.push(trimmedMainFood);
      }

      // 保存済みレシピから検索
      const savedMatches = await searchSavedRecipes(allIngredients);
      setSavedRecipeMatches(savedMatches);

      // Spoonacular APIから検索
      const requestBody = {
        searchType: 'ingredients',
        ingredients: selectedIngredients,
        mainFood: trimmedMainFood || undefined
      };

      const response = await fetch('/api/search-recipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data?.success) {
        setSearchResults(Array.isArray(data.recipes) ? data.recipes : []);
        
        const totalResults = (data.searchInfo?.totalResults || data.recipes?.length || 0) + savedMatches.length;
        let message = `${totalResults}件のレシピが見つかりました`;
        if (savedMatches.length > 0) {
          message += ` (うち${savedMatches.length}件は保存済みレシピから)`;
        }
        
        setSearchMessage(message);
      } else {
        setSearchResults([]);
        const message = savedMatches.length > 0 
          ? `API接続エラー: 保存済みレシピから${savedMatches.length}件見つかりました`
          : (data?.searchInfo?.fallback 
            ? 'API接続エラー: フォールバックデータを表示中' 
            : '検索に失敗しました');
        setSearchMessage(message);
      }
    } catch (error) {
      console.error('検索エラー:', error);
      const message = savedRecipeMatches.length > 0
        ? `検索エラー: 保存済みレシピから${savedRecipeMatches.length}件表示中`
        : `検索エラー: ${error.message}`;
      setSearchMessage(message);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // キーワード検索
  const searchByKeyword = async () => {
    if (!keywordQuery.trim()) {
      setSearchMessage('検索キーワードを入力してください');
      return;
    }

    setIsSearching(true);
    setSearchMessage('');
    setSavedRecipeMatches([]); // リセット
    
    try {
      const queryJP = keywordQuery.trim();

      // 1. 保存済みレシピから検索（ローカルで翻訳）
      const queryTranslation = await translateSingleText(queryJP);
      const queryEN = queryTranslation.translated;
      const searchQueries = queryEN !== queryJP ? [queryJP, queryEN] : [queryJP];

      const savedRecipes = await recipeOperations.getAll();
      const keywordMatches = savedRecipes.filter(recipe => {
        return searchQueries.some(query => {
          const lowerQuery = query.toLowerCase();
          
          // タイトルマッチ
          const titleMatch = recipe.title.toLowerCase().includes(lowerQuery);
          
          // 説明マッチ
          const descriptionMatch = recipe.description?.toLowerCase().includes(lowerQuery);
          
          // 材料名マッチ
          const ingredientMatch = recipe.ingredients_needed?.some(ing => 
            ing.name.toLowerCase().includes(lowerQuery)
          );
          
          const hasMatch = titleMatch || descriptionMatch || ingredientMatch;
          return hasMatch;
        });
      });
      
      setSavedRecipeMatches(keywordMatches);

      // 2. Spoonacular APIから検索（API側で翻訳処理を実行）
      const response = await fetch('/api/search-recipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          searchType: 'query',
          query: queryJP // 日本語のまま送信
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setSearchResults(data.recipes);
        
        const totalResults = data.searchInfo.totalResults + keywordMatches.length;
        let message = `"${keywordQuery}"で${totalResults}件のレシピが見つかりました`;
        if (keywordMatches.length > 0) {
          message += ` (うち${keywordMatches.length}件は保存済みレシピから)`;
        }
        
        setSearchMessage(message);
      } else {
        setSearchResults([]);
        const message = keywordMatches.length > 0 
          ? `API接続エラー: 保存済みレシピから${keywordMatches.length}件見つかりました`
          : '検索に失敗しました';
        setSearchMessage(message);
      }
    } catch (error) {
      console.error('検索エラー詳細:', error);
      setSearchMessage(`検索エラー: ${error.message}`);
      setSearchResults([]);
    }
    
    setIsSearching(false);
  };

  // レシピ保存
  const saveRecipe = async (recipe) => {
    try {
      const recipeData = {
        title: recipe.title,
        description: recipe.description,
        ingredients_needed: recipe.usedIngredients.concat(recipe.missedIngredients || []).map(name => ({
          name: name,
          quantity: 1,
          unit: '適量'
        })),
        instructions: `詳細は以下のリンクを参照してください：\n${recipe.sourceUrl}`,
        cooking_time: recipe.cookingTime,
        servings: recipe.servings,
        image_url: recipe.imageUrl,
        source_url: recipe.sourceUrl
      };

      const savedRecipe = await recipeOperations.create(recipeData);
      setSearchMessage(`「${recipe.title}」を保存しました`);
    } catch (error) {
      setSearchMessage(`保存エラー: ${error.message}`);
    }
  };

  return (
    <>
      {/* 検索フォーム */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="flex gap-4 mb-4">
          <button
            onClick={() => setSearchMode('ingredients')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              searchMode === 'ingredients'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            手持ち食材から検索
          </button>
          <button
            onClick={() => setSearchMode('keyword')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              searchMode === 'keyword'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            キーワード検索
          </button>
        </div>

        {/* 食材ベース検索 */}
        {searchMode === 'ingredients' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                手持ちの食材を選択 ({selectedIngredients.length}個選択中)
              </label>
              
              {/* カテゴリ別表示 */}
              <div className="border border-gray-200 rounded-lg p-3 max-h-80 overflow-y-auto">
                {['野菜', '肉類', '魚類', '卵・乳製品', '穀物', '調味料', 'その他'].map(category => {
                  const categoryIngredients = ingredients.filter(ingredient => ingredient.category === category);
                  
                  if (categoryIngredients.length === 0) return null;
                  
                  return (
                    <div key={category} className="mb-4 last:mb-0">
                      {/* カテゴリヘッダー */}
                      <div className="flex items-center justify-between mb-2 pb-1 border-b border-gray-100">
                        <h4 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                          <span className="text-lg">
                            {category === '野菜' && '🥬'}
                            {category === '肉類' && '🥩'}
                            {category === '魚類' && '🐟'}
                            {category === '卵・乳製品' && '🥛'}
                            {category === '穀物' && '🌾'}
                            {category === '調味料' && '🧂'}
                            {category === 'その他' && '📦'}
                          </span>
                          {category}
                        </h4>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">
                            {categoryIngredients.filter(ing => selectedIngredients.includes(ing.name)).length}/{categoryIngredients.length}
                          </span>
                          <button
                            onClick={() => {
                              const categoryNames = categoryIngredients.map(ing => ing.name);
                              const allSelected = categoryNames.every(name => selectedIngredients.includes(name));
                              
                              if (allSelected) {
                                // 全て選択済みの場合は全て解除
                                setSelectedIngredients(selectedIngredients.filter(name => !categoryNames.includes(name)));
                              } else {
                                // 一部または未選択の場合は全て選択
                                const newSelected = [...selectedIngredients];
                                categoryNames.forEach(name => {
                                  if (!newSelected.includes(name)) {
                                    newSelected.push(name);
                                  }
                                });
                                setSelectedIngredients(newSelected);
                              }
                            }}
                            className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                          >
                            {categoryIngredients.every(ing => selectedIngredients.includes(ing.name)) ? '全解除' : '全選択'}
                          </button>
                        </div>
                      </div>
                      
                      {/* カテゴリ内の食材リスト */}
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                        {categoryIngredients.map((ingredient) => {
                          const isExpired = ingredient.expiry_date && new Date(ingredient.expiry_date) < new Date();
                          const isExpiringSoon = ingredient.expiry_date && !isExpired && 
                            Math.ceil((new Date(ingredient.expiry_date) - new Date()) / (1000 * 60 * 60 * 24)) <= 3;
                          
                          return (
                            <label 
                              key={ingredient.id} 
                              className={`flex items-center space-x-2 text-sm p-2 rounded border cursor-pointer transition-colors ${
                                selectedIngredients.includes(ingredient.name)
                                  ? 'bg-blue-50 border-blue-200 text-blue-900'
                                  : 'bg-white border-gray-200 hover:bg-gray-50'
                              } ${
                                isExpired 
                                  ? 'border-red-200 bg-red-50' 
                                  : isExpiringSoon 
                                  ? 'border-orange-200 bg-orange-50' 
                                  : ''
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={selectedIngredients.includes(ingredient.name)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedIngredients([...selectedIngredients, ingredient.name]);
                                  } else {
                                    setSelectedIngredients(selectedIngredients.filter(name => name !== ingredient.name));
                                  }
                                }}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                              <div className="flex-1 min-w-0">
                                <span className="truncate block">{ingredient.name}</span>
                                <div className="text-xs text-gray-500 flex items-center justify-between">
                                  <span>{ingredient.quantity} {ingredient.unit}</span>
                                  {isExpired && <span className="text-red-600 font-medium">期限切れ</span>}
                                  {isExpiringSoon && <span className="text-orange-600 font-medium">期限近い</span>}
                                </div>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
                
                {/* 食材がない場合 */}
                {ingredients.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Package className="mx-auto mb-2" size={32} />
                    <p>食材がありません</p>
                    <p className="text-sm">食材管理タブから食材を追加してください</p>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                メイン食材（追加、オプション）
              </label>
              <input
                type="text"
                placeholder="例：鶏肉、パスタ、米など"
                value={mainFood}
                onChange={(e) => setMainFood(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              onClick={searchByIngredients}
              disabled={isSearching}
              className="w-full py-2 px-4 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-400 transition-colors"
            >
              {isSearching ? '検索中...' : 'レシピを検索'}
            </button>
          </div>
        )}

        {/* キーワード検索 */}
        {searchMode === 'keyword' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                料理名やキーワードで検索
              </label>
              <input
                type="text"
                placeholder="例：カレー、パスタ、ハンバーグなど"
                value={keywordQuery}
                onChange={(e) => setKeywordQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && searchByKeyword()}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              onClick={searchByKeyword}
              disabled={isSearching}
              className="w-full py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 transition-colors"
            >
              {isSearching ? '検索中...' : 'レシピを検索'}
            </button>
          </div>
        )}

        {/* 検索メッセージ */}
        {searchMessage && (
          <div className={`mt-4 p-3 rounded-lg ${
            searchMessage.includes('エラー') || searchMessage.includes('失敗')
              ? 'bg-red-100 border border-red-300 text-red-700'
              : 'bg-blue-100 border border-blue-300 text-blue-700'
          }`}>
            {searchMessage}
          </div>
        )}
      </div>

      {/* 保存済みレシピからの提案 */}
      {savedRecipeMatches.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="p-4 border-b border-gray-200 bg-yellow-50">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Star className="text-yellow-500" size={20} fill="currentColor" />
              あなたのブックマークから ({savedRecipeMatches.length}件)
            </h2>
            <p className="text-sm text-gray-600 mt-1">保存済みレシピの中から条件に合うものを見つけました</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
            {savedRecipeMatches.map((recipe) => (
              <div key={`saved-${recipe.id}`} className="border border-yellow-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow bg-yellow-50">
                {/* レシピ画像 */}
                <div className="relative h-48 bg-gray-200">
                  {recipe.image_url ? (
                    <img
                      src={recipe.image_url}
                      alt={recipe.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/300x200?text=No+Image';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                      <ChefHat className="text-gray-400" size={48} />
                    </div>
                  )}
                  
                  <div className="absolute top-2 left-2 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                    保存済み
                  </div>
                  
                  {recipe.matchCount && (
                    <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs">
                      {recipe.matchPercentage || 0}% マッチ
                    </div>
                  )}
                </div>

                {/* レシピ情報 */}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{recipe.title}</h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{recipe.description}</p>
                  
                  <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      {recipe.cooking_time || '不明'}分
                    </span>
                    <span className="flex items-center gap-1">
                      <Users size={12} />
                      {recipe.servings || '不明'}人分
                    </span>
                  </div>

                  {/* マッチング食材表示 */}
                  {searchMode === 'ingredients' && recipe.ingredients_needed && (
                    <div className="mb-3">
                      <span className="text-xs font-medium text-green-600">使用可能な材料:</span>
                      <p className="text-xs text-gray-600 truncate">
                        {recipe.ingredients_needed
                          .filter(ing => 
                            selectedIngredients.some(selected => 
                              ing.name.toLowerCase().includes(selected.toLowerCase()) ||
                              selected.toLowerCase().includes(ing.name.toLowerCase())
                            ) ||
                            (mainFood && (
                              ing.name.toLowerCase().includes(mainFood.toLowerCase()) ||
                              mainFood.toLowerCase().includes(ing.name.toLowerCase())
                            ))
                          )
                          .map(ing => ing.name)
                          .join(', ')}
                      </p>
                    </div>
                  )}

                  {/* アクションボタン */}
                  <div className="flex gap-2">
                    {recipe.source_url && recipe.source_url !== '#' && (
                      <a
                        href={recipe.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 py-2 px-3 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors text-center"
                      >
                        <ExternalLink size={14} className="inline mr-1" />
                        元サイト
                      </a>
                    )}
                    
                    <button
                      onClick={() => {
                        // 保存済みレシピの詳細表示（簡易版）
                        alert(`${recipe.title}\n\n${recipe.description}\n\n材料: ${recipe.ingredients_needed?.map(ing => `${ing.name} ${ing.quantity}${ing.unit}`).join('\n') || '情報なし'}\n\n作り方:\n${recipe.instructions || '詳細は元サイトを参照'}`);
                      }}
                      className="py-2 px-3 bg-purple-500 text-white text-sm rounded-lg hover:bg-purple-600 transition-colors"
                    >
                      <Info size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* オンライン検索結果 */}
      {searchResults.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold">オンライン検索結果 ({searchResults.length}件)</h2>
            <p className="text-sm text-gray-600 mt-1">Spoonacular APIから取得したレシピ</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
            {searchResults.map((recipe) => (
              <div key={recipe.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                {/* レシピ画像 */}
                <div className="relative h-48 bg-gray-200">
                  <img
                    src={recipe.imageUrl}
                    alt={recipe.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/300x200?text=No+Image';
                    }}
                  />
                  {searchMode === 'ingredients' && (
                    <div className="absolute top-2 right-2 bg-white bg-opacity-90 px-2 py-1 rounded-full text-xs">
                      {recipe.usedIngredientCount}/{recipe.usedIngredientCount + recipe.missedIngredientCount}
                    </div>
                  )}
                </div>

                {/* レシピ情報 */}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{recipe.title}</h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{recipe.description}</p>
                  
                  <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      {recipe.cookingTime}分
                    </span>
                    <span className="flex items-center gap-1">
                      <Users size={12} />
                      {recipe.servings}人分
                    </span>
                    {recipe.likes > 0 && (
                      <span className="flex items-center gap-1">
                        <Heart size={12} />
                        {recipe.likes}
                      </span>
                    )}
                  </div>

                  {/* 使用食材・不足食材 */}
                  {searchMode === 'ingredients' && (
                    <div className="space-y-2 mb-3">
                      {recipe.usedIngredients && recipe.usedIngredients.length > 0 && (
                        <div>
                          <span className="text-xs font-medium text-green-600">使用可能:</span>
                          <p className="text-xs text-gray-600 truncate">
                            {recipe.usedIngredients.join(', ')}
                          </p>
                        </div>
                      )}
                      {recipe.missedIngredients && recipe.missedIngredients.length > 0 && (
                        <div>
                          <span className="text-xs font-medium text-orange-600">必要:</span>
                          <p className="text-xs text-gray-600 truncate">
                            {recipe.missedIngredients.join(', ')}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* アクションボタン */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => saveRecipe(recipe)}
                      className="flex-1 py-2 px-3 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 transition-colors"
                    >
                      <Star size={14} className="inline mr-1" />
                      保存
                    </button>
                    <a
                      href={recipe.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-2 px-3 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors text-center"
                    >
                      <ExternalLink size={14} className="inline mr-1" />
                      元サイト
                    </a>
                    <button
                      onClick={() => openRecipeDetail(recipe.spoonacularId || recipe.id)}
                      className="flex-1 py-2 px-3 bg-purple-500 text-white text-sm rounded-lg hover:bg-purple-600 transition-colors"
                    >
                      <Info size={14} className="inline mr-1" />
                      詳細
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* レシピ詳細モーダル */}
      <RecipeDetailModal
        recipeId={selectedRecipeId}
        isOpen={isModalOpen}
        onClose={closeRecipeDetail}
        ingredients={ingredients}
        onCalendarRegister={onCalendarRegister}
      />
    </>
  );
};

const MealPlannerApp = () => {
  const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('ingredients');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('category'); // name, expiry, quantity, category
  
  // カレンダー更新用の状態
  const [calendarKey, setCalendarKey] = useState(0);
  
  // 食材追加用の状態
  const [newIngredient, setNewIngredient] = useState({
    name: '',
    quantity: '',
    unit: '個',
    category: '野菜',
    expiry_date: ''
  });
  const [isAddingIngredient, setIsAddingIngredient] = useState(false);
  
  // 編集用の状態
  const [editingId, setEditingId] = useState(null);
  const [editingIngredient, setEditingIngredient] = useState({});

  // カレンダー登録後の処理
  const handleCalendarRegister = useCallback((date, mealType) => {
    setActiveTab('calendar');
    setCalendarKey(prev => prev + 1);
  }, []);

  // カテゴリ一覧
  const categories = [
    'all',
    '野菜',
    '肉類',
    '魚類',
    '卵・乳製品',
    '穀物',
    '調味料',
    'その他'
  ];

  // 単位一覧
  const units = ['個', '本', '袋', 'パック', 'g', 'kg', 'ml', 'L', '缶', '瓶'];

  // データ読み込み
  useEffect(() => {
    let isMounted = true;
    
    const loadIngredients = async () => {
      if (!isMounted) return;
      
      setLoading(true);
      try {
        const data = await ingredientOperations.getAll();
        if (isMounted) {
          setIngredients(data);
          setMessage('食材データを読み込みました');
        }
      } catch (error) {
        if (isMounted) {
          console.error('Error loading ingredients:', error);
          setMessage(`エラー: ${error.message}`);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadIngredients();
    
    return () => {
      isMounted = false;
    };
  }, []);

  const loadIngredients = async () => {
    setLoading(true);
    try {
      const data = await ingredientOperations.getAll();
      setIngredients(data);
      setMessage('食材データを読み込みました');
    } catch (error) {
      console.error('Error loading ingredients:', error);
      setMessage(`エラー: ${error.message}`);
    }
    setLoading(false);
  };

  // 食材追加
  const handleAddIngredient = async (e) => {
    e.preventDefault();
    if (!newIngredient.name.trim()) {
      setMessage('食材名を入力してください');
      return;
    }

    try {
      const ingredientData = {
        ...newIngredient,
        quantity: parseFloat(newIngredient.quantity) || 0,
        expiry_date: newIngredient.expiry_date || null
      };
      
      const created = await ingredientOperations.create(ingredientData);
      setIngredients([created, ...ingredients]);
      setNewIngredient({
        name: '',
        quantity: '',
        unit: '個',
        category: '野菜',
        expiry_date: ''
      });
      setIsAddingIngredient(false);
      setMessage('食材を追加しました');
    } catch (error) {
      setMessage(`追加エラー: ${error.message}`);
    }
  };

  // 食材更新
  const handleUpdateIngredient = async (id, updates) => {
    try {
      const updated = await ingredientOperations.update(id, {
        ...updates,
        updated_at: new Date().toISOString()
      });
      
      setIngredients(ingredients.map(item => 
        item.id === id ? updated : item
      ));
      setEditingId(null);
      setMessage('食材を更新しました');
    } catch (error) {
      setMessage(`更新エラー: ${error.message}`);
    }
  };

  // 食材削除
  const handleDeleteIngredient = async (id) => {
    if (!confirm('この食材を削除しますか？')) return;

    try {
      await ingredientOperations.delete(id);
      setIngredients(ingredients.filter(item => item.id !== id));
      setMessage('食材を削除しました');
    } catch (error) {
      setMessage(`削除エラー: ${error.message}`);
    }
  };

  // 編集開始
  const startEditing = (ingredient) => {
    setEditingId(ingredient.id);
    setEditingIngredient({
      name: ingredient.name,
      quantity: ingredient.quantity,
      unit: ingredient.unit,
      category: ingredient.category,
      expiry_date: ingredient.expiry_date ? ingredient.expiry_date.split('T')[0] : ''
    });
  };

  // 編集キャンセル
  const cancelEditing = () => {
    setEditingId(null);
    setEditingIngredient({});
  };

  // 編集保存
  const saveEditing = () => {
    handleUpdateIngredient(editingId, {
      ...editingIngredient,
      quantity: parseFloat(editingIngredient.quantity) || 0,
      expiry_date: editingIngredient.expiry_date || null
    });
  };

  // 食材フィルタリング・ソート
  const getFilteredAndSortedIngredients = () => {
    let filtered = ingredients.filter(ingredient => {
      const matchesSearch = ingredient.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || ingredient.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'expiry':
          if (!a.expiry_date && !b.expiry_date) return 0;
          if (!a.expiry_date) return 1;
          if (!b.expiry_date) return -1;
          return new Date(a.expiry_date) - new Date(b.expiry_date);
        case 'quantity':
          return b.quantity - a.quantity;
        case 'category':
          return a.category.localeCompare(b.category);
        default:
          return 0;
      }
    });

    return filtered;
  };

  // 期限切れ近い食材の判定
  const isExpiringSoon = (expiryDate) => {
    if (!expiryDate) return false;
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 3 && diffDays >= 0;
  };

  const isExpired = (expiryDate) => {
    if (!expiryDate) return false;
    const today = new Date();
    const expiry = new Date(expiryDate);
    return expiry < today;
  };

  const filteredIngredients = useMemo(() => {
    let filtered = ingredients.filter(ingredient => {
      const matchesSearch = ingredient.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || ingredient.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'expiry':
          if (!a.expiry_date && !b.expiry_date) return 0;
          if (!a.expiry_date) return 1;
          if (!b.expiry_date) return -1;
          return new Date(a.expiry_date) - new Date(b.expiry_date);
        case 'quantity':
          return b.quantity - a.quantity;
        case 'category':
          return a.category.localeCompare(b.category);
        default:
          return 0;
      }
    });

    return filtered;
  }, [ingredients, searchTerm, selectedCategory, sortBy]);
  const expiringSoonCount = ingredients.filter(ing => isExpiringSoon(ing.expiry_date)).length;
  const expiredCount = ingredients.filter(ing => isExpired(ing.expiry_date)).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* ヘッダー */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center justify-center gap-3 mb-2">
            <ChefHat className="text-orange-500" />
            冷蔵庫管理＆献立作成アプリ
            <Refrigerator className="text-blue-500" />
          </h1>
          <div className="flex items-center justify-center gap-4 text-sm">
            <span className="flex items-center gap-1 text-green-600">
              <Package size={16} />
              食材: {ingredients.length}個
            </span>
            {expiringSoonCount > 0 && (
              <span className="flex items-center gap-1 text-orange-600">
                <AlertTriangle size={16} />
                期限近い: {expiringSoonCount}個
              </span>
            )}
            {expiredCount > 0 && (
              <span className="flex items-center gap-1 text-red-600">
                <AlertTriangle size={16} />
                期限切れ: {expiredCount}個
              </span>
            )}
          </div>
        </div>

        {/* メッセージ表示 */}
        {message && (
          <div className={`mb-4 p-3 rounded-lg ${
            message.includes('エラー') 
              ? 'bg-red-100 border border-red-300 text-red-700' 
              : 'bg-green-100 border border-green-300 text-green-700'
          }`}>
            {message}
            <button 
              onClick={() => setMessage('')}
              className="float-right text-sm underline"
            >
              閉じる
            </button>
          </div>
        )}

        {/* タブナビゲーション */}
        <div className="flex mb-6 bg-white rounded-lg shadow-sm p-1">
          <button
            onClick={() => setActiveTab('ingredients')}
            className={`flex-1 py-2 px-4 rounded-md transition-colors ${
              activeTab === 'ingredients'
                ? 'bg-blue-500 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Refrigerator className="inline mr-2" size={16} />
            食材管理
          </button>
          <button
            onClick={() => setActiveTab('recipes')}
            className={`flex-1 py-2 px-4 rounded-md transition-colors ${
              activeTab === 'recipes'
                ? 'bg-blue-500 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Search className="inline mr-2" size={16} />
            レシピ検索
          </button>
          <button
            onClick={() => setActiveTab('favorites')}
            className={`flex-1 py-2 px-4 rounded-md transition-colors ${
              activeTab === 'favorites'
                ? 'bg-blue-500 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Heart className="inline mr-2" size={16} />
            お気に入り
          </button>
          <button
            onClick={() => setActiveTab('calendar')}
            className={`flex-1 py-2 px-4 rounded-md transition-colors ${
              activeTab === 'calendar'
                ? 'bg-blue-500 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Calendar className="inline mr-2" size={16} />
            献立カレンダー
          </button>
        </div>

        {/* 食材管理タブ */}
        {activeTab === 'ingredients' && (
          <div className="space-y-6">
            {/* 食材検索・フィルター */}
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="text"
                    placeholder="食材を検索..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category === 'all' ? '全カテゴリ' : category}
                    </option>
                  ))}
                </select>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="category">カテゴリ順</option>
                  <option value="expiry">期限順</option>
                  <option value="name">名前順</option>
                  <option value="quantity">数量順</option>
                </select>

                <button
                  onClick={() => setIsAddingIngredient(true)}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  <Plus size={16} />
                  食材追加
                </button>
              </div>
            </div>

            {/* 食材追加フォーム */}
            {isAddingIngredient && (
              <div className="bg-white p-6 rounded-lg shadow-sm border-2 border-green-200">
                <h3 className="text-lg font-semibold mb-4 text-green-700">新しい食材を追加</h3>
                <form onSubmit={handleAddIngredient} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    <input
                      type="text"
                      placeholder="食材名"
                      value={newIngredient.name}
                      onChange={(e) => setNewIngredient({...newIngredient, name: e.target.value})}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      required
                    />
                    
                    <input
                      type="number"
                      placeholder="数量"
                      value={newIngredient.quantity}
                      onChange={(e) => setNewIngredient({...newIngredient, quantity: e.target.value})}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      step="0.1"
                      min="0"
                    />
                    
                    <select
                      value={newIngredient.unit}
                      onChange={(e) => setNewIngredient({...newIngredient, unit: e.target.value})}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      {units.map(unit => (
                        <option key={unit} value={unit}>{unit}</option>
                      ))}
                    </select>
                    
                    <select
                      value={newIngredient.category}
                      onChange={(e) => setNewIngredient({...newIngredient, category: e.target.value})}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      {categories.slice(1).map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                    
                    <input
                      type="date"
                      value={newIngredient.expiry_date}
                      onChange={(e) => setNewIngredient({...newIngredient, expiry_date: e.target.value})}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                    >
                      <Save size={16} />
                      保存
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsAddingIngredient(false)}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                    >
                      <X size={16} />
                      キャンセル
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* 食材一覧 */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold">
                  食材一覧 ({filteredIngredients.length}件)
                </h2>
              </div>
              
              {loading ? (
                <div className="p-8 text-center text-gray-500">読み込み中...</div>
              ) : filteredIngredients.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  {searchTerm || selectedCategory !== 'all' 
                    ? '条件に合う食材が見つかりません' 
                    : '食材がありません。上の「食材追加」ボタンから追加してください。'}
                </div>
              ) : (
                <>
                  {/* ソート別表示切り替え */}
                  {sortBy === 'category' ? (
                    /* カテゴリ別表示 */
                    <div className="divide-y divide-gray-200">
                      {['野菜', '肉類', '魚類', '卵・乳製品', '穀物', '調味料', 'その他'].map(category => {
                        const categoryIngredients = filteredIngredients.filter(ingredient => ingredient.category === category);
                        
                        if (categoryIngredients.length === 0) return null;
                        
                        return (
                          <div key={category} className="p-4">
                            {/* カテゴリヘッダー */}
                            <div className="flex items-center gap-3 mb-3 pb-2 border-b border-gray-100">
                              <span className="text-xl">
                                {category === '野菜' && '🥬'}
                                {category === '肉類' && '🥩'}
                                {category === '魚類' && '🐟'}
                                {category === '卵・乳製品' && '🥛'}
                                {category === '穀物' && '🌾'}
                                {category === '調味料' && '🧂'}
                                {category === 'その他' && '📦'}
                              </span>
                              <h3 className="text-lg font-semibold text-gray-800">{category}</h3>
                              <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                {categoryIngredients.length}件
                              </span>
                            </div>
                            
                            {/* カテゴリ内の食材 */}
                            <div className="space-y-2">
                              {categoryIngredients.map((ingredient) => (
                                <div key={ingredient.id} className="hover:bg-gray-50 transition-colors rounded p-2">
                                  {editingId === ingredient.id ? (
                                    /* 編集モード */
                                    <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-center">
                                      <input
                                        type="text"
                                        value={editingIngredient.name}
                                        onChange={(e) => setEditingIngredient({...editingIngredient, name: e.target.value})}
                                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                      />
                                      <input
                                        type="number"
                                        value={editingIngredient.quantity}
                                        onChange={(e) => setEditingIngredient({...editingIngredient, quantity: e.target.value})}
                                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        step="0.1"
                                        min="0"
                                      />
                                      <select
                                        value={editingIngredient.unit}
                                        onChange={(e) => setEditingIngredient({...editingIngredient, unit: e.target.value})}
                                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                      >
                                        {units.map(unit => (
                                          <option key={unit} value={unit}>{unit}</option>
                                        ))}
                                      </select>
                                      <select
                                        value={editingIngredient.category}
                                        onChange={(e) => setEditingIngredient({...editingIngredient, category: e.target.value})}
                                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                      >
                                        {categories.slice(1).map(category => (
                                          <option key={category} value={category}>{category}</option>
                                        ))}
                                      </select>
                                      <input
                                        type="date"
                                        value={editingIngredient.expiry_date}
                                        onChange={(e) => setEditingIngredient({...editingIngredient, expiry_date: e.target.value})}
                                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                      />
                                      <div className="flex gap-2">
                                        <button
                                          onClick={saveEditing}
                                          className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                                        >
                                          <Save size={16} />
                                        </button>
                                        <button
                                          onClick={cancelEditing}
                                          className="p-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                                        >
                                          <X size={16} />
                                        </button>
                                      </div>
                                    </div>
                                  ) : (
                                    /* 表示モード */
                                    <div className="flex items-center justify-between">
                                      <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                                        <div className="font-medium text-gray-900">
                                          {ingredient.name}
                                        </div>
                                        <div className="text-gray-600">
                                          {ingredient.quantity} {ingredient.unit}
                                        </div>
                                        <div className={`text-sm ${
                                          isExpired(ingredient.expiry_date) 
                                            ? 'text-red-600 font-semibold' 
                                            : isExpiringSoon(ingredient.expiry_date) 
                                            ? 'text-orange-600 font-medium' 
                                            : 'text-gray-500'
                                        }`}>
                                          {ingredient.expiry_date 
                                            ? new Date(ingredient.expiry_date).toLocaleDateString() 
                                            : '期限なし'}
                                          {isExpired(ingredient.expiry_date) && ' (期限切れ)'}
                                          {isExpiringSoon(ingredient.expiry_date) && ' (期限近い)'}
                                        </div>
                                        <div className="text-xs text-gray-400">
                                          {new Date(ingredient.created_at).toLocaleDateString()}
                                        </div>
                                      </div>
                                      <div className="flex gap-2 ml-4">
                                        <button
                                          onClick={() => startEditing(ingredient)}
                                          className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                                        >
                                          <Edit2 size={16} />
                                        </button>
                                        <button
                                          onClick={() => handleDeleteIngredient(ingredient.id)}
                                          className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                                        >
                                          <Trash2 size={16} />
                                        </button>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : sortBy === 'expiry' ? (
                    /* 期限別表示 */
                    <div className="divide-y divide-gray-200">
                      {[
                        { key: 'expired', label: '期限切れ', icon: '🚨', color: 'text-red-600' },
                        { key: 'expiring', label: '期限近い（3日以内）', icon: '⚠️', color: 'text-orange-600' },
                        { key: 'normal', label: '期限まで余裕', icon: '✅', color: 'text-green-600' },
                        { key: 'no_expiry', label: '期限設定なし', icon: '📦', color: 'text-gray-600' }
                      ].map(group => {
                        let groupIngredients = [];
                        
                        if (group.key === 'expired') {
                          groupIngredients = filteredIngredients.filter(ing => isExpired(ing.expiry_date));
                        } else if (group.key === 'expiring') {
                          groupIngredients = filteredIngredients.filter(ing => isExpiringSoon(ing.expiry_date));
                        } else if (group.key === 'normal') {
                          groupIngredients = filteredIngredients.filter(ing => 
                            ing.expiry_date && !isExpired(ing.expiry_date) && !isExpiringSoon(ing.expiry_date)
                          );
                        } else {
                          groupIngredients = filteredIngredients.filter(ing => !ing.expiry_date);
                        }
                        
                        if (groupIngredients.length === 0) return null;
                        
                        return (
                          <div key={group.key} className="p-4">
                            {/* グループヘッダー */}
                            <div className="flex items-center gap-3 mb-3 pb-2 border-b border-gray-100">
                              <span className="text-xl">{group.icon}</span>
                              <h3 className={`text-lg font-semibold ${group.color}`}>{group.label}</h3>
                              <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                {groupIngredients.length}件
                              </span>
                            </div>
                            
                            {/* グループ内の食材 */}
                            <div className="space-y-2">
                              {groupIngredients.map((ingredient) => (
                                <div key={ingredient.id} className="hover:bg-gray-50 transition-colors rounded p-2">
                                  {editingId === ingredient.id ? (
                                    /* 編集モード（同じ） */
                                    <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-center">
                                      <input
                                        type="text"
                                        value={editingIngredient.name}
                                        onChange={(e) => setEditingIngredient({...editingIngredient, name: e.target.value})}
                                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                      />
                                      <input
                                        type="number"
                                        value={editingIngredient.quantity}
                                        onChange={(e) => setEditingIngredient({...editingIngredient, quantity: e.target.value})}
                                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        step="0.1"
                                        min="0"
                                      />
                                      <select
                                        value={editingIngredient.unit}
                                        onChange={(e) => setEditingIngredient({...editingIngredient, unit: e.target.value})}
                                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                      >
                                        {units.map(unit => (
                                          <option key={unit} value={unit}>{unit}</option>
                                        ))}
                                      </select>
                                      <select
                                        value={editingIngredient.category}
                                        onChange={(e) => setEditingIngredient({...editingIngredient, category: e.target.value})}
                                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                      >
                                        {categories.slice(1).map(category => (
                                          <option key={category} value={category}>{category}</option>
                                        ))}
                                      </select>
                                      <input
                                        type="date"
                                        value={editingIngredient.expiry_date}
                                        onChange={(e) => setEditingIngredient({...editingIngredient, expiry_date: e.target.value})}
                                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                      />
                                      <div className="flex gap-2">
                                        <button
                                          onClick={saveEditing}
                                          className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                                        >
                                          <Save size={16} />
                                        </button>
                                        <button
                                          onClick={cancelEditing}
                                          className="p-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                                        >
                                          <X size={16} />
                                        </button>
                                      </div>
                                    </div>
                                  ) : (
                                    /* 表示モード */
                                    <div className="flex items-center justify-between">
                                      <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                                        <div className="font-medium text-gray-900">
                                          {ingredient.name}
                                          <span className="ml-2 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                            {ingredient.category}
                                          </span>
                                        </div>
                                        <div className="text-gray-600">
                                          {ingredient.quantity} {ingredient.unit}
                                        </div>
                                        <div className={`text-sm ${
                                          isExpired(ingredient.expiry_date) 
                                            ? 'text-red-600 font-semibold' 
                                            : isExpiringSoon(ingredient.expiry_date) 
                                            ? 'text-orange-600 font-medium' 
                                            : 'text-gray-500'
                                        }`}>
                                          {ingredient.expiry_date 
                                            ? new Date(ingredient.expiry_date).toLocaleDateString() 
                                            : '期限なし'}
                                          {isExpired(ingredient.expiry_date) && ' (期限切れ)'}
                                          {isExpiringSoon(ingredient.expiry_date) && ' (期限近い)'}
                                        </div>
                                        <div className="text-xs text-gray-400">
                                          {new Date(ingredient.created_at).toLocaleDateString()}
                                        </div>
                                      </div>
                                      <div className="flex gap-2 ml-4">
                                        <button
                                          onClick={() => startEditing(ingredient)}
                                          className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                                        >
                                          <Edit2 size={16} />
                                        </button>
                                        <button
                                          onClick={() => handleDeleteIngredient(ingredient.id)}
                                          className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                                        >
                                          <Trash2 size={16} />
                                        </button>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    /* 通常のリスト表示（名前順・数量順） */
                    <div className="divide-y divide-gray-200">
                      {filteredIngredients.map((ingredient) => (
                        <div key={ingredient.id} className="p-4 hover:bg-gray-50 transition-colors">
                          {editingId === ingredient.id ? (
                            /* 編集モード */
                            <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-center">
                              <input
                                type="text"
                                value={editingIngredient.name}
                                onChange={(e) => setEditingIngredient({...editingIngredient, name: e.target.value})}
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                              <input
                                type="number"
                                value={editingIngredient.quantity}
                                onChange={(e) => setEditingIngredient({...editingIngredient, quantity: e.target.value})}
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                step="0.1"
                                min="0"
                              />
                              <select
                                value={editingIngredient.unit}
                                onChange={(e) => setEditingIngredient({...editingIngredient, unit: e.target.value})}
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              >
                                {units.map(unit => (
                                  <option key={unit} value={unit}>{unit}</option>
                                ))}
                              </select>
                              <select
                                value={editingIngredient.category}
                                onChange={(e) => setEditingIngredient({...editingIngredient, category: e.target.value})}
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              >
                                {categories.slice(1).map(category => (
                                  <option key={category} value={category}>{category}</option>
                                ))}
                              </select>
                              <input
                                type="date"
                                value={editingIngredient.expiry_date}
                                onChange={(e) => setEditingIngredient({...editingIngredient, expiry_date: e.target.value})}
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                              <div className="flex gap-2">
                                <button
                                  onClick={saveEditing}
                                  className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                                >
                                  <Save size={16} />
                                </button>
                                <button
                                  onClick={cancelEditing}
                                  className="p-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                                >
                                  <X size={16} />
                                </button>
                              </div>
                            </div>
                          ) : (
                            /* 表示モード */
                            <div className="flex items-center justify-between">
                              <div className="flex-1 grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                                <div className="font-medium text-gray-900">
                                  {ingredient.name}
                                </div>
                                <div className="text-gray-600">
                                  {ingredient.quantity} {ingredient.unit}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {ingredient.category}
                                </div>
                                <div className={`text-sm ${
                                  isExpired(ingredient.expiry_date) 
                                    ? 'text-red-600 font-semibold' 
                                    : isExpiringSoon(ingredient.expiry_date) 
                                    ? 'text-orange-600 font-medium' 
                                    : 'text-gray-500'
                                }`}>
                                  {ingredient.expiry_date 
                                    ? new Date(ingredient.expiry_date).toLocaleDateString() 
                                    : '期限なし'}
                                  {isExpired(ingredient.expiry_date) && ' (期限切れ)'}
                                  {isExpiringSoon(ingredient.expiry_date) && ' (期限近い)'}
                                </div>
                                <div className="text-xs text-gray-400">
                                  {new Date(ingredient.created_at).toLocaleDateString()}
                                </div>
                              </div>
                              <div className="flex gap-2 ml-4">
                                <button
                                  onClick={() => startEditing(ingredient)}
                                  className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                                >
                                  <Edit2 size={16} />
                                </button>
                                <button
                                  onClick={() => handleDeleteIngredient(ingredient.id)}
                                  className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* お気に入り管理タブ */}
        {activeTab === 'favorites' && <FavoriteSection onCalendarRegister={handleCalendarRegister} />}

        {/* レシピ検索タブ */}
        {activeTab === 'recipes' && (
          <div className="space-y-6">
            {/* 検索モード切り替え */}
            <RecipeSearchSection ingredients={ingredients} onCalendarRegister={handleCalendarRegister} />
          </div>
        )}

        {/* 献立カレンダータブ */}
        {activeTab === 'calendar' && <MealCalendar key={calendarKey} ingredients={ingredients} />}
      </div>
    </div>
  );
};

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('アプリケーションエラー:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-red-50 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h2 className="text-xl font-bold text-red-600 mb-4">
              アプリケーションエラー
            </h2>
            <p className="text-gray-700 mb-4">
              申し訳ございません。予期しないエラーが発生しました。
            </p>
            <button
              onClick={() => window.location.reload()}
              className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              ページを再読み込み
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default MealPlannerApp;