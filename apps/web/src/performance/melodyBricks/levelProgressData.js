import levelsData from '@data/melodyBricks/levels.json';

export function createLevelProgressData(existingProgress = null) {
  const levelProgress = {};
  

  
  // Initialize data for each level from the levels.json
  levelsData.levels.forEach(level => {
    levelProgress[level.id] = {
      unlocked: level.requires.length === 0 || level.isShop, // Unlock levels with no requirements or shops initially
      completed: false, // Whether the level has been completed
      highestScore: 0,
      lastScore: 0,
      bleepsEarned: 0, // Bleeps earned from this level (will be transferred to global balance)
      currentNode: false, // Only one level can be current at a time
      completionDate: null, // When the level was first completed
      attempts: 0, // Number of times the level has been attempted
      bestTime: null, // Best completion time in milliseconds
      lastPlayedDate: null // When the level was last played
    };
  });

  // Preserve existing totalBleeps if they exist, otherwise start with 0
  // This prevents bleeps from being reset when level progress data is recreated
  const existingBleeps = existingProgress && typeof existingProgress.totalBleeps === 'number' ? existingProgress.totalBleeps : 0;
  levelProgress.totalBleeps = existingBleeps;

  // Initialize inventory as empty array
  levelProgress.inventory = [];

  // Initialize active items with defaults
  levelProgress.activeItems = {
    skin: 'musician',
    background: 'default',
    powerups: []
  };



  // Set the first level as the default current node if no level is current
  const firstLevelId = Object.keys(levelProgress).find(id => id !== 'totalBleeps' && id !== 'inventory' && id !== 'activeItems');
  if (firstLevelId && levelProgress[firstLevelId]) {
    levelProgress[firstLevelId].currentNode = true;
  }

  return levelProgress;
}

// New function to sync and validate progress data with current levels.json
export function syncLevelProgressWithDefinitions(loadedProgressData) {
  if (!loadedProgressData) {
    console.log('🔄 No progress data to sync, creating fresh data');
    return createLevelProgressData();
  }

  console.log('🔄 Syncing level progress data with current level definitions...');
  
  // Start with the loaded data as base
  const syncedProgress = { ...loadedProgressData };
  
  // Preserve non-level properties
  const totalBleeps = syncedProgress.totalBleeps || 0;
  const inventory = syncedProgress.inventory || [];
  const activeItems = syncedProgress.activeItems || {
    skin: 'musician',
    background: 'default',
    powerups: []
  };

  // Get all level IDs from current levels.json
  const currentLevelIds = levelsData.levels.map(level => level.id);
  const existingLevelIds = Object.keys(syncedProgress).filter(
    id => id !== 'totalBleeps' && id !== 'inventory' && id !== 'activeItems'
  );

  // Find missing levels (levels in levels.json but not in progress data)
  const missingLevelIds = currentLevelIds.filter(id => !existingLevelIds.includes(id));
  
  // Find obsolete levels (levels in progress data but not in current levels.json)
  const obsoleteLevelIds = existingLevelIds.filter(id => !currentLevelIds.includes(id));

  console.log(`🔄 Found ${missingLevelIds.length} missing levels:`, missingLevelIds);
  console.log(`🔄 Found ${obsoleteLevelIds.length} obsolete levels:`, obsoleteLevelIds);

  // Remove obsolete levels
  obsoleteLevelIds.forEach(levelId => {
    delete syncedProgress[levelId];
    console.log(`🗑️ Removed obsolete level: ${levelId}`);
  });

  // Add missing levels with default data
  missingLevelIds.forEach(levelId => {
    const levelDef = levelsData.levels.find(l => l.id === levelId);
    if (levelDef) {
      syncedProgress[levelId] = {
        unlocked: levelDef.requires.length === 0 || levelDef.isShop,
        completed: false,
        highestScore: 0,
        lastScore: 0,
        bleepsEarned: 0,
        currentNode: false,
        completionDate: null,
        attempts: 0,
        bestTime: null,
        lastPlayedDate: null
      };
      console.log(`➕ Added missing level: ${levelId} (initially ${syncedProgress[levelId].unlocked ? 'unlocked' : 'locked'})`);
    }
  });

  // Restore non-level properties
  syncedProgress.totalBleeps = totalBleeps;
  syncedProgress.inventory = inventory;
  syncedProgress.activeItems = activeItems;

  // Re-evaluate all unlock conditions based on current level requirements
  console.log('🔄 Re-evaluating unlock conditions for all levels...');
  
  levelsData.levels.forEach(level => {
    const levelData = syncedProgress[level.id];
    if (!levelData) return;

    // Skip if already unlocked or is a shop
    if (levelData.unlocked || level.isShop) return;

    // Check if all required levels are completed
    const allRequirementsMet = level.requires.every(requiredLevelId => {
      const requiredLevel = syncedProgress[requiredLevelId];
      return requiredLevel && requiredLevel.completed;
    });

    if (allRequirementsMet) {
      syncedProgress[level.id] = {
        ...syncedProgress[level.id],
        unlocked: true
      };
      console.log(`🔓 Unlocked level: ${level.id} (requirements met: ${level.requires.join(', ')})`);
    } else {
      console.log(`🔒 Level ${level.id} remains locked (requires: ${level.requires.join(', ')})`);
    }
  });

  // Ensure at least one level is set as current if none is set
  const hasCurrentLevel = Object.keys(syncedProgress).some(id => 
    id !== 'totalBleeps' && id !== 'inventory' && id !== 'activeItems' && 
    syncedProgress[id].currentNode
  );

  if (!hasCurrentLevel) {
    const firstUnlockedLevel = Object.keys(syncedProgress).find(id => 
      id !== 'totalBleeps' && id !== 'inventory' && id !== 'activeItems' && 
      syncedProgress[id].unlocked
    );
    
    if (firstUnlockedLevel) {
      syncedProgress[firstUnlockedLevel].currentNode = true;
      console.log(`🎯 Set ${firstUnlockedLevel} as current level`);
    }
  }

  console.log('✅ Level progress data sync completed');
  return syncedProgress;
}

