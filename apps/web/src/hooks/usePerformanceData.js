import { useAuth } from '@/src/context/AuthContext';
import { getCurrentPerformanceData, updatePerformanceData, resetPerformanceData, getAndClearTemporaryPerformanceData } from '@/src/engines/audiationStudio';
import { useState } from 'react';

export const usePerformanceData = () => {
  const { currentUser } = useAuth();
  const [hasHandledTemporaryData, setHasHandledTemporaryData] = useState(false);

  // Save performance data to backend
  const savePerformanceData = async () => {
    if (!currentUser || !currentUser.user_ID) {
      console.log('User not logged in, skipping performance data save');
      return;
    }

    try {
      // Always save the current performance data (no need to check localStorage here)
      const dataToSave = getCurrentPerformanceData();
      
      const payload = {
        user_ID: currentUser.user_ID,
        performance_data: dataToSave
      };

      console.log('Saving performance data:', payload);

      const response = await fetch('/api/save-performance-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Performance data saved successfully:', result);
        return result;
      } else {
        console.error('Failed to save performance data:', response.status, response.statusText);
        throw new Error(`Failed to save: ${response.status}`);
      }
    } catch (error) {
      console.error('Error saving performance data:', error);
      throw error;
    }
  };

  // Load performance data from backend
  const loadPerformanceData = async () => {
    if (!currentUser || !currentUser.user_ID) {
      console.log('⚠️ usePerformanceData: User not logged in, using default performance data');
      resetPerformanceData();
      return;
    }

    try {
      console.log('🔄 usePerformanceData: Loading performance data for user:', currentUser.user_ID);

      const response = await fetch(`/api/get-performance-data/${currentUser.user_ID}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        const result = await response.json();
        console.log('📥 usePerformanceData: Performance data loaded successfully:', result);
        
        if (result.performance_data) {
          // Existing user: use database data only
          console.log('👤 usePerformanceData: Existing user - using database data');
          updatePerformanceData(result.performance_data);
        } else if (!hasHandledTemporaryData) {
          // New user: check for temporary data from localStorage only if we haven't handled it yet
          console.log('🆕 usePerformanceData: New user detected - checking for localStorage data');
          const temporaryData = getAndClearTemporaryPerformanceData();
          if (temporaryData) {
            console.log('💾 usePerformanceData: Found temporary localStorage data, using it:', temporaryData);
            updatePerformanceData(temporaryData);
            setHasHandledTemporaryData(true);
            
            // Save the temporary data to backend immediately
            console.log('💾 usePerformanceData: Saving temporary data to backend...');
            await savePerformanceData();
          } else {
            console.log('🔄 usePerformanceData: No temporary data found, using defaults');
            resetPerformanceData();
          }
        } else {
          console.log('🔄 usePerformanceData: Already handled temporary data, using defaults');
          resetPerformanceData();
        }
        return result;
      } else if (response.status === 404 && !hasHandledTemporaryData) {
        // 404 is expected for new users who don't have performance data yet
        console.log('📭 usePerformanceData: No performance data found in database (new user) - checking for temporary data');
        const temporaryData = getAndClearTemporaryPerformanceData();
        if (temporaryData) {
          console.log('💾 usePerformanceData: Found temporary localStorage data, using it:', temporaryData);
          updatePerformanceData(temporaryData);
          setHasHandledTemporaryData(true);
          
          // Save the temporary data to backend immediately
          console.log('💾 usePerformanceData: Saving temporary data to backend...');
          await savePerformanceData();
        } else {
          console.log('🔄 usePerformanceData: No temporary data found, using defaults');
          resetPerformanceData();
        }
        return null; // Return null for 404, don't throw
      } else {
        // Other errors (500, etc.) - still try to use temporary data if available
        console.error('Failed to load performance data:', response.status, response.statusText);
        
        if (!hasHandledTemporaryData) {
          const temporaryData = getAndClearTemporaryPerformanceData();
          if (temporaryData) {
            console.log('Backend failed but found temporary data, using that');
            updatePerformanceData(temporaryData);
            setHasHandledTemporaryData(true);
          } else {
            resetPerformanceData();
          }
        } else {
          resetPerformanceData();
        }
        // Only throw for non-404 errors
        throw new Error(`Failed to load: ${response.status}`);
      }
    } catch (error) {
      // Only log and re-throw if it's not a network error that we've already handled
      if (error.message && error.message.includes('Failed to load: 404')) {
        // Don't re-throw 404 errors
        return null;
      }
      
      console.error('Error loading performance data:', error);
      
      // Even if there's an error, check for temporary data
      if (!hasHandledTemporaryData) {
        const temporaryData = getAndClearTemporaryPerformanceData();
        if (temporaryData) {
          console.log('Error occurred but found temporary data, using that');
          updatePerformanceData(temporaryData);
          setHasHandledTemporaryData(true);
        } else {
          resetPerformanceData();
        }
      } else {
        resetPerformanceData();
      }
      throw error;
    }
  };

  return {
    savePerformanceData,
    loadPerformanceData,
    currentUser
  };
}; 