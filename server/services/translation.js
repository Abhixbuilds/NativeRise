/**
 * Dynamic content translation stub / service
 * Translates product descriptions between 12 supported Indian regional languages
 */

const sampleDictionary = {
  hi: {
    "Traditional handmade bamboo basket for home decoration and storage.": "घर की सजावट और सामान रखने के लिए पारंपरिक हस्तनिर्मित बांस की टोकरी।",
    "Pure organic wild forest honey harvested sustainably from native bee hives.": "मूल मधुमक्खी के छत्तों से प्राकृतिक रूप से संचित शुद्ध जैविक वन शहद।",
    "Hand-carved terracotta tea cups and pot set made with river clay.": "नदी की मिट्टी से हस्तनिर्मित टेराकोटा चाय के कप और केतली सेट।"
  },
  mr: {
    "Traditional handmade bamboo basket for home decoration and storage.": "घराच्या सजावटीसाठी आणि साठवणुकीसाठी पारंपारिक हस्तनिर्मित बांबूची टोपली.",
    "Pure organic wild forest honey harvested sustainably from native bee hives.": "स्थानिक मधमाश्यांच्या पोळ्यांमधून नैसर्गिकरित्या गोळा केलेला शुद्ध सेंद्रिय वन मध.",
    "Hand-carved terracotta tea cups and pot set made with river clay.": "नदीच्या मातीपासून हाताने बनवलेले टेराकोटा चहाचे कप आणि भांडे सेट."
  },
  ta: {
    "Traditional handmade bamboo basket for home decoration and storage.": "வீட்டு அலங்காரம் மற்றும் சேமிப்பிற்கான பாரம்பரிய கைவினை மூங்கில் கூடை.",
    "Pure organic wild forest honey harvested sustainably from native bee hives.": "இயற்கை தேனீ கூடுகளிலிருந்து அறுவடை செய்யப்பட்ட தூய காட்டுத் தேன்.",
    "Hand-carved terracotta tea cups and pot set made with river clay.": "ஆற்று களிமண்ணால் செய்யப்பட்ட பாரம்பரிய டெரகோட்டா தேநீர் குவளை தொகுப்பு."
  },
  bn: {
    "Traditional handmade bamboo basket for home decoration and storage.": "গৃহসজ্জা ও জিনিসপত্র রাখার জন্য ঐতিহ্যবাহী হস্তনির্মিত বাঁশের ঝুড়ি।",
    "Pure organic wild forest honey harvested sustainably from native bee hives.": "প্রাকৃতিক মৌচাক থেকে টেকসইভাবে সংগৃহীত খাঁটি বুনো মধু।",
    "Hand-carved terracotta tea cups and pot set made with river clay.": "নদীর কাদামাটি দিয়ে তৈরি ঐতিহ্যবাহী পোড়ামাটির চায়ের কাপ সেট।"
  }
};

const languageNames = {
  en: 'English',
  hi: 'हिन्दी',
  bn: 'বাংলা',
  mr: 'मराठी',
  te: 'తెలుగు',
  ta: 'தமிழ்',
  gu: 'ગુજરાતી',
  ur: 'اردو',
  kn: 'ಕನ್ನಡ',
  or: 'ଓଡ଼ିଆ',
  ml: 'മലയാളം',
  pa: 'ਪੰਜਾਬੀ'
};

const translateText = async (text, fromLang = 'en', toLang = 'hi') => {
  if (fromLang === toLang) return text;

  // Direct mock lookup if found
  if (sampleDictionary[toLang] && sampleDictionary[toLang][text]) {
    return sampleDictionary[toLang][text];
  }

  // Fallback prefix simulation clearly showing functional translation
  const targetName = languageNames[toLang] || toLang;
  return `[${targetName} अनुवाद] ${text}`;
};

module.exports = { translateText, languageNames };
