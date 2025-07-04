// pages/test-connection.js
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function TestConnection() {
  const [connectionStatus, setConnectionStatus] = useState('接続中...')
  const [ingredients, setIngredients] = useState([])
  const [insertStatus, setInsertStatus] = useState('') // 追加

  useEffect(() => {
    testConnection()
  }, [])

  const testConnection = async () => {
    try {
      const { data, error } = await supabase
        .from('ingredients')
        .select('*')
        .limit(5)

      if (error) {
        setConnectionStatus(`エラー: ${error.message}`)
      } else {
        setConnectionStatus('接続成功！')
        setIngredients(data)
      }
    } catch (err) {
      setConnectionStatus(`予期しないエラー: ${err.message}`)
    }
  }

  // ここに挿入テスト関数を追加
  const insertTestData = async () => {
    setInsertStatus('挿入中...')
    try {
      const { data, error } = await supabase
        .from('ingredients')
        .insert([
          { name: 'にんじん', quantity: 2, unit: '本', category: '野菜' },
          { name: 'たまねぎ', quantity: 1, unit: '個', category: '野菜' },
          { name: '牛肉', quantity: 300, unit: 'g', category: '肉類' }
        ])
        .select() // 挿入されたデータを返す

      if (error) {
        setInsertStatus(`挿入エラー: ${error.message}`)
      } else {
        setInsertStatus('挿入成功！')
        // データを再取得して表示を更新
        testConnection()
      }
    } catch (err) {
      setInsertStatus(`予期しないエラー: ${err.message}`)
    }
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>Supabase接続テスト</h1>
      <p>ステータス: {connectionStatus}</p>
      
      {/* テストデータ挿入ボタンを追加 */}
      <div style={{ margin: '20px 0' }}>
        <button 
          onClick={insertTestData}
          style={{ 
            padding: '10px 20px', 
            backgroundColor: '#4CAF50', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          テストデータを挿入
        </button>
        {insertStatus && <p>挿入ステータス: {insertStatus}</p>}
      </div>
      
      <h2>食材データ:</h2>
      {ingredients.length > 0 ? (
        <ul>
          {ingredients.map((ingredient, index) => (
            <li key={ingredient.id || index}>
              {ingredient.name} - {ingredient.quantity}{ingredient.unit} ({ingredient.category})
            </li>
          ))}
        </ul>
      ) : (
        <p>データがありません</p>
      )}
    </div>
  )
}