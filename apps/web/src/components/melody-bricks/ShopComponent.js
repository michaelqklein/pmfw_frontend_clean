import React, { useState, useEffect } from 'react';
import { shopItems } from '@data/melodyBricks/shopData';
import { 
  getTotalBleeps, 
  purchaseItem, 
  ownsItem, 
  getPurchaseHistory,
  setActiveItem,
  getActiveItems
} from '@/src/performance/melodyBricks/levelProgressData';
import { useAuth } from '@/src/context/AuthContext';

const ShopComponent = ({ onClose, levelProgress, onUpdateLevelProgress }) => {
  const { currentUser } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState('skins');
  const [userBleeps, setUserBleeps] = useState(0);
  const [purchaseHistory, setPurchaseHistory] = useState([]);
  const [activeItems, setActiveItems] = useState({});
  const [message, setMessage] = useState('');

  // Load user data on component mount
  useEffect(() => {
    // Get bleeps and active items from level progress (regardless of login status)
    if (levelProgress) {
      const bleeps = getTotalBleeps(levelProgress);
      console.log('ShopComponent debug - levelProgress:', {
        totalBleeps: levelProgress.totalBleeps,
        bleepsFromFunction: bleeps,
        levelProgressKeys: Object.keys(levelProgress)
      });
      setUserBleeps(bleeps);
      setActiveItems(getActiveItems(levelProgress));
      setPurchaseHistory(getPurchaseHistory(levelProgress));
    }
  }, [levelProgress]);

  const categories = [
    { id: 'skins', name: 'Skins', icon: '🎨' },
    { id: 'backgrounds', name: 'Backgrounds', icon: '🖼️' }
  ];

  const getRarityColor = (rarity) => {
    switch (rarity) {
      case 'common': return 'text-gray-400';
      case 'rare': return 'text-blue-400';
      case 'epic': return 'text-purple-400';
      case 'legendary': return 'text-yellow-400';
      default: return 'text-gray-400';
    }
  };

  const getRarityBorder = (rarity) => {
    switch (rarity) {
      case 'common': return 'border-gray-400';
      case 'rare': return 'border-blue-400';
      case 'epic': return 'border-purple-400';
      case 'legendary': return 'border-yellow-400';
      default: return 'border-gray-400';
    }
  };

  const handlePurchase = (item) => {
    // For free items, allow purchase without login
    if (item.price > 0 && (!currentUser || !currentUser.user_ID)) {
      setMessage('Please log in to make purchases');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    if (!levelProgress || !onUpdateLevelProgress) {
      setMessage('Level progress data not available');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    // Purchase item using the new system
    const purchaseResult = purchaseItem(levelProgress, item.id, item.price, item);
    
    if (purchaseResult.success) {
      // Update level progress with new data
      onUpdateLevelProgress(purchaseResult.updatedProgress);
      
      // Update local state
      setUserBleeps(purchaseResult.currentBleeps);
      setPurchaseHistory(getPurchaseHistory(purchaseResult.updatedProgress));
      setActiveItems(getActiveItems(purchaseResult.updatedProgress));
      
      setMessage(purchaseResult.message);
      setTimeout(() => setMessage(''), 3000);
    } else {
      setMessage(purchaseResult.message);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleActivateItem = (item) => {
    // For free items, allow activation without login
    if (item.price > 0 && (!currentUser || !currentUser.user_ID)) {
      setMessage('Please log in to activate items');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    if (!levelProgress || !onUpdateLevelProgress) {
      setMessage('Level progress data not available');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    const result = setActiveItem(levelProgress, item.type, item.id);
    
    if (result.success) {
      // Update level progress with new data
      onUpdateLevelProgress(result.updatedProgress);
      
      // Update local state
      setActiveItems(getActiveItems(result.updatedProgress));
      
      setMessage(`${item.name} activated!`);
      setTimeout(() => setMessage(''), 3000);
    } else {
      setMessage(result.message);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const isItemOwned = (itemId) => {
    if (!levelProgress) return false;
    return ownsItem(levelProgress, itemId);
  };

  const isItemActive = (itemId, itemType) => {
    return activeItems[itemType] === itemId;
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-40" onClick={onClose}>
      <div className="bg-gray-900 border-2 border-gray-600 rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">🎮 Melody Bricks Shop</h2>
          <div className="flex items-center gap-4">
            <div className="bg-yellow-600 text-white px-3 py-1 rounded-full font-bold">
              💰 Total Bleeps: {userBleeps.toLocaleString()}
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white text-2xl font-bold"
            >
              ×
            </button>
          </div>
        </div>

        {/* Message Display */}
        {message && (
          <div className="mb-4 bg-blue-600 text-white px-4 py-2 rounded-lg text-center">
            {message}
          </div>
        )}

        {/* Category Tabs */}
        <div className="flex gap-2 mb-6">
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedCategory === category.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <span>{category.icon}</span>
              {category.name}
            </button>
          ))}
        </div>

        {/* Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {shopItems[selectedCategory].map(item => {
            const isOwned = isItemOwned(item.id);
            const canAfford = userBleeps >= item.price;
            const isActive = isItemActive(item.id, item.type);
            
            return (
              <div
                key={item.id}
                className={`bg-gray-800 border-2 rounded-lg p-4 transition-all hover:scale-105 ${
                  item.rarity ? getRarityBorder(item.rarity) : 'border-gray-600'
                } ${isOwned ? 'opacity-60' : ''} ${isActive ? 'ring-2 ring-yellow-400' : ''}`}
              >
                {/* Item Image */}
                <div className="w-full h-32 bg-gray-700 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                  {item.image ? (
                    <img 
                      src={item.image} 
                      alt={item.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div className="text-4xl" style={{ display: item.image ? 'none' : 'flex' }}>
                    🎵
                  </div>
                </div>

                {/* Item Info */}
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <h3 className="text-white font-bold">{item.name}</h3>
                    <div className="flex items-center gap-1">
                      <span className="text-yellow-400 font-bold">
                        {item.price === 0 ? 'Default' : item.price}
                      </span>
                      {item.price > 0 && <span className="text-yellow-400">💰</span>}
                    </div>
                  </div>

                  <p className="text-gray-400 text-sm">{item.description}</p>

                  {/* Rarity or Duration */}
                  {item.rarity && (
                    <div className={`text-sm font-medium ${getRarityColor(item.rarity)}`}>
                      {item.rarity.charAt(0).toUpperCase() + item.rarity.slice(1)}
                    </div>
                  )}
                  {item.duration && (
                    <div className="text-blue-400 text-sm font-medium">
                      Duration: {item.duration}
                    </div>
                  )}

                  {/* Status indicator */}
                  {isActive && (
                    <div className="text-yellow-400 text-sm font-medium">
                      ✓ Active
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="space-y-2">
                    {!isOwned ? (
                      <button
                        onClick={() => handlePurchase(item)}
                        disabled={!canAfford}
                        className={`w-full py-2 px-4 rounded-lg font-bold transition-colors ${
                          canAfford
                            ? 'bg-blue-600 hover:bg-blue-700 text-white'
                            : 'bg-red-600 text-white cursor-not-allowed'
                        }`}
                      >
                        {item.price === 0 ? 'Default' : (canAfford ? 'Purchase' : 'Not Enough Bleeps')}
                      </button>
                    ) : (
                      <>
                        {item.type !== 'powerup' && (
                          <button
                            onClick={() => handleActivateItem(item)}
                            disabled={isActive}
                            className={`w-full py-2 px-4 rounded-lg font-bold transition-colors ${
                              isActive
                                ? 'bg-green-600 text-white cursor-not-allowed'
                                : 'bg-purple-600 hover:bg-purple-700 text-white'
                            }`}
                          >
                            {isActive ? '✓ Active' : 'Activate'}
                          </button>
                        )}
                        {item.type === 'powerup' && (
                          <button
                            onClick={() => handlePurchase(item)}
                            disabled={!canAfford}
                            className={`w-full py-2 px-4 rounded-lg font-bold transition-colors ${
                              canAfford
                                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                : 'bg-red-600 text-white cursor-not-allowed'
                            }`}
                          >
                            {canAfford ? 'Buy Again' : 'Not Enough Bleeps'}
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Purchase History */}
        {purchaseHistory.length > 0 && (
          <div className="mt-8 pt-6 border-t border-gray-600">
            <h3 className="text-xl font-bold text-white mb-4">Recent Purchases</h3>
            <div className="space-y-2">
              {purchaseHistory.slice(-5).reverse().map((purchase, index) => {
                console.log('Purchase item:', purchase);
                const purchaseDate = purchase.purchaseDate instanceof Date ? purchase.purchaseDate : new Date(purchase.purchaseDate);
                return (
                  <div key={index} className="flex justify-between items-center bg-gray-800 p-3 rounded-lg">
                    <span className="text-white">{purchase.name}</span>
                    <span className="text-gray-400 text-sm">
                      {purchaseDate.toLocaleDateString()}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShopComponent; 