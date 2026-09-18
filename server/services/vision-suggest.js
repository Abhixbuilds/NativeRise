/**
 * Vision-AI Snap & Sell suggestion stub
 * Suggests product name, category, and price range based on uploaded images
 */
const suggestProductDetailsFromImage = (imageUrls = [], fallbackCategory = 'Handicrafts') => {
  const suggestionsByCategory = {
    'Handicrafts': {
      suggestedName: 'Handmade Bamboo Artisan Basket',
      suggestedCategory: 'Handicrafts',
      suggestedPriceRange: { min: 450, max: 650 },
      suggestedDescription: 'Skillfully handwoven storage basket created from locally sourced bamboo splints by native artisans.',
      suggestedWeightGrams: 800
    },
    'Food': {
      suggestedName: 'Organic Wild Honey (Pure & Raw)',
      suggestedCategory: 'Food',
      suggestedPriceRange: { min: 380, max: 550 },
      suggestedDescription: 'Naturally sourced wild forest raw honey without artificial preservatives or processing.',
      suggestedWeightGrams: 500
    },
    'Agriculture': {
      suggestedName: 'Stone-Ground Turmeric Powder',
      suggestedCategory: 'Agriculture',
      suggestedPriceRange: { min: 180, max: 280 },
      suggestedDescription: 'Traditional stone-milled organic turmeric with high natural curcumin content.',
      suggestedWeightGrams: 400
    },
    'Clothing': {
      suggestedName: 'Handloom Pure Khadi Cotton Kurta',
      suggestedCategory: 'Clothing',
      suggestedPriceRange: { min: 850, max: 1400 },
      suggestedDescription: 'Breathable, hand-spun authentic Khadi fabric with traditional stitching details.',
      suggestedWeightGrams: 350
    }
  };

  return suggestionsByCategory[fallbackCategory] || suggestionsByCategory['Handicrafts'];
};

module.exports = { suggestProductDetailsFromImage };
