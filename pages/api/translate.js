// pages/api/translate.js
// Google Translate APIエンドポイント

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { text, targetLang = 'en', sourceLang = 'ja' } = req.body;

  if (!text) {
    return res.status(400).json({ message: 'Text is required' });
  }

  if (!process.env.GOOGLE_TRANSLATE_API_KEY) {
    return res.status(500).json({ 
      message: 'Google Translate API key not configured',
      fallback: true 
    });
  }

  try {
    // Google Translate API v2を使用
    const url = `https://translation.googleapis.com/language/translate/v2?key=${process.env.GOOGLE_TRANSLATE_API_KEY}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: text,
        source: sourceLang,
        target: targetLang,
        format: 'text'
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Google Translate API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    
    if (!data.data || !data.data.translations || data.data.translations.length === 0) {
      throw new Error('No translation data received');
    }

    const translatedText = data.data.translations[0].translatedText;

    res.status(200).json({
      success: true,
      originalText: text,
      translatedText: translatedText,
      sourceLang: sourceLang,
      targetLang: targetLang
    });

  } catch (error) {
    console.error('Translation API error:', error);
    
    res.status(500).json({
      success: false,
      message: 'Translation failed',
      error: error.message,
      originalText: text,
      fallback: true
    });
  }
}