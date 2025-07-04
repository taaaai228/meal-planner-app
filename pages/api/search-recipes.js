// pages/api/search-recipes.js
// Google Translate APIを使用したレシピ検索API

import { translateTexts, translateSingleText } from '../../lib/translationHelper';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { ingredients, mainFood, searchType = 'ingredients', query } = req.body;

  try {
    let recipes = [];
    let translationInfo = null;

    if (searchType === 'ingredients') {
      // 食材ベース検索
      const allIngredients = ingredients ? [...ingredients] : [];
      if (mainFood && !allIngredients.includes(mainFood)) {
        allIngredients.push(mainFood);
      }

      if (allIngredients.length === 0) {
        return res.status(400).json({
          success: false,
          message: '食材が指定されていません'
        });
      }

      // Google Translate APIで食材を翻訳
      console.log('翻訳対象の食材:', allIngredients);
      const translationResults = await translateTexts(allIngredients);
      const translatedIngredients = translationResults.map(result => result.translated);
      
      // 翻訳統計
      const translationStats = {
        total: translationResults.length,
        translated: translationResults.filter(r => r.wasTranslated).length,
        failed: translationResults.filter(r => r.error).length,
        successRate: translationResults.length > 0 ? 
          Math.round((translationResults.filter(r => r.wasTranslated).length / translationResults.length) * 100) : 0
      };

      translationInfo = {
        originalIngredients: allIngredients,
        translatedIngredients: translatedIngredients,
        translationResults: translationResults,
        translationStats: translationStats
      };

      console.log('Google翻訳結果:', translationResults);
      console.log('翻訳統計:', translationStats);

      // Spoonacular APIキーの確認
      if (!process.env.SPOONACULAR_API_KEY) {
        throw new Error('Spoonacular API key not configured');
      }

      // Spoonacular APIで検索（英語の食材名を使用）
      const ingredientsString = translatedIngredients.join(',');
      const spoonacularUrl = `https://api.spoonacular.com/recipes/findByIngredients?ingredients=${encodeURIComponent(ingredientsString)}&number=12&ranking=1&ignorePantry=true&apiKey=${process.env.SPOONACULAR_API_KEY}`;
      
      console.log('Spoonacular URL:', spoonacularUrl);
      console.log('送信する食材 (英語):', translatedIngredients);

      const response = await fetch(spoonacularUrl);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Spoonacular API エラー:', response.status, errorText);
        throw new Error(`Spoonacular API error: ${response.status} - ${errorText}`);
      }

      const spoonacularData = await response.json();
      console.log('Spoonacular レスポンス:', spoonacularData.length, '件');

      // レシピデータを整形
      recipes = spoonacularData.map(recipe => ({
        id: recipe.id,
        title: recipe.title,
        description: `${recipe.usedIngredientCount}個の食材がマッチ、${recipe.missedIngredientCount}個の食材が不足`,
        cookingTime: 30, // デフォルト値
        servings: 2, // デフォルト値
        imageUrl: recipe.image || 'https://via.placeholder.com/300x200?text=No+Image',
        sourceUrl: `https://spoonacular.com/recipes/${recipe.title.replace(/\s+/g, '-').toLowerCase()}-${recipe.id}`,
        usedIngredients: recipe.usedIngredients?.map(ing => ing.name) || [],
        missedIngredients: recipe.missedIngredients?.map(ing => ing.name) || [],
        usedIngredientCount: recipe.usedIngredientCount || 0,
        missedIngredientCount: recipe.missedIngredientCount || 0,
        likes: recipe.likes || 0,
        spoonacularId: recipe.id
      }));

      // マッチング度でソート
      recipes.sort((a, b) => {
        if (b.usedIngredientCount !== a.usedIngredientCount) {
          return b.usedIngredientCount - a.usedIngredientCount;
        }
        return a.missedIngredientCount - b.missedIngredientCount;
      });

    } else if (searchType === 'query') {
      // キーワード検索
      if (!query || !query.trim()) {
        return res.status(400).json({
          success: false,
          message: '検索キーワードが指定されていません'
        });
      }

      // Google Translate APIでキーワードを翻訳
      console.log('翻訳対象のキーワード:', query);
      const translationResult = await translateSingleText(query.trim());
      const translatedQuery = translationResult.translated;

      console.log('Google翻訳結果:', translationResult);

      // Spoonacular APIキーの確認
      if (!process.env.SPOONACULAR_API_KEY) {
        throw new Error('Spoonacular API key not configured');
      }

      // Spoonacular APIで検索（英語のキーワードを使用）
      const spoonacularUrl = `https://api.spoonacular.com/recipes/complexSearch?query=${encodeURIComponent(translatedQuery)}&number=12&addRecipeInformation=true&apiKey=${process.env.SPOONACULAR_API_KEY}`;
      
      console.log('Spoonacular URL:', spoonacularUrl);
      console.log('送信するキーワード (英語):', translatedQuery);

      const response = await fetch(spoonacularUrl);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Spoonacular API エラー:', response.status, errorText);
        throw new Error(`Spoonacular API error: ${response.status} - ${errorText}`);
      }

      const spoonacularData = await response.json();
      console.log('Spoonacular レスポンス:', spoonacularData.results?.length || 0, '件');

      // レシピデータを整形
      recipes = (spoonacularData.results || []).map(recipe => ({
        id: recipe.id,
        title: recipe.title,
        description: recipe.summary?.replace(/<[^>]*>/g, '').substring(0, 100) + '...' || 'レシピの説明',
        cookingTime: recipe.readyInMinutes || 30,
        servings: recipe.servings || 2,
        imageUrl: recipe.image || 'https://via.placeholder.com/300x200?text=No+Image',
        sourceUrl: recipe.sourceUrl || `https://spoonacular.com/recipes/${recipe.title.replace(/\s+/g, '-').toLowerCase()}-${recipe.id}`,
        usedIngredients: [],
        missedIngredients: [],
        usedIngredientCount: 0,
        missedIngredientCount: 0,
        likes: recipe.aggregateLikes || 0,
        spoonacularId: recipe.id
      }));

      translationInfo = {
        originalQuery: query,
        translatedQuery: translatedQuery,
        translationResult: translationResult
      };

    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid search type. Use "ingredients" or "query"'
      });
    }

    // 成功レスポンス
    res.status(200).json({
      success: true,
      recipes,
      searchInfo: {
        searchType,
        searchedIngredients: searchType === 'ingredients' ? (ingredients || []) : [],
        query: searchType === 'query' ? query : null,
        totalResults: recipes.length,
        translationInfo
      }
    });

  } catch (error) {
    console.error('Recipe search API エラー:', error);

    // エラー時のフォールバック
    const fallbackRecipes = [
      {
        id: `fallback-${Date.now()}`,
        title: `${searchType === 'query' ? query : (mainFood || '食材')}を使った料理`,
        description: `${searchType === 'ingredients' ? 
          (ingredients?.join('、') || '食材') : query}を使ったレシピ`,
        cookingTime: 30,
        servings: 2,
        imageUrl: 'https://via.placeholder.com/300x200?text=Recipe+Not+Found',
        sourceUrl: '#',
        usedIngredients: searchType === 'ingredients' ? (ingredients || []) : [],
        missedIngredients: [],
        usedIngredientCount: searchType === 'ingredients' ? (ingredients?.length || 0) : 0,
        missedIngredientCount: 0,
        likes: 0,
        isFallback: true
      }
    ];

    res.status(200).json({
      success: false,
      recipes: fallbackRecipes,
      searchInfo: {
        searchType: searchType || 'ingredients',
        searchedIngredients: searchType === 'ingredients' ? (ingredients || []) : [],
        query: searchType === 'query' ? query : null,
        totalResults: 1,
        fallback: true,
        error: error.message
      }
    });
  }
}