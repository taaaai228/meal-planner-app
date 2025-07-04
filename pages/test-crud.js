// pages/test-crud.js
import { useState, useEffect } from 'react'
import { ingredientOperations, recipeOperations } from '../lib/database'

export default function TestCRUD() {
  const [ingredients, setIngredients] = useState([])
  const [recipes, setRecipes] = useState([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  // 新しい食材追加用の状態
  const [newIngredient, setNewIngredient] = useState({
    name: '',
    quantity: '',
    unit: '個',
    category: '野菜'
  })

  // 初期データ読み込み
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [ingredientsData, recipesData] = await Promise.all([
        ingredientOperations.getAll(),
        recipeOperations.getAll()
      ])
      setIngredients(ingredientsData)
      setRecipes(recipesData)
      setMessage('データ読み込み成功')
    } catch (error) {
      setMessage(`エラー: ${error.message}`)
    }
    setLoading(false)
  }

  // 食材追加テスト
  const handleAddIngredient = async (e) => {
    e.preventDefault()
    if (!newIngredient.name.trim()) return

    try {
      const created = await ingredientOperations.create({
        ...newIngredient,
        quantity: parseFloat(newIngredient.quantity) || 0
      })
      
      setIngredients([created, ...ingredients])
      setNewIngredient({ name: '', quantity: '', unit: '個', category: '野菜' })
      setMessage('食材追加成功')
    } catch (error) {
      setMessage(`追加エラー: ${error.message}`)
    }
  }

  // 食材削除テスト
  const handleDeleteIngredient = async (id) => {
    try {
      await ingredientOperations.delete(id)
      setIngredients(ingredients.filter(item => item.id !== id))
      setMessage('食材削除成功')
    } catch (error) {
      setMessage(`削除エラー: ${error.message}`)
    }
  }

  // 食材数量更新テスト
  const handleUpdateQuantity = async (id, newQuantity) => {
    try {
      const updated = await ingredientOperations.update(id, {
        quantity: parseFloat(newQuantity),
        updated_at: new Date().toISOString()
      })
      
      setIngredients(ingredients.map(item => 
        item.id === id ? updated : item
      ))
      setMessage('数量更新成功')
    } catch (error) {
      setMessage(`更新エラー: ${error.message}`)
    }
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1000px' }}>
      <h1>CRUD操作テスト</h1>
      
      {loading && <p>読み込み中...</p>}
      {message && (
        <div style={{
          padding: '10px',
          margin: '10px 0',
          background: message.includes('エラー') ? '#ffebee' : '#e8f5e8',
          border: `1px solid ${message.includes('エラー') ? '#f44336' : '#4caf50'}`,
          borderRadius: '4px'
        }}>
          {message}
        </div>
      )}

      <button 
        onClick={loadData}
        style={{
          padding: '10px 20px',
          backgroundColor: '#2196F3',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          marginBottom: '20px'
        }}
      >
        データを再読み込み
      </button>

      {/* 食材追加フォーム */}
      <div style={{ marginBottom: '30px', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
        <h2>食材追加テスト</h2>
        <form onSubmit={handleAddIngredient} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="食材名"
            value={newIngredient.name}
            onChange={(e) => setNewIngredient({...newIngredient, name: e.target.value})}
            style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
          />
          <input
            type="number"
            placeholder="数量"
            value={newIngredient.quantity}
            onChange={(e) => setNewIngredient({...newIngredient, quantity: e.target.value})}
            style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px', width: '80px' }}
          />
          <select
            value={newIngredient.unit}
            onChange={(e) => setNewIngredient({...newIngredient, unit: e.target.value})}
            style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
          >
            <option value="個">個</option>
            <option value="本">本</option>
            <option value="g">g</option>
            <option value="kg">kg</option>
            <option value="ml">ml</option>
            <option value="L">L</option>
          </select>
          <select
            value={newIngredient.category}
            onChange={(e) => setNewIngredient({...newIngredient, category: e.target.value})}
            style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
          >
            <option value="野菜">野菜</option>
            <option value="肉類">肉類</option>
            <option value="魚類">魚類</option>
            <option value="卵・乳製品">卵・乳製品</option>
            <option value="穀物">穀物</option>
            <option value="調味料">調味料</option>
            <option value="その他">その他</option>
          </select>
          <button 
            type="submit"
            style={{
              padding: '8px 16px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            追加
          </button>
        </form>
      </div>

      {/* 食材一覧（更新・削除テスト） */}
      <div style={{ marginBottom: '30px' }}>
        <h2>食材一覧（{ingredients.length}件）</h2>
        <div style={{ display: 'grid', gap: '10px' }}>
          {ingredients.map((ingredient) => (
            <div 
              key={ingredient.id}
              style={{
                padding: '15px',
                border: '1px solid #ddd',
                borderRadius: '8px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div>
                <strong>{ingredient.name}</strong>
                <span style={{ margin: '0 10px', color: '#666' }}>
                  {ingredient.quantity}{ingredient.unit} ({ingredient.category})
                </span>
                {ingredient.expiry_date && (
                  <span style={{ color: '#999', fontSize: '0.9em' }}>
                    期限: {new Date(ingredient.expiry_date).toLocaleDateString()}
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <input
                  type="number"
                  defaultValue={ingredient.quantity}
                  onBlur={(e) => {
                    const newQty = e.target.value
                    if (newQty !== ingredient.quantity.toString()) {
                      handleUpdateQuantity(ingredient.id, newQty)
                    }
                  }}
                  style={{
                    width: '60px',
                    padding: '4px',
                    border: '1px solid #ccc',
                    borderRadius: '4px'
                  }}
                />
                <button
                  onClick={() => handleDeleteIngredient(ingredient.id)}
                  style={{
                    padding: '4px 8px',
                    backgroundColor: '#f44336',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '0.8em'
                  }}
                >
                  削除
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* レシピ一覧 */}
      <div>
        <h2>レシピ一覧（{recipes.length}件）</h2>
        <div style={{ display: 'grid', gap: '15px' }}>
          {recipes.map((recipe) => (
            <div 
              key={recipe.id}
              style={{
                padding: '20px',
                border: '1px solid #ddd',
                borderRadius: '8px',
                backgroundColor: '#f9f9f9'
              }}
            >
              <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>{recipe.title}</h3>
              <p style={{ margin: '0 0 10px 0', color: '#666' }}>{recipe.description}</p>
              <div style={{ fontSize: '0.9em', color: '#888' }}>
                調理時間: {recipe.cooking_time}分 | {recipe.servings}人分
              </div>
              {recipe.ingredients_needed && (
                <div style={{ marginTop: '10px' }}>
                  <strong>必要な食材:</strong>
                  <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
                    {(() => {
                      try {
                        // 既にオブジェクトの場合はそのまま使用、文字列の場合はパース
                        const ingredients = typeof recipe.ingredients_needed === 'string' 
                          ? JSON.parse(recipe.ingredients_needed)
                          : recipe.ingredients_needed;
                        
                        return ingredients.map((ing, index) => (
                          <li key={index} style={{ fontSize: '0.9em' }}>
                            {ing.name} {ing.quantity}{ing.unit}
                          </li>
                        ));
                      } catch (error) {
                        return <li style={{ color: 'red', fontSize: '0.9em' }}>
                          食材データの解析エラー: {error.message}
                        </li>;
                      }
                    })()}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}