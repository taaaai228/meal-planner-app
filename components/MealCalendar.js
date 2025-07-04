import React, { useState, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Plus, Edit2, Trash2, Save, X, Clock, Users, ShoppingCart, Utensils, Info, ExternalLink, ChefHat } from 'lucide-react';
import { mealPlanOperations, recipeOperations } from '../lib/database';

// 正規化関数のローカル実装（フォールバック用）
const fallbackNormalizeIngredientName = (name) => {
  if (!name) return '';
  
  // 基本的な正規化のみ実行
  const trimmed = name.trim().toLowerCase();
  
  // 簡単な同義語変換
  const basicSynonyms = {
    '玉ねぎ': 'たまねぎ',
    'タマネギ': 'たまねぎ',
    'ニンジン': 'にんじん',
    '人参': 'にんじん',
    'ジャガイモ': 'じゃがいも',
    'とまと': 'トマト',
    'べーこん': 'ベーコン',
    'はむ': 'ハム',
    'とりにく': '鶏肉',
    'ぎゅうにく': '牛肉',
    'ぶたにく': '豚肉'
  };
  
  return basicSynonyms[trimmed] || trimmed;
};

// 安全な正規化関数
const safeNormalizeIngredientName = (name) => {
  try {
    // 外部の正規化関数をインポートしようとする
    const { normalizeIngredientName } = require('../lib/translationHelper');
    return normalizeIngredientName(name);
  } catch (error) {
    // インポートに失敗した場合はフォールバック関数を使用
    return fallbackNormalizeIngredientName(name);
  }
};

// 献立カレンダーコンポーネント
const MealCalendar = ({ ingredients = [] }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [mealPlans, setMealPlans] = useState([]);
  const [savedRecipes, setSavedRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  
  // モーダル関連の状態
  const [showMealModal, setShowMealModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedMealType, setSelectedMealType] = useState('breakfast');
  const [editingMealPlan, setEditingMealPlan] = useState(null);
  
  // 日別献立表示モーダル用の状態
  const [showDayModal, setShowDayModal] = useState(false);
  const [selectedDayPlans, setSelectedDayPlans] = useState([]);
  const [selectedDayDate, setSelectedDayDate] = useState(null);
  
  // レシピ詳細モーダル用の状態
  const [showRecipeDetailModal, setShowRecipeDetailModal] = useState(false);
  const [selectedRecipeForDetail, setSelectedRecipeForDetail] = useState(null);
  
  // 買い物リスト関連の状態
  const [shoppingList, setShoppingList] = useState([]);
  const [shoppingDateRange, setShoppingDateRange] = useState({
    start: '',
    end: ''
  });

  const mealTypes = [
    { key: 'breakfast', label: '朝食', icon: '🌅' },
    { key: 'lunch', label: '昼食', icon: '🌞' },
    { key: 'dinner', label: '夕食', icon: '🌙' }
  ];

  // 初期データ読み込み
  useEffect(() => {
    loadMealPlans();
    loadSavedRecipes();
  }, [currentDate]);

  // 月の献立データを読み込み
  const loadMealPlans = async () => {
    setLoading(true);
    try {
      const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).toISOString().split('T')[0];
      const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).toISOString().split('T')[0];
      
      const data = await mealPlanOperations.getByDateRange(startDate, endDate);
      setMealPlans(data);
    } catch (error) {
      setMessage(`データ読み込みエラー: ${error.message}`);
    }
    setLoading(false);
  };

  // 保存済みレシピを読み込み
  const loadSavedRecipes = async () => {
    try {
      const data = await recipeOperations.getAll();
      setSavedRecipes(data);
    } catch (error) {
      console.error('レシピ読み込みエラー:', error);
    }
  };

  // 月を変更
  const changeMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  // カレンダーの日付を生成
  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay()); // 週の始めに調整
    
    const days = [];
    const currentCalendarDate = new Date(startDate);
    
    for (let i = 0; i < 42; i++) { // 6週間分
      days.push(new Date(currentCalendarDate));
      currentCalendarDate.setDate(currentCalendarDate.getDate() + 1);
    }
    
    return days;
  };

  // 特定日の献立を取得
  const getMealPlansForDate = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    return mealPlans.filter(plan => plan.date === dateStr);
  };

  // 日別献立表示モーダルを開く
  const openDayModal = (date) => {
    const dayPlans = getMealPlansForDate(date);
    setSelectedDayPlans(dayPlans);
    setSelectedDayDate(date);
    setShowDayModal(true);
  };

  // レシピ詳細モーダルを開く
  const openRecipeDetailFromCalendar = async (mealPlan) => {
    if (mealPlan.recipe_id) {
      // 保存済みレシピの詳細を取得
      const recipe = savedRecipes.find(r => r.id === mealPlan.recipe_id);
      if (recipe) {
        setSelectedRecipeForDetail(recipe);
        setShowRecipeDetailModal(true);
      }
    }
  };

  // 献立モーダルを開く
  const openMealModal = (date, mealType = 'breakfast', existingPlan = null) => {
    setSelectedDate(date);
    setSelectedMealType(mealType);
    setEditingMealPlan(existingPlan);
    setShowMealModal(true);
  };

  // 献立モーダルを閉じる
  const closeMealModal = () => {
    setShowMealModal(false);
    setSelectedDate(null);
    setSelectedMealType('breakfast');
    setEditingMealPlan(null);
  };

  // 献立を保存
  const saveMealPlan = async (mealPlanData) => {
    try {
      const dateStr = selectedDate.toISOString().split('T')[0];
      
      if (editingMealPlan) {
        // 更新
        await mealPlanOperations.update(editingMealPlan.id, mealPlanData);
        setMessage('献立を更新しました');
      } else {
        // 新規作成
        await mealPlanOperations.create({
          ...mealPlanData,
          date: dateStr,
          meal_type: selectedMealType
        });
        setMessage('献立を追加しました');
      }
      
      closeMealModal();
      loadMealPlans();
    } catch (error) {
      setMessage(`保存エラー: ${error.message}`);
    }
  };

  // 献立を削除
  const deleteMealPlan = async (id) => {
    if (!confirm('この献立を削除しますか？')) return;
    
    try {
      await mealPlanOperations.delete(id);
      setMessage('献立を削除しました');
      loadMealPlans();
    } catch (error) {
      setMessage(`削除エラー: ${error.message}`);
    }
  };

  // 買い物リストを生成（改善版：食材名の正規化対応 + エラーハンドリング）
  const generateShoppingList = async () => {
    if (!shoppingDateRange.start || !shoppingDateRange.end) {
      setMessage('期間を選択してください');
      return;
    }

    try {
      setLoading(true);
      const requiredIngredients = await mealPlanOperations.getRequiredIngredients(
        shoppingDateRange.start,
        shoppingDateRange.end
      );

      // 手持ち食材を正規化して辞書を作成
      const currentIngredients = {};
      ingredients.forEach(ing => {
        try {
          const normalizedName = safeNormalizeIngredientName(ing.name);
          
          // 同じ正規化名の食材があった場合は数量を合計
          if (currentIngredients[normalizedName]) {
            currentIngredients[normalizedName] += ing.quantity;
          } else {
            currentIngredients[normalizedName] = ing.quantity;
          }
        } catch (error) {
          // 正規化に失敗した場合は元の名前をそのまま使用
          console.warn(`食材名の正規化に失敗: ${ing.name}`, error);
          const fallbackName = ing.name.toLowerCase().trim();
          if (currentIngredients[fallbackName]) {
            currentIngredients[fallbackName] += ing.quantity;
          } else {
            currentIngredients[fallbackName] = ing.quantity;
          }
        }
      });

      // 必要な食材も正規化して照合
      const normalizedRequiredIngredients = {};
      requiredIngredients.forEach(required => {
        try {
          const normalizedName = safeNormalizeIngredientName(required.name);
          
          if (normalizedRequiredIngredients[normalizedName]) {
            normalizedRequiredIngredients[normalizedName].quantity += required.quantity;
            normalizedRequiredIngredients[normalizedName].recipes = [
              ...normalizedRequiredIngredients[normalizedName].recipes,
              ...required.recipes
            ];
          } else {
            normalizedRequiredIngredients[normalizedName] = {
              originalName: required.name, // 元の名前を保持
              quantity: required.quantity,
              unit: required.unit,
              recipes: [...required.recipes]
            };
          }
        } catch (error) {
          // 正規化に失敗した場合は元の名前をそのまま使用
          console.warn(`食材名の正規化に失敗: ${required.name}`, error);
          const fallbackName = required.name.toLowerCase().trim();
          if (normalizedRequiredIngredients[fallbackName]) {
            normalizedRequiredIngredients[fallbackName].quantity += required.quantity;
            normalizedRequiredIngredients[fallbackName].recipes = [
              ...normalizedRequiredIngredients[fallbackName].recipes,
              ...required.recipes
            ];
          } else {
            normalizedRequiredIngredients[fallbackName] = {
              originalName: required.name,
              quantity: required.quantity,
              unit: required.unit,
              recipes: [...required.recipes]
            };
          }
        }
      });

      // 不足分を計算
      const shoppingItems = [];
      Object.entries(normalizedRequiredIngredients).forEach(([normalizedName, required]) => {
        const current = currentIngredients[normalizedName] || 0;
        const shortage = required.quantity - current;
        
        if (shortage > 0) {
          shoppingItems.push({
            id: Date.now() + Math.random(),
            name: required.originalName, // 元の名前を使用
            quantity: Math.ceil(shortage), // 小数点は切り上げ
            unit: required.unit,
            recipes: [...new Set(required.recipes)], // 重複を除去
            checked: false
          });
        }
      });

      setShoppingList(shoppingItems);
      
      if (shoppingItems.length > 0) {
        setMessage(`${shoppingItems.length}個のアイテムを買い物リストに追加しました`);
      } else {
        setMessage('この期間の献立に必要な食材は全て揃っています！');
      }
    } catch (error) {
      setMessage(`買い物リスト生成エラー: ${error.message}`);
    }
    setLoading(false);
  };

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

  const calendarDays = generateCalendarDays();
  const today = new Date().toDateString();

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Calendar size={24} />
            献立カレンダー
          </h2>
          
          {/* 月切り替え */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => changeMonth(-1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            
            <h3 className="text-xl font-semibold min-w-[120px] text-center">
              {currentDate.getFullYear()}年{currentDate.getMonth() + 1}月
            </h3>
            
            <button
              onClick={() => changeMonth(1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRight size={20} />
            </button>
          </div>

          {/* 空のスペース（レイアウト調整用） */}
          <div className="w-32"></div>
        </div>

        {/* メッセージ表示 */}
        {message && (
          <div className={`p-3 rounded-lg ${
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
      </div>

      {/* メインコンテンツ: カレンダーと買い物リスト */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* カレンダー部分 */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            {/* 曜日ヘッダー */}
            <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-200">
              {['日', '月', '火', '水', '木', '金', '土'].map((day, index) => (
                <div key={day} className={`p-3 text-center font-semibold ${
                  index === 0 ? 'text-red-600' : index === 6 ? 'text-blue-600' : 'text-gray-700'
                }`}>
                  {day}
                </div>
              ))}
            </div>

            {/* カレンダー本体 */}
            <div className="grid grid-cols-7 divide-x divide-gray-200">
              {calendarDays.map((date, index) => {
                const isCurrentMonth = date.getMonth() === currentDate.getMonth();
                const isToday = date.toDateString() === today;
                const dayMealPlans = getMealPlansForDate(date);
                
                return (
                  <div
                    key={index}
                    className={`min-h-[120px] p-2 border-b border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors ${
                      !isCurrentMonth ? 'bg-gray-50 text-gray-400' : 'bg-white'
                    } ${isToday ? 'bg-blue-50' : ''}`}
                    onClick={() => isCurrentMonth && openDayModal(date)}
                  >
                    {/* 日付 */}
                    <div className={`text-sm font-semibold mb-2 ${
                      isToday ? 'text-blue-600' : ''
                    }`}>
                      {date.getDate()}
                    </div>

                    {/* 献立表示 */}
                    <div className="space-y-1">
                      {mealTypes.map(mealType => {
                        const mealPlan = dayMealPlans.find(plan => plan.meal_type === mealType.key);
                        
                        return (
                          <div key={mealType.key} className="text-xs">
                            {mealPlan ? (
                              <div
                                className="bg-blue-100 text-blue-800 px-2 py-1 rounded cursor-pointer hover:bg-blue-200 transition-colors"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openMealModal(date, mealType.key, mealPlan);
                                }}
                              >
                                <div className="flex items-center justify-between">
                                  <span className="truncate">{mealType.icon} {mealPlan.recipe_title}</span>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      deleteMealPlan(mealPlan.id);
                                    }}
                                    className="text-red-600 hover:text-red-800 ml-1"
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                </div>
                              </div>
                            ) : (
                              isCurrentMonth && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openMealModal(date, mealType.key);
                                  }}
                                  className="w-full text-left text-gray-400 hover:text-gray-600 hover:bg-gray-100 px-2 py-1 rounded transition-colors"
                                >
                                  <Plus size={12} className="inline mr-1" />
                                  {mealType.icon} {mealType.label}
                                </button>
                              )
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 買い物リスト部分 */}
        <div className="lg:col-span-1">
          <ShoppingListSidebar
            ingredients={ingredients}
            shoppingList={shoppingList}
            shoppingDateRange={shoppingDateRange}
            setShoppingDateRange={setShoppingDateRange}
            generateShoppingList={generateShoppingList}
            toggleShoppingItem={toggleShoppingItem}
            loading={loading}
          />
        </div>
      </div>

      {/* 献立編集モーダル */}
      {showMealModal && (
        <MealPlanModal
          isOpen={showMealModal}
          onClose={closeMealModal}
          selectedDate={selectedDate}
          mealType={selectedMealType}
          editingMealPlan={editingMealPlan}
          savedRecipes={savedRecipes}
          onSave={saveMealPlan}
        />
      )}

      {/* 日別献立表示モーダル */}
      {showDayModal && (
        <DayMealPlansModal
          isOpen={showDayModal}
          onClose={() => setShowDayModal(false)}
          date={selectedDayDate}
          mealPlans={selectedDayPlans}
          mealTypes={mealTypes}
          onEditMeal={(mealType, existingPlan) => {
            setShowDayModal(false);
            openMealModal(selectedDayDate, mealType, existingPlan);
          }}
          onDeleteMeal={deleteMealPlan}
          onViewRecipe={openRecipeDetailFromCalendar}
        />
      )}

      {/* レシピ詳細モーダル（カレンダー用） */}
      {showRecipeDetailModal && selectedRecipeForDetail && (
        <SavedRecipeDetailModal
          recipe={selectedRecipeForDetail}
          isOpen={showRecipeDetailModal}
          onClose={() => {
            setShowRecipeDetailModal(false);
            setSelectedRecipeForDetail(null);
          }}
        />
      )}
    </div>
  );
};

// 買い物リストサイドバーコンポーネント
const ShoppingListSidebar = ({ 
  ingredients, 
  shoppingList, 
  shoppingDateRange, 
  setShoppingDateRange, 
  generateShoppingList, 
  toggleShoppingItem, 
  loading 
}) => {
  const [copyMessage, setCopyMessage] = useState('');

  // 買い物リストをテキスト形式で生成
  const generateShoppingListText = () => {
    if (shoppingList.length === 0) return '';

    const listText = shoppingList.map(item => 
      `• ${item.name} ${item.quantity}${item.unit} ${item.checked ? '✓' : ''}`
    ).join('\n');

    const header = `買い物リスト (${shoppingDateRange.start} 〜 ${shoppingDateRange.end})\n\n`;
    const footer = `\n完了: ${shoppingList.filter(item => item.checked).length}/${shoppingList.length}`;
    
    return header + listText + footer;
  };

  // クリップボードにコピー
  const copyToClipboard = async () => {
    const text = generateShoppingListText();
    if (!text) {
      setCopyMessage('コピーするリストがありません');
      setTimeout(() => setCopyMessage(''), 3000);
      return;
    }

    try {
      await navigator.clipboard.writeText(text);
      setCopyMessage('買い物リストをコピーしました！');
      setTimeout(() => setCopyMessage(''), 3000);
    } catch (error) {
      console.error('コピーに失敗:', error);
      setCopyMessage('コピーに失敗しました');
      setTimeout(() => setCopyMessage(''), 3000);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm">
      {/* ヘッダー */}
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <ShoppingCart size={20} />
          買い物リスト
        </h3>
      </div>

      <div className="p-4 space-y-4">
        {/* 期間選択 */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            期間を選択
          </label>
          <div className="space-y-2">
            <input
              type="date"
              value={shoppingDateRange.start}
              onChange={(e) => setShoppingDateRange({...shoppingDateRange, start: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="開始日"
            />
            <div className="text-center text-sm text-gray-500">〜</div>
            <input
              type="date"
              value={shoppingDateRange.end}
              onChange={(e) => setShoppingDateRange({...shoppingDateRange, end: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="終了日"
            />
          </div>
        </div>

        {/* 生成ボタン */}
        <button
          onClick={generateShoppingList}
          disabled={loading || !shoppingDateRange.start || !shoppingDateRange.end}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-400 transition-colors"
        >
          <ShoppingCart size={16} />
          {loading ? '生成中...' : 'リスト生成'}
        </button>

        {/* コピーメッセージ */}
        {copyMessage && (
          <div className={`p-2 rounded text-sm text-center ${
            copyMessage.includes('失敗') || copyMessage.includes('ありません')
              ? 'bg-red-100 text-red-700'
              : 'bg-green-100 text-green-700'
          }`}>
            {copyMessage}
          </div>
        )}

        {/* 買い物リスト表示 */}
        {shoppingList.length > 0 ? (
          <div className="space-y-3">
            {/* 統計情報とコピーボタン */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600">
                <div>完了: {shoppingList.filter(item => item.checked).length}</div>
                <div>合計: {shoppingList.length}個</div>
              </div>
              <button
                onClick={copyToClipboard}
                className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors"
              >
                📋 コピー
              </button>
            </div>

            {/* リストアイテム */}
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {shoppingList.map((item) => (
                <div 
                  key={item.id} 
                  className={`flex items-center gap-3 p-3 border border-gray-200 rounded-lg ${
                    item.checked ? 'bg-gray-50 opacity-60' : 'bg-white'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={item.checked}
                    onChange={() => toggleShoppingItem(item.id)}
                    className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                  <div className={`flex-1 ${item.checked ? 'line-through' : ''}`}>
                    <div className="font-medium text-gray-900 text-sm">
                      {item.name}
                    </div>
                    <div className="text-xs text-gray-600">
                      {item.quantity} {item.unit}
                    </div>
                    {item.recipes && item.recipes.length > 0 && (
                      <div className="text-xs text-gray-500 mt-1">
                        {item.recipes.join(', ')}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <ShoppingCart className="mx-auto mb-2" size={32} />
            <p className="text-sm">期間を選択して</p>
            <p className="text-sm">買い物リストを生成</p>
          </div>
        )}
      </div>
    </div>
  );
};

// 献立編集モーダル
const MealPlanModal = ({ isOpen, onClose, selectedDate, mealType, editingMealPlan, savedRecipes, onSave }) => {
  const [selectedRecipeId, setSelectedRecipeId] = useState(editingMealPlan?.recipe_id || '');
  const [customTitle, setCustomTitle] = useState(editingMealPlan?.recipe_title || '');
  const [notes, setNotes] = useState(editingMealPlan?.notes || '');
  const [useCustomTitle, setUseCustomTitle] = useState(!editingMealPlan?.recipe_id);

  const mealTypeLabels = {
    breakfast: '朝食',
    lunch: '昼食',
    dinner: '夕食'
  };

  const handleSave = () => {
    const selectedRecipe = savedRecipes.find(r => r.id === parseInt(selectedRecipeId));
    
    const mealPlanData = {
      recipe_id: useCustomTitle ? null : (selectedRecipeId || null),
      recipe_title: useCustomTitle ? customTitle : (selectedRecipe?.title || customTitle),
      notes: notes
    };

    if (!mealPlanData.recipe_title.trim()) {
      alert('レシピ名を入力するか、保存済みレシピを選択してください');
      return;
    }

    onSave(mealPlanData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[55] p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">
              {selectedDate?.toLocaleDateString()} - {mealTypeLabels[mealType]}
            </h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X size={20} />
            </button>
          </div>

          <div className="space-y-4">
            {/* レシピ選択方法 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                レシピの設定方法
              </label>
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    checked={!useCustomTitle}
                    onChange={() => setUseCustomTitle(false)}
                    className="mr-2"
                  />
                  保存済みレシピから選択
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    checked={useCustomTitle}
                    onChange={() => setUseCustomTitle(true)}
                    className="mr-2"
                  />
                  手動入力
                </label>
              </div>
            </div>

            {/* レシピ選択 */}
            {!useCustomTitle ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  保存済みレシピ
                </label>
                <select
                  value={selectedRecipeId}
                  onChange={(e) => setSelectedRecipeId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">レシピを選択...</option>
                  {savedRecipes.map(recipe => (
                    <option key={recipe.id} value={recipe.id}>
                      {recipe.title}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  料理名
                </label>
                <input
                  type="text"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  placeholder="例：手作りハンバーグ"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            {/* メモ */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                メモ（オプション）
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="調理のメモや特記事項など..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* 選択されたレシピの詳細 */}
            {!useCustomTitle && selectedRecipeId && (
              <div className="p-3 bg-gray-50 rounded-lg">
                {(() => {
                  const recipe = savedRecipes.find(r => r.id === parseInt(selectedRecipeId));
                  return recipe ? (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">{recipe.title}</h4>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <Clock size={12} />
                            {recipe.cooking_time || '不明'}分
                          </span>
                          <span className="flex items-center gap-1">
                            <Users size={12} />
                            {recipe.servings || '不明'}人分
                          </span>
                        </div>
                        {recipe.description && (
                          <p className="line-clamp-2">{recipe.description}</p>
                        )}
                      </div>
                    </div>
                  ) : null;
                })()}
              </div>
            )}
          </div>

          {/* アクションボタン */}
          <div className="flex gap-3 mt-6">
            <button
              onClick={handleSave}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <Save size={16} />
              保存
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              キャンセル
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// 日別献立表示モーダル
const DayMealPlansModal = ({ isOpen, onClose, date, mealPlans, mealTypes, onEditMeal, onDeleteMeal, onViewRecipe }) => {
  if (!isOpen || !date) return null;

  const formatDate = (date) => {
    const days = ['日', '月', '火', '水', '木', '金', '土'];
    const dayOfWeek = days[date.getDay()];
    return `${date.getMonth() + 1}月${date.getDate()}日 (${dayOfWeek})`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-gray-900">
              {formatDate(date)}の献立
            </h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X size={24} />
            </button>
          </div>

          <div className="space-y-6">
            {mealTypes.map(mealType => {
              const mealPlan = mealPlans.find(plan => plan.meal_type === mealType.key);
              
              return (
                <div key={mealType.key} className="border border-gray-200 rounded-lg overflow-hidden">
                  {/* 食事タイプヘッダー */}
                  <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <span className="text-2xl">{mealType.icon}</span>
                        {mealType.label}
                      </h4>
                      <div className="flex gap-2">
                        {mealPlan ? (
                          <>
                            <button
                              onClick={() => onEditMeal(mealType.key, mealPlan)}
                              className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                            >
                              編集
                            </button>
                            <button
                              onClick={() => onDeleteMeal(mealPlan.id)}
                              className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                            >
                              削除
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => onEditMeal(mealType.key)}
                            className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                          >
                            <Plus size={14} className="inline mr-1" />
                            追加
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 献立内容 */}
                  <div className="p-4">
                    {mealPlan ? (
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h5 className="text-xl font-semibold text-gray-900 mb-2">
                              {mealPlan.recipe_title}
                            </h5>
                            {mealPlan.notes && (
                              <p className="text-gray-600 text-sm mb-3">
                                <strong>メモ:</strong> {mealPlan.notes}
                              </p>
                            )}
                          </div>
                          {mealPlan.recipe_id && (
                            <button
                              onClick={() => onViewRecipe(mealPlan)}
                              className="ml-4 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors flex items-center gap-2"
                            >
                              <Info size={16} />
                              レシピ詳細
                            </button>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <Utensils className="mx-auto mb-2" size={32} />
                        <p>献立が設定されていません</p>
                        <p className="text-sm">「追加」ボタンから献立を登録しましょう</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 text-center">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              閉じる
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// 保存済みレシピ詳細モーダル
const SavedRecipeDetailModal = ({ recipe, isOpen, onClose }) => {
  if (!isOpen || !recipe) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[70] p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-gray-900">レシピ詳細</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X size={24} />
            </button>
          </div>

          <div className="space-y-6">
            {/* レシピタイトルと画像 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-xl font-bold text-gray-900 mb-4">{recipe.title}</h4>
                
                {/* 基本情報 */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Clock size={16} />
                    <span>{recipe.cooking_time || '不明'}分</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Users size={16} />
                    <span>{recipe.servings || '不明'}人分</span>
                  </div>
                </div>

                {/* 説明 */}
                {recipe.description && (
                  <div className="mb-4">
                    <h5 className="font-semibold text-gray-900 mb-2">説明</h5>
                    <p className="text-gray-700 text-sm leading-relaxed">
                      {recipe.description}
                    </p>
                  </div>
                )}
              </div>

              {/* レシピ画像 */}
              <div>
                {recipe.image_url ? (
                  <img
                    src={recipe.image_url}
                    alt={recipe.title}
                    className="w-full h-64 object-cover rounded-lg"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/400x300?text=No+Image';
                    }}
                  />
                ) : (
                  <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                    <ChefHat className="text-gray-400" size={48} />
                  </div>
                )}
              </div>
            </div>

            {/* 材料リスト */}
            {recipe.ingredients_needed && recipe.ingredients_needed.length > 0 && (
              <div>
                <h5 className="text-lg font-semibold text-gray-900 mb-3">材料 ({recipe.servings || '不明'}人分)</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {recipe.ingredients_needed.map((ingredient, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <span className="font-medium text-gray-900">{ingredient.name}</span>
                        <div className="text-sm text-gray-600">
                          {ingredient.quantity} {ingredient.unit}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 調理手順 */}
            {recipe.instructions && (
              <div>
                <h5 className="text-lg font-semibold text-gray-900 mb-3">作り方</h5>
                <div className="bg-gray-50 rounded-lg p-4">
                  <pre className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                    {recipe.instructions}
                  </pre>
                </div>
              </div>
            )}

            {/* 元サイトリンク */}
            {recipe.source_url && recipe.source_url !== '#' && (
              <div className="pt-4 border-t border-gray-200">
                <a
                  href={recipe.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <ExternalLink size={16} />
                  元のサイトで見る
                </a>
              </div>
            )}
          </div>

          <div className="mt-6 text-center">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              閉じる
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MealCalendar;