export function updateLevelProgress(progressData, levelId, scoreData) {
  if (!progressData[levelId]) {
    console.warn(`Level ${levelId} not found in progress data`);
    return progressData;
  }



  const updatedProgress = { ...progressData };
  
  // Ensure totalBleeps is always a number
  if (typeof updatedProgress.totalBleeps !== 'number') {
    updatedProgress.totalBleeps = 0;
  }
  
  const levelData = { ...updatedProgress[levelId] };

  // Update scores and attempt count
  levelData.lastScore = scoreData.score || 0;
  levelData.attempts += 1;
  levelData.lastPlayedDate = new Date().toISOString();

  // Update highest score if this is better
  if (scoreData.score > levelData.highestScore) {
    levelData.highestScore = scoreData.score;
  }

  // Transfer bleeps earned to global balance and reset level bleeps
  if (scoreData.bleepsEarned !== undefined) {
    // Add to global bleeps balance
    updatedProgress.totalBleeps += scoreData.bleepsEarned;
    // Reset level bleeps earned (they're now in global balance)
    levelData.bleepsEarned = 0;
  }

  // Update best time if provided and better
  if (scoreData.time && (!levelData.bestTime || scoreData.time < levelData.bestTime)) {
    levelData.bestTime = scoreData.time;
  }

  // Mark as completed if this is the first time completing
  if (scoreData.completed && !levelData.completed) {
    levelData.completed = true;
    levelData.completionDate = new Date().toISOString();
  }

  updatedProgress[levelId] = levelData;



  // Check if any new levels should be unlocked
  return unlockEligibleLevels(updatedProgress, levelId, scoreData.completed);
}

function unlockEligibleLevels(progressData, completedLevelId, wasCompleted) {
  if (!wasCompleted) return progressData;



  const updatedProgress = { ...progressData };

  // Find levels that should be unlocked based on the completed level
  levelsData.levels.forEach(level => {
    // Skip if already unlocked
    if (updatedProgress[level.id].unlocked) return;

    // Check if all required levels are completed
    const allRequirementsMet = level.requires.every(requiredLevelId => {
      const requiredLevel = updatedProgress[requiredLevelId];
      return requiredLevel && requiredLevel.completed;
    });

    if (allRequirementsMet) {
      updatedProgress[level.id] = {
        ...updatedProgress[level.id],
        unlocked: true
      };
    }
  });



  return updatedProgress;
}

export function setCurrentLevel(progressData, levelId) {
  const updatedProgress = { ...progressData };

  // Clear current node from all levels (but not from non-level properties)
  Object.keys(updatedProgress).forEach(id => {
    // Skip non-level properties
    if (id === 'totalBleeps' || id === 'inventory' || id === 'activeItems') {
      return;
    }
    
    updatedProgress[id] = {
      ...updatedProgress[id],
      currentNode: false
    };
  });

  // Set the specified level as current
  if (updatedProgress[levelId] && updatedProgress[levelId].unlocked) {
    updatedProgress[levelId] = {
      ...updatedProgress[levelId],
      currentNode: true
    };
  }

  return updatedProgress;
}

export function getLevelStats(progressData, levelId) {
  const levelData = progressData[levelId];
  if (!levelData) return null;

  return {
    unlocked: levelData.unlocked,
    completed: levelData.completed,
    highestScore: levelData.highestScore,
    lastScore: levelData.lastScore,
    attempts: levelData.attempts,
    bestTime: levelData.bestTime,
    lastPlayed: levelData.lastPlayedDate
  };
}

export function getUnlockedLevels(progressData) {
  return Object.keys(progressData).filter(levelId => progressData[levelId].unlocked);
}

export function getCurrentLevel(progressData) {
  const currentLevelEntry = Object.entries(progressData).find(
    ([levelId, data]) => data.currentNode
  );
  return currentLevelEntry ? currentLevelEntry[0] : null;
}

export function getOverallProgress(progressData) {
  // Filter for active levels only (where active !== false)
  const activeLevelIds = levelsData.levels
    .filter(level => level.active !== false)
    .map(level => level.id);
  
  const totalLevels = activeLevelIds.length;
  const unlockedLevels = activeLevelIds.filter(levelId => 
    progressData[levelId] && progressData[levelId].unlocked
  ).length;
  const completedLevels = activeLevelIds.filter(levelId => 
    progressData[levelId] && progressData[levelId].completed
  ).length;

  return {
    totalLevels,
    unlockedLevels,
    completedLevels,
    progressPercentage: Math.round((completedLevels / totalLevels) * 100)
  };
}

export function getTotalBleeps(progressData) {
  // Return the global bleeps balance, ensuring it's always a number
  const totalBleeps = progressData.totalBleeps;
  if (typeof totalBleeps === 'number') {
    return totalBleeps;
  }
  return 0;
}

// Check if there's any meaningful progress data (levels completed, bleeps earned, etc.)
export function hasProgressData(progressData) {
  if (!progressData) return false;
  
  // Check if user has earned any bleeps
  const totalBleeps = getTotalBleeps(progressData);
  if (totalBleeps > 0) return true;
  
  // Check if any levels have been completed
  const levelIds = Object.keys(progressData).filter(
    id => id !== 'totalBleeps' && id !== 'inventory' && id !== 'activeItems'
  );
  
  for (const levelId of levelIds) {
    const levelData = progressData[levelId];
    if (levelData && (levelData.completed || levelData.attempts > 0 || levelData.highestScore > 0)) {
      return true;
    }
  }
  
  // Check if user has any inventory items (beyond defaults)
  const inventory = progressData.inventory || [];
  const nonDefaultItems = inventory.filter(item => 
    item.id !== 'musician' && item.id !== 'default'
  );
  if (nonDefaultItems.length > 0) return true;
  
  return false;
}

// Spend bleeps from the global balance
export function spendBleeps(progressData, amount) {
  const updatedProgress = { ...progressData };
  const currentBleeps = updatedProgress.totalBleeps || 0;
  
  if (currentBleeps < amount) {
    return { success: false, message: 'Not enough bleeps', currentBleeps };
  }
  
  updatedProgress.totalBleeps = currentBleeps - amount;
  return { success: true, message: 'Bleeps spent successfully', currentBleeps: updatedProgress.totalBleeps };
}

// Add bleeps to the global balance
export function addBleeps(progressData, amount) {
  const updatedProgress = { ...progressData };
  updatedProgress.totalBleeps = (updatedProgress.totalBleeps || 0) + amount;
  return updatedProgress;
}

// Inventory management functions

// Check if user owns an item
export function ownsItem(progressData, itemId) {
  // Default items are always owned
  if (itemId === 'musician' || itemId === 'default') {
    return true;
  }
  
  const inventory = progressData.inventory || [];
  return inventory.some(item => item.id === itemId);
}

// Purchase an item (spend bleeps and add to inventory)
export function purchaseItem(progressData, itemId, itemPrice, itemData) {
  const updatedProgress = { ...progressData };
  
  // Check if item is already owned (for permanent items)
  if (itemData.type !== 'powerup' && ownsItem(updatedProgress, itemId)) {
    return { success: false, message: 'Item already owned' };
  }
  
  // For free items (price 0), skip bleeps check and spending
  if (itemPrice > 0) {
    // Check if user has enough bleeps
    const currentBleeps = updatedProgress.totalBleeps || 0;
    if (currentBleeps < itemPrice) {
      return { success: false, message: 'Not enough bleeps', currentBleeps };
    }
    
    // Spend bleeps
    const spendResult = spendBleeps(updatedProgress, itemPrice);
    if (!spendResult.success) {
      return spendResult;
    }
    
    // Update total bleeps
    updatedProgress.totalBleeps = spendResult.currentBleeps;
  }
  
  // Add to inventory
  const inventory = updatedProgress.inventory || [];
  inventory.push({
    id: itemId,
    purchaseDate: new Date().toISOString(),
    price: itemPrice,
    type: itemData.type,
    name: itemData.name
  });
  updatedProgress.inventory = inventory;
  
  return { 
    success: true, 
    message: itemPrice === 0 ? 'Default skin activated!' : 'Purchase successful', 
    currentBleeps: updatedProgress.totalBleeps,
    updatedProgress 
  };
}

// Set active item (skin, background, etc.)
export function setActiveItem(progressData, itemType, itemId) {
  const updatedProgress = { ...progressData };
  
  // Verify user owns the item
  if (!ownsItem(updatedProgress, itemId)) {
    return { success: false, message: 'Item not owned' };
  }
  
  switch (itemType) {
    case 'skin':
      updatedProgress.activeItems.skin = itemId;
      break;
    case 'background':
      updatedProgress.activeItems.background = itemId;
      break;
    default:
      return { success: false, message: 'Invalid item type' };
  }
  
  return { success: true, message: 'Item activated', updatedProgress };
}

// Get active items
export function getActiveItems(progressData) {
  const activeItems = progressData.activeItems || {
    skin: 'musician',
    background: 'default',
    powerups: []
  };
  
  // Ensure the default skin is 'musician' (for backward compatibility)
  if (activeItems.skin === 'default') {
    activeItems.skin = 'musician';
  }
  
  return activeItems;
}

// Get user's inventory
export function getInventory(progressData) {
  return progressData.inventory || [];
}

// Get purchase history (formatted for display)
export function getPurchaseHistory(progressData) {
  const inventory = getInventory(progressData);
  return inventory.map(item => ({
    ...item,
    purchaseDate: new Date(item.purchaseDate)
  }));
} 

// Utility function to manually sync progress data (useful for debugging)
export function syncCurrentUserProgress() {
  // This function can be called from browser console to manually sync progress data
  if (typeof window === 'undefined') {
    console.error('❌ This function can only be called in the browser');
    return;
  }

  const currentProgressStr = localStorage.getItem('temporaryLevelProgressData');
  if (!currentProgressStr) {
    console.log('ℹ️ No temporary progress data found in localStorage');
    return;
  }

  try {
    const temporaryData = JSON.parse(currentProgressStr);
    if (Date.now() > temporaryData.expires) {
      console.log('⏰ Temporary progress data has expired');
      return;
    }

    const syncedData = syncLevelProgressWithDefinitions(temporaryData.level_progress_data);
    console.log('✅ Progress data synced successfully');
    console.log('📊 Synced progress:', syncedData);
    
    // Save back to localStorage
    temporaryData.level_progress_data = syncedData;
    temporaryData.timestamp = Date.now();
    localStorage.setItem('temporaryLevelProgressData', JSON.stringify(temporaryData));
    
    console.log('💾 Updated progress data saved to localStorage');
    return syncedData;
  } catch (error) {
    console.error('❌ Error syncing progress data:', error);
  }
}

// Debug function to show current level unlock status
export function debugLevelUnlocks(progressData) {
  if (!progressData) {
    console.log('❌ No progress data provided');
    return;
  }

  console.log('🔍 Level Unlock Status Debug Report:');
  console.log('=====================================');
  
  levelsData.levels.forEach(level => {
    const levelData = progressData[level.id];
    if (!levelData) {
      console.log(`❓ ${level.id}: NOT FOUND IN PROGRESS DATA`);
      return;
    }

    const status = levelData.unlocked ? '🔓 UNLOCKED' : '🔒 LOCKED';
    const completion = levelData.completed ? '✅ COMPLETED' : '❌ NOT COMPLETED';
    
    console.log(`${status} ${level.id}: ${level.name}`);
    console.log(`   ${completion}`);
    
    if (level.requires.length > 0) {
      console.log(`   Requirements: ${level.requires.join(', ')}`);
      
      level.requires.forEach(reqId => {
        const reqLevel = progressData[reqId];
        if (reqLevel) {
          const reqStatus = reqLevel.completed ? '✅' : '❌';
          console.log(`     ${reqStatus} ${reqId}: ${reqLevel.completed ? 'completed' : 'not completed'}`);
        } else {
          console.log(`     ❓ ${reqId}: NOT FOUND`);
        }
      });
      
      const allMet = level.requires.every(reqId => {
        const req = progressData[reqId];
        return req && req.completed;
      });
      
      if (!levelData.unlocked && allMet) {
        console.log(`   ⚠️  WARNING: All requirements met but level is still locked!`);
      }
    }
    
    console.log('');
  });
  
  console.log('=====================================');
} 