// pages/api/recipe-detail.js
// Spoonacular APIからレシピ詳細情報を取得

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ message: 'Recipe ID is required' });
    }

    if (!process.env.SPOONACULAR_API_KEY) {
      return res.status(500).json({ 
        message: 'Spoonacular API key not configured' 
      });
    }

    try {
      // レシピの詳細情報を取得
      // API使用制限対策：nutritionパラメータを削除（別APIコールになるため）
      const recipeUrl = `https://api.spoonacular.com/recipes/${id}/information?apiKey=${process.env.SPOONACULAR_API_KEY}`;
      
      console.log('Fetching recipe detail:', recipeUrl);
      
      const response = await fetch(recipeUrl);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Recipe detail API error:', response.status, errorText);
        throw new Error(`Spoonacular API error: ${response.status} - ${errorText}`);
      }
      
      const recipeData = await response.json();
      
      // 調理手順を取得（analyzedInstructionsから）
      let instructions = '';
      if (recipeData.analyzedInstructions && recipeData.analyzedInstructions.length > 0) {
        instructions = recipeData.analyzedInstructions[0].steps
          .map((step, index) => `${index + 1}. ${step.step}`)
          .join('\n');
      } else if (recipeData.instructions) {
        // HTMLタグを除去
        instructions = recipeData.instructions.replace(/<[^>]*>/g, '');
      }

      // レスポンス用データを整形
      const formattedRecipe = {
        id: recipeData.id,
        title: recipeData.title,
        image: recipeData.image,
        servings: recipeData.servings,
        readyInMinutes: recipeData.readyInMinutes,
        pricePerServing: recipeData.pricePerServing,
        
        // 詳細情報
        summary: recipeData.summary?.replace(/<[^>]*>/g, '') || '', // HTMLタグ除去
        instructions: instructions,
        
        // 材料情報
        extendedIngredients: recipeData.extendedIngredients?.map(ingredient => ({
          id: ingredient.id,
          name: ingredient.name,
          amount: ingredient.amount,
          unit: ingredient.unit,
          originalString: ingredient.originalString,
          image: ingredient.image ? `https://spoonacular.com/cdn/ingredients_100x100/${ingredient.image}` : null
        })) || [],
        
        // 栄養情報（API制限対策で簡易版）
        nutrition: recipeData.nutrition ? {
          calories: recipeData.nutrition.nutrients?.find(n => n.name === 'Calories')?.amount || 0,
          protein: recipeData.nutrition.nutrients?.find(n => n.name === 'Protein')?.amount || 0,
          fat: recipeData.nutrition.nutrients?.find(n => n.name === 'Fat')?.amount || 0,
          carbohydrates: recipeData.nutrition.nutrients?.find(n => n.name === 'Carbohydrates')?.amount || 0
        } : {
          // 栄養情報が取得できない場合のデフォルト値
          calories: 0,
          protein: 0,
          fat: 0,
          carbohydrates: 0,
          note: '栄養情報は利用できません（API制限対策）'
        },

        // その他の情報
        sourceUrl: recipeData.sourceUrl,
        spoonacularSourceUrl: recipeData.spoonacularSourceUrl,
        healthScore: recipeData.healthScore,
        spoonacularScore: recipeData.spoonacularScore,
        aggregateLikes: recipeData.aggregateLikes,
        
        // ダイエット・アレルギー情報
        vegetarian: recipeData.vegetarian,
        vegan: recipeData.vegan,
        glutenFree: recipeData.glutenFree,
        dairyFree: recipeData.dairyFree,
        veryHealthy: recipeData.veryHealthy,
        cheap: recipeData.cheap,
        veryPopular: recipeData.veryPopular,
        
        // 料理タイプ
        dishTypes: recipeData.dishTypes || [],
        diets: recipeData.diets || [],
        occasions: recipeData.occasions || []
      };

      res.status(200).json({
        success: true,
        recipe: formattedRecipe
      });

    } catch (error) {
      console.error('Recipe detail API error:', error);
      
      res.status(500).json({
        success: false,
        message: 'Failed to fetch recipe details',
        error: error.message
      });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}