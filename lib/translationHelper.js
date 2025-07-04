// lib/translationHelper.js
// Google Translate APIを使用した共通翻訳ヘルパー

// Google Translate APIで翻訳
export const translateWithGoogleAPI = async (text, targetLang = 'en', sourceLang = 'ja') => {
  try {
    const response = await fetch('/api/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text,
        targetLang,
        sourceLang
      })
    });

    if (!response.ok) {
      throw new Error(`Translation API error: ${response.status}`);
    }

    const data = await response.json();
    return data.translatedText;
  } catch (error) {
    console.error('Translation error:', error);
    // フォールバック：基本辞書
    return fallbackTranslation(text);
  }
};

// フォールバック用の基本辞書（大幅拡張）
const basicDictionary = {
  // 肉類
  'ベーコン': 'bacon', 'べーこん': 'bacon',
  'ハム': 'ham', 'はむ': 'ham',
  'ソーセージ': 'sausage', 'そーせーじ': 'sausage',
  '鶏肉': 'chicken', 'とりにく': 'chicken', 'チキン': 'chicken',
  '牛肉': 'beef', 'ぎゅうにく': 'beef', 'ビーフ': 'beef',
  '豚肉': 'pork', 'ぶたにく': 'pork', 'ポーク': 'pork',
  'ひき肉': 'ground meat', 'みんち': 'ground meat',
  
  // 野菜
  'たまねぎ': 'onion', '玉ねぎ': 'onion', 'タマネギ': 'onion', 'オニオン': 'onion',
  'ニンジン': 'carrot', 'にんじん': 'carrot', '人参': 'carrot', 'キャロット': 'carrot',
  'じゃがいも': 'potato', 'ジャガイモ': 'potato', 'ポテト': 'potato',
  'トマト': 'tomato', 'とまと': 'tomato',
  'レタス': 'lettuce', 'れたす': 'lettuce',
  'キャベツ': 'cabbage', 'きゃべつ': 'cabbage',
  'ピーマン': 'bell pepper', 'ぴーまん': 'bell pepper',
  'きゅうり': 'cucumber', 'キュウリ': 'cucumber',
  'なす': 'eggplant', 'ナス': 'eggplant', '茄子': 'eggplant',
  'ブロッコリー': 'broccoli', 'ぶろっこりー': 'broccoli',
  'ほうれん草': 'spinach', 'ほうれんそう': 'spinach', 'スピナッチ': 'spinach',
  'アスパラ': 'asparagus', 'アスパラガス': 'asparagus',
  'もやし': 'bean sprouts', 'モヤシ': 'bean sprouts',
  'しめじ': 'shimeji mushroom', 'シメジ': 'shimeji mushroom',
  'えのき': 'enoki mushroom', 'エノキ': 'enoki mushroom',
  'しいたけ': 'shiitake mushroom', 'シイタケ': 'shiitake mushroom',
  
  // 基本食材
  '卵': 'egg', 'たまご': 'egg', 'タマゴ': 'egg',
  'チーズ': 'cheese', 'ちーず': 'cheese',
  '牛乳': 'milk', 'ぎゅうにゅう': 'milk', 'ミルク': 'milk',
  'バター': 'butter', 'ばたー': 'butter',
  '米': 'rice', 'こめ': 'rice', 'ライス': 'rice',
  'パン': 'bread', 'ぱん': 'bread', 'ブレッド': 'bread',
  '小麦粉': 'flour', 'こむぎこ': 'flour',
  
  // 魚介類
  '魚': 'fish', 'さかな': 'fish', 'フィッシュ': 'fish',
  'サーモン': 'salmon', 'さーもん': 'salmon', '鮭': 'salmon',
  'まぐろ': 'tuna', 'マグロ': 'tuna', 'ツナ': 'tuna',
  'えび': 'shrimp', 'エビ': 'shrimp', '海老': 'shrimp',
  'いか': 'squid', 'イカ': 'squid',
  
  // パスタ・麺類
  'パスタ': 'pasta', 'ぱすた': 'pasta',
  'スパゲッティ': 'spaghetti', 'すぱげってぃ': 'spaghetti',
  'うどん': 'udon', 'ウドン': 'udon',
  'そば': 'soba', 'ソバ': 'soba',
  'ラーメン': 'ramen', 'らーめん': 'ramen',
  '中華麺': 'chinese noodles', 'ちゅうかめん': 'chinese noodles',
  
  // 調味料
  '塩': 'salt', 'しお': 'salt', 'ソルト': 'salt',
  '砂糖': 'sugar', 'さとう': 'sugar', 'シュガー': 'sugar',
  '醤油': 'soy sauce', 'しょうゆ': 'soy sauce',
  '味噌': 'miso', 'みそ': 'miso',
  '酢': 'vinegar', 'す': 'vinegar', 'ビネガー': 'vinegar',
  'オリーブオイル': 'olive oil', 'おりーぶおいる': 'olive oil',
  'ニンニク': 'garlic', 'にんにく': 'garlic', 'ガーリック': 'garlic',
  '生姜': 'ginger', 'しょうが': 'ginger', 'ジンジャー': 'ginger',
  'こしょう': 'pepper', 'コショウ': 'pepper', 'ペッパー': 'pepper',
  
  // 料理名
  'カレー': 'curry', 'かれー': 'curry',
  'スープ': 'soup', 'すーぷ': 'soup',
  'サラダ': 'salad', 'さらだ': 'salad',
  'ピザ': 'pizza', 'ぴざ': 'pizza',
  'ハンバーガー': 'hamburger', 'はんばーがー': 'hamburger',
  'オムライス': 'omelet rice', 'おむらいす': 'omelet rice',
  'チャーハン': 'fried rice', 'ちゃーはん': 'fried rice',
  'から揚げ': 'fried chicken', 'からあげ': 'fried chicken', '唐揚げ': 'fried chicken',
  'ハンバーグ': 'hamburger steak', 'はんばーぐ': 'hamburger steak',
  '天ぷら': 'tempura', 'てんぷら': 'tempura',
  '寿司': 'sushi', 'すし': 'sushi',
  '刺身': 'sashimi', 'さしみ': 'sashimi',
  '焼き魚': 'grilled fish', 'やきざかな': 'grilled fish',
  'ステーキ': 'steak', 'すてーき': 'steak',
  '煮物': 'simmered dish', 'にもの': 'simmered dish',
  '炒め物': 'stir fry', 'いためもの': 'stir fry',
  
  // 果物
  'りんご': 'apple', 'リンゴ': 'apple', 'アップル': 'apple',
  'バナナ': 'banana', 'ばなな': 'banana',
  'みかん': 'orange', 'ミカン': 'orange', 'オレンジ': 'orange',
  'いちご': 'strawberry', 'イチゴ': 'strawberry', 'ストロベリー': 'strawberry',
  'ぶどう': 'grape', 'ブドウ': 'grape', 'グレープ': 'grape',
  
  // その他
  '豆腐': 'tofu', 'とうふ': 'tofu',
  '納豆': 'natto', 'なっとう': 'natto',
  'わかめ': 'wakame', 'ワカメ': 'wakame',
  'のり': 'seaweed', 'ノリ': 'seaweed', '海苔': 'seaweed'
};

// フォールバック翻訳
const fallbackTranslation = (text) => {
  const trimmed = text.trim();
  
  // 英語っぽい場合はそのまま
  if (/^[a-zA-Z\s\-']+$/.test(trimmed)) {
    return trimmed;
  }
  
  // 基本辞書から検索（大文字小文字を区別しない）
  const lowerText = trimmed.toLowerCase();
  for (const [japanese, english] of Object.entries(basicDictionary)) {
    if (japanese.toLowerCase() === lowerText) {
      return english;
    }
  }

  // 部分マッチング
  for (const [japanese, english] of Object.entries(basicDictionary)) {
    if (trimmed.includes(japanese) || japanese.includes(trimmed)) {
      return english;
    }
  }

  // 翻訳できない場合はそのまま返す
  console.warn(`翻訳辞書に見つからない: "${trimmed}"`);
  return trimmed;
};

// 複数の食材/キーワードを翻訳
export const translateTexts = async (textList) => {
  const results = [];
  
  for (const text of textList) {
    const trimmed = text.trim();
    
    // 英語っぽい場合はそのまま
    if (/^[a-zA-Z\s\-']+$/.test(trimmed)) {
      results.push({
        original: trimmed,
        translated: trimmed,
        wasTranslated: false
      });
      continue;
    }

    try {
      // まずフォールバック辞書を確認
      const fallbackResult = fallbackTranslation(trimmed);
      
      // 辞書にある場合はそれを使用（Google API節約）
      if (fallbackResult !== trimmed && basicDictionary[trimmed]) {
        results.push({
          original: trimmed,
          translated: fallbackResult,
          wasTranslated: true,
          source: 'dictionary'
        });
        console.log(`辞書翻訳: "${trimmed}" → "${fallbackResult}"`);
        continue;
      }

      // Google Translate APIを使用
      const translated = await translateWithGoogleAPI(trimmed);
      results.push({
        original: trimmed,
        translated: translated,
        wasTranslated: translated !== trimmed,
        source: 'google_api'
      });
      
      console.log(`Google翻訳: "${trimmed}" → "${translated}"`);
      
      // API制限対策
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.error(`翻訳失敗: ${trimmed}`, error);
      const fallbackResult = fallbackTranslation(trimmed);
      results.push({
        original: trimmed,
        translated: fallbackResult,
        wasTranslated: fallbackResult !== trimmed,
        error: error.message,
        source: 'fallback'
      });
    }
  }
  
  return results;
};

// 食材名の正規化（同義語を標準形に統一）
export const normalizeIngredientName = (name) => {
  const trimmed = name.trim().toLowerCase();
  
  // 同義語辞書（複数の表記を標準形に統一）
  const synonymMap = {
    // 野菜
    'たまねぎ': 'たまねぎ',
    '玉ねぎ': 'たまねぎ',
    'タマネギ': 'たまねぎ',
    'オニオン': 'たまねぎ',
    'onion': 'たまねぎ',
    
    'にんじん': 'にんじん',
    'ニンジン': 'にんじん',
    '人参': 'にんじん',
    'キャロット': 'にんじん',
    'carrot': 'にんじん',
    
    'じゃがいも': 'じゃがいも',
    'ジャガイモ': 'じゃがいも',
    'ポテト': 'じゃがいも',
    'potato': 'じゃがいも',
    
    'とまと': 'トマト',
    'トマト': 'トマト',
    'tomato': 'トマト',
    
    'きゅうり': 'きゅうり',
    'キュウリ': 'きゅうり',
    'cucumber': 'きゅうり',
    
    'なす': 'なす',
    'ナス': 'なす',
    '茄子': 'なす',
    'eggplant': 'なす',
    
    'ぴーまん': 'ピーマン',
    'ピーマン': 'ピーマン',
    'bell pepper': 'ピーマン',
    
    'きゃべつ': 'キャベツ',
    'キャベツ': 'キャベツ',
    'cabbage': 'キャベツ',
    
    'れたす': 'レタス',
    'レタス': 'レタス',
    'lettuce': 'レタス',
    
    'ほうれんそう': 'ほうれん草',
    'ほうれん草': 'ほうれん草',
    'スピナッチ': 'ほうれん草',
    'spinach': 'ほうれん草',
    
    'ぶろっこりー': 'ブロッコリー',
    'ブロッコリー': 'ブロッコリー',
    'broccoli': 'ブロッコリー',
    
    'もやし': 'もやし',
    'モヤシ': 'もやし',
    'bean sprouts': 'もやし',
    
    // きのこ類
    'しめじ': 'しめじ',
    'シメジ': 'しめじ',
    'shimeji mushroom': 'しめじ',
    
    'えのき': 'えのき',
    'エノキ': 'えのき',
    'enoki mushroom': 'えのき',
    
    'しいたけ': 'しいたけ',
    'シイタケ': 'しいたけ',
    'shiitake mushroom': 'しいたけ',
    
    // 肉類
    'べーこん': 'ベーコン',
    'ベーコン': 'ベーコン',
    'bacon': 'ベーコン',
    
    'はむ': 'ハム',
    'ハム': 'ハム',
    'ham': 'ハム',
    
    'そーせーじ': 'ソーセージ',
    'ソーセージ': 'ソーセージ',
    'sausage': 'ソーセージ',
    
    'とりにく': '鶏肉',
    '鶏肉': '鶏肉',
    'チキン': '鶏肉',
    'chicken': '鶏肉',
    
    'ぎゅうにく': '牛肉',
    '牛肉': '牛肉',
    'ビーフ': '牛肉',
    'beef': '牛肉',
    
    'ぶたにく': '豚肉',
    '豚肉': '豚肉',
    'ポーク': '豚肉',
    'pork': '豚肉',
    
    'ひきにく': 'ひき肉',
    'ひき肉': 'ひき肉',
    'みんち': 'ひき肉',
    'ground meat': 'ひき肉',
    
    // 魚介類
    'さかな': '魚',
    '魚': '魚',
    'フィッシュ': '魚',
    'fish': '魚',
    
    'さーもん': 'サーモン',
    'サーモン': 'サーモン',
    '鮭': 'サーモン',
    'salmon': 'サーモン',
    
    'まぐろ': 'まぐろ',
    'マグロ': 'まぐろ',
    'ツナ': 'まぐろ',
    'tuna': 'まぐろ',
    
    'えび': 'えび',
    'エビ': 'えび',
    '海老': 'えび',
    'shrimp': 'えび',
    
    'いか': 'いか',
    'イカ': 'いか',
    'squid': 'いか',
    
    // 基本食材
    'たまご': '卵',
    '卵': '卵',
    'タマゴ': '卵',
    'egg': '卵',
    
    'ちーず': 'チーズ',
    'チーズ': 'チーズ',
    'cheese': 'チーズ',
    
    'ぎゅうにゅう': '牛乳',
    '牛乳': '牛乳',
    'ミルク': '牛乳',
    'milk': '牛乳',
    
    'ばたー': 'バター',
    'バター': 'バター',
    'butter': 'バター',
    
    'こめ': '米',
    '米': '米',
    'ライス': '米',
    'rice': '米',
    
    'ぱん': 'パン',
    'パン': 'パン',
    'ブレッド': 'パン',
    'bread': 'パン',
    
    'こむぎこ': '小麦粉',
    '小麦粉': '小麦粉',
    'flour': '小麦粉',
    
    // 調味料
    'しお': '塩',
    '塩': '塩',
    'ソルト': '塩',
    'salt': '塩',
    
    'さとう': '砂糖',
    '砂糖': '砂糖',
    'シュガー': '砂糖',
    'sugar': '砂糖',
    
    'しょうゆ': '醤油',
    '醤油': '醤油',
    'soy sauce': '醤油',
    
    'みそ': '味噌',
    '味噌': '味噌',
    'miso': '味噌',
    
    'す': '酢',
    '酢': '酢',
    'ビネガー': '酢',
    'vinegar': '酢',
    
    'おりーぶおいる': 'オリーブオイル',
    'オリーブオイル': 'オリーブオイル',
    'olive oil': 'オリーブオイル',
    
    'にんにく': 'ニンニク',
    'ニンニク': 'ニンニク',
    'ガーリック': 'ニンニク',
    'garlic': 'ニンニク',
    
    'しょうが': '生姜',
    '生姜': '生姜',
    'ジンジャー': '生姜',
    'ginger': '生姜',
    
    'こしょう': 'こしょう',
    'コショウ': 'こしょう',
    'ペッパー': 'こしょう',
    'pepper': 'こしょう',
    
    // 果物
    'りんご': 'りんご',
    'リンゴ': 'りんご',
    'アップル': 'りんご',
    'apple': 'りんご',
    
    'ばなな': 'バナナ',
    'バナナ': 'バナナ',
    'banana': 'バナナ',
    
    'みかん': 'みかん',
    'ミカン': 'みかん',
    'オレンジ': 'みかん',
    'orange': 'みかん',
    
    'いちご': 'いちご',
    'イチゴ': 'いちご',
    'ストロベリー': 'いちご',
    'strawberry': 'いちご',
    
    'ぶどう': 'ぶどう',
    'ブドウ': 'ぶどう',
    'グレープ': 'ぶどう',
    'grape': 'ぶどう',
    
    // その他
    'とうふ': '豆腐',
    '豆腐': '豆腐',
    'tofu': '豆腐',
    
    'なっとう': '納豆',
    '納豆': '納豆',
    'natto': '納豆',
    
    'わかめ': 'わかめ',
    'ワカメ': 'わかめ',
    'wakame': 'わかめ',
    
    'のり': 'のり',
    'ノリ': 'のり',
    '海苔': 'のり',
    'seaweed': 'のり'
  };

  // 同義語マップから標準形を取得
  if (synonymMap[trimmed]) {
    return synonymMap[trimmed];
  }

  // 部分マッチングでの正規化
  for (const [synonym, standard] of Object.entries(synonymMap)) {
    if (trimmed.includes(synonym) || synonym.includes(trimmed)) {
      return standard;
    }
  }

  // 正規化できない場合は元の名前を返す
  return trimmed;
};

// 食材名の類似度チェック
export const isSimilarIngredient = (name1, name2) => {
  const normalized1 = normalizeIngredientName(name1);
  const normalized2 = normalizeIngredientName(name2);
  
  // 正規化後の完全一致
  if (normalized1 === normalized2) {
    return true;
  }

  // 部分一致チェック
  if (normalized1.includes(normalized2) || normalized2.includes(normalized1)) {
    return true;
  }

  // 編集距離による類似度チェック（簡易版）
  const similarity = calculateSimilarity(normalized1, normalized2);
  return similarity > 0.8; // 80%以上の類似度
};

// 単一テキストの翻訳
export const translateSingleText = async (text) => {
  const results = await translateTexts([text]);
  return results[0];
};