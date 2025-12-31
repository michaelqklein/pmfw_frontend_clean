// Shop data management utilities

// Default shop items configuration
export const shopItems = {
  skins: [
    {
      id: 'musician',
      name: 'Musician',
      description: 'Default musician skin for your avatar',
      price: 0,
      image: '/images/musician-avatar.png',
      rarity: 'common',
      type: 'skin'
    },
    {
      id: 'the_busker',
      name: 'The Busker',
      description: 'Street musician skin for your avatar',
      price: 35,
      image: '/images/the-busker.png',
      rarity: 'common',
      type: 'skin'
    },
    {
      id: 'pop_queen',
      name: 'Pop Queen',
      description: 'Glamorous pop queen skin for your avatar',
      price: 100,
      image: '/images/pop-queen.png',
      rarity: 'common',
      type: 'skin'
    },
    {
      id: 'jazz_legend',
      name: 'Jazz Legend',
      description: 'Classic jazz legend skin for your avatar',
      price: 1000,
      image: '/images/jazz-legend.png',
      rarity: 'epic',
      type: 'skin'
    }
  ],
  powerups: [
    {
      id: 'remove_brick',
      name: 'Double Points',
      description: 'Earn double points for 3 games',
      price: 300,
      image: '/images/powerups/double_points.png',
      duration: '3 games',
      type: 'powerup'
    },
    {
      id: 'wait',
      name: 'Time Extension',
      description: 'Add 30 seconds to your game time',
      price: 200,
      image: '/images/powerups/time_extension.png',
      duration: '1 game',
      type: 'powerup'
    }
  ],
  backgrounds: [
    {
      id: 'default',
      name: 'Melody Bricks',
      description: 'Default Melody Bricks background',
      price: 0,
      image: '/images/MelodyBricks.jpeg',
      rarity: 'common',
      type: 'background'
    },
    {
      id: 'london',
      name: 'London',
      description: 'Iconic London cityscape for your game background',
      price: 100,
      image: '/images/London.png',
      rarity: 'common',
      type: 'background'
    },
    {
      id: 'paris',
      name: 'Paris',
      description: 'Beautiful Paris cityscape for your game background',
      price: 200,
      image: '/images/Paris.png',
      rarity: 'common',
      type: 'background'
    }
  ]
};

// Create initial shop data for a new user
export const createInitialShopData = () => ({
  currency: 1000,
  purchases: [],
  activeSkin: 'default',
  activeBackground: 'default',
  activePowerups: []
});

// Load shop data from localStorage
export const loadShopData = (userId) => {
  try {
    const key = `melodyBricks_shop_${userId}`;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : createInitialShopData();
  } catch (error) {
    console.error('Error loading shop data:', error);
    return createInitialShopData();
  }
};

// Save shop data to localStorage
export const saveShopData = (userId, shopData) => {
  try {
    const key = `melodyBricks_shop_${userId}`;
    localStorage.setItem(key, JSON.stringify(shopData));
  } catch (error) {
    console.error('Error saving shop data:', error);
  }
};

// Purchase an item
export const purchaseItem = (userId, itemId, itemPrice) => {
  const shopData = loadShopData(userId);
  
  if (shopData.currency < itemPrice) {
    return { success: false, message: 'Not enough currency' };
  }
  
  // Check if item is already owned (for permanent items)
  const item = findItemById(itemId);
  if (item && item.type !== 'powerup' && shopData.purchases.some(p => p.id === itemId)) {
    return { success: false, message: 'Item already owned' };
  }
  
  // Deduct currency
  shopData.currency -= itemPrice;
  
  // Add to purchases
  shopData.purchases.push({
    id: itemId,
    purchaseDate: new Date().toISOString(),
    price: itemPrice
  });
  
  // Save updated data
  saveShopData(userId, shopData);
  
  return { success: true, message: 'Purchase successful' };
};

// Add currency (for completing levels, achievements, etc.)
export const addCurrency = (userId, amount) => {
  const shopData = loadShopData(userId);
  shopData.currency += amount;
  saveShopData(userId, shopData);
  return shopData.currency;
};

// Check if user owns an item
export const ownsItem = (userId, itemId) => {
  const shopData = loadShopData(userId);
  return shopData.purchases.some(p => p.id === itemId);
};

// Set active skin/background
export const setActiveItem = (userId, itemType, itemId) => {
  const shopData = loadShopData(userId);
  
  // Verify user owns the item
  if (!ownsItem(userId, itemId)) {
    return { success: false, message: 'Item not owned' };
  }
  
  switch (itemType) {
    case 'skin':
      shopData.activeSkin = itemId;
      break;
    case 'background':
      shopData.activeBackground = itemId;
      break;
    default:
      return { success: false, message: 'Invalid item type' };
  }
  
  saveShopData(userId, shopData);
  return { success: true, message: 'Item activated' };
};

// Get active items
export const getActiveItems = (userId) => {
  const shopData = loadShopData(userId);
  return {
    skin: shopData.activeSkin,
    background: shopData.activeBackground,
    powerups: shopData.activePowerups
  };
};

// Find item by ID across all categories
export const findItemById = (itemId) => {
  for (const category of Object.values(shopItems)) {
    const item = category.find(item => item.id === itemId);
    if (item) return item;
  }
  return null;
};

// Get all items by category
export const getItemsByCategory = (category) => {
  return shopItems[category] || [];
};

// Get user's purchase history
export const getPurchaseHistory = (userId) => {
  const shopData = loadShopData(userId);
  return shopData.purchases.map(purchase => {
    const item = findItemById(purchase.id);
    return {
      ...purchase,
      item: item
    };
  });
}; 