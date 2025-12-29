import { useAuth } from '@/src/context/AuthContext';

export const useMBLevelPerformanceData = () => {
  const { currentUser } = useAuth();

  const saveLevelPerformanceData = async (levelProgressData) => {
    if (!currentUser || !currentUser.user_ID) {
      console.log('No user logged in, cannot save level performance data');
      return;
    }

    try {
      const response = await fetch('/api/save-mb-level-performance-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_ID: currentUser.user_ID,
          performance_data: levelProgressData
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        console.log('✅ Level performance data saved successfully');
      } else {
        console.error('❌ Failed to save level performance data:', data.message);
      }
    } catch (error) {
      console.error('❌ Error saving level performance data:', error);
    }
  };

  const loadLevelPerformanceData = async () => {
    if (!currentUser || !currentUser.user_ID) {
      console.log('No user logged in, cannot load level performance data');
      return null;
    }

    try {
      const response = await fetch(`/api/get-mb-level-performance-data/${currentUser.user_ID}`);
      const data = await response.json();
      
      if (data.success) {
        console.log('✅ Level performance data loaded successfully');
        return data.performance_data;
      } else {
        console.log('ℹ️ No level performance data found for user');
        return null;
      }
    } catch (error) {
      console.error('❌ Error loading level performance data:', error);
      return null;
    }
  };

  return {
    saveLevelPerformanceData,
    loadLevelPerformanceData
  };
}; 