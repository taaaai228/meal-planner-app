// pages/api/test-apis.js
// APIキーと接続をテストするエンドポイント

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const results = {
      spoonacular: { configured: false, working: false, error: null },
      googleTranslate: { configured: false, working: false, error: null }
    };

    // 1. Spoonacular APIキーの確認
    if (process.env.SPOONACULAR_API_KEY) {
      results.spoonacular.configured = true;
      
      try {
        // シンプルなAPIテスト（レシピ1件取得）
        const testUrl = `https://api.spoonacular.com/recipes/716429/information?apiKey=${process.env.SPOONACULAR_API_KEY}`;
        const response = await fetch(testUrl);
        
        if (response.ok) {
          results.spoonacular.working = true;
        } else {
          results.spoonacular.error = `HTTP ${response.status}: ${response.statusText}`;
        }
      } catch (error) {
        results.spoonacular.error = error.message;
      }
    } else {
      results.spoonacular.error = 'API key not configured in .env.local';
    }

    // 2. Google Translate APIキーの確認
    if (process.env.GOOGLE_TRANSLATE_API_KEY) {
      results.googleTranslate.configured = true;
      
      try {
        // シンプルな翻訳テスト
        const url = `https://translation.googleapis.com/language/translate/v2?key=${process.env.GOOGLE_TRANSLATE_API_KEY}`;
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            q: 'test',
            source: 'en',
            target: 'ja',
            format: 'text'
          })
        });

        if (response.ok) {
          results.googleTranslate.working = true;
        } else {
          results.googleTranslate.error = `HTTP ${response.status}: ${response.statusText}`;
        }
      } catch (error) {
        results.googleTranslate.error = error.message;
      }
    } else {
      results.googleTranslate.error = 'API key not configured in .env.local';
    }

    // 結果を返す
    res.status(200).json({
      success: true,
      results,
      recommendations: generateRecommendations(results)
    });

  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}

function generateRecommendations(results) {
  const recommendations = [];

  if (!results.spoonacular.configured) {
    recommendations.push('SPOONACULAR_API_KEY を .env.local に追加してください');
  } else if (!results.spoonacular.working) {
    recommendations.push(`Spoonacular API エラー: ${results.spoonacular.error}`);
  }

  if (!results.googleTranslate.configured) {
    recommendations.push('GOOGLE_TRANSLATE_API_KEY を .env.local に追加してください');
  } else if (!results.googleTranslate.working) {
    recommendations.push(`Google Translate API エラー: ${results.googleTranslate.error}`);
  }

  if (results.spoonacular.working && results.googleTranslate.working) {
    recommendations.push('✅ 全APIが正常に動作しています！');
  }

  return recommendations;
}