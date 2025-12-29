import React, { useRef, useEffect, useState, useImperativeHandle, forwardRef } from "react";
import { useRouter } from 'next/navigation';
import levelsData from '@data/melodyBricks/levels.json';
import { getCurrentLevel, getLevelStats, getOverallProgress, getTotalBleeps, getActiveItems } from '@/src/performance/melodyBricks/levelProgressData';
import { checkAccess } from '@/src/utils/checkAccess';
import { useAuth } from '@/src/context/AuthContext';
import { useProduct } from '@/src/context/ProductContext';
import MelodyBricksUpgradePopup from '@/src/components/melody-bricks/MelodyBricksUpgradePopup';
import MelodyBricksSignupPopup from '@/src/components/melody-bricks/MelodyBricksSignupPopup';
import FeedbackSettingsPopup from '@/src/components/FeedbackSettingsPopup';
import playWavFile from '@/src/utils/playWavFile';

const MapCanvas = forwardRef(({ 
  onPlayLevel, 
  levelProgress, 
  onUpdateLevelProgress, 
  onOpenShop, 
  onExitGame,
  correctSound,
  setCorrectSound,
  correctVolume,
  setCorrectVolume,
  incorrectSound,
  setIncorrectSound,
  incorrectVolume,
  setIncorrectVolume,
  section = '1',
  onBackToSections,
  currentUnitLabel
}, ref) => {
  const router = useRouter();
  const canvasRef = useRef(null);
  const [levels, setLevels] = useState([]);
  const [hoveredLevel, setHoveredLevel] = useState(null);
  const [message, setMessage] = useState("");
  
  // Paywall state
  const [showUpgradePopup, setShowUpgradePopup] = useState(false);
  const [showSignupPopup, setShowSignupPopup] = useState(false);
  const [upgradeMessage, setUpgradeMessage] = useState("");
  
  // Auth and product context
  const { currentUser } = useAuth();
  const { featureId, featureName } = useProduct();
  
  // Scroll state
  const [scrollOffset, setScrollOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });
  
  // Animation state
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationStart, setAnimationStart] = useState({ x: 0, y: 0 });
  const [animationEnd, setAnimationEnd] = useState({ x: 0, y: 0 });
  const [animationProgress, setAnimationProgress] = useState(0);

  // Avatar image state
  const [musicianAvatar, setMusicianAvatar] = useState(null);
  const [avatarLoaded, setAvatarLoaded] = useState(false);
  
  // Settings state
  const [showSettings, setShowSettings] = useState(false);

  // Level info modal state (for click-to-open popup)
  const [showLevelModal, setShowLevelModal] = useState(false);
  const [modalLevelId, setModalLevelId] = useState(null);

  // Skin mapping
  const skinMapping = {
    'default': '/images/musician-avatar.png',
    'the_busker': '/images/the-busker.png',
    'pop_queen': '/images/pop-queen.png',
    'jazz_legend': '/images/jazz-legend.png'
  };

  // Paywall check function
  const checkPaidLevelAccess = async (level) => {
    if (level.freeVsPaid !== "paid") {
      return true; // Free level, allow access
    }

    // Check if user is logged in
    if (!currentUser || !currentUser.user_ID) {
      // Cases 1, 2, 3: Not signed in - show signup popup
      setShowSignupPopup(true);
      return false;
    }

    try {
      const { access, message } = await checkAccess(currentUser.user_ID, featureId, featureName);
      
      if (!access) {
        // Case 4: Signed in, no subscription - show upgrade popup
        setUpgradeMessage("Complete your training with descending intervals");
        setShowUpgradePopup(true);
        return false;
      }
      
      // Case 5: Signed in, has subscription - allow access
      return true;
    } catch (error) {
      console.error('Error checking access:', error);
      setUpgradeMessage("Error checking access. Please try again.");
      setShowUpgradePopup(true);
      return false;
    }
  };

  // Handle popup actions
  const handleCloseUpgradePopup = () => {
    setShowUpgradePopup(false);
  };

  const handleCloseSignupPopup = () => {
    setShowSignupPopup(false);
  };

  // Load level progress from localStorage on mount
  useEffect(() => {
    // Filter out inactive levels
    const activeLevels = levelsData.levels.filter(level => level.active !== false && String(level.section) === String(section));
    setLevels(activeLevels);
    
    // Set the current level as initially hovered if levelProgress is available
    if (levelProgress && Object.keys(levelProgress).length > 0) {
      const currentLevelId = getCurrentLevel(levelProgress);
      if (currentLevelId) {
        setHoveredLevel(currentLevelId);
        
        // Center the view on the current level
        const currentLevel = activeLevels.find(l => l.id === currentLevelId);
        if (currentLevel) {
          const pos = getPosition(currentLevel.mapGrid.x, currentLevel.mapGrid.y);
          setScrollOffset({
            x: 0, // No horizontal scrolling needed with vertical layout
            y: Math.max(0, Math.min(4500, pos.y - 300))  // Center vertically
          });
        }
      }
    }
  }, [levelProgress, section]);

  // Load musician avatar image based on active skin
  useEffect(() => {
    const loadAvatar = () => {
      // Get active skin from level progress data
      const activeItems = getActiveItems(levelProgress);
      const activeSkin = activeItems.skin || 'default';
      const avatarSrc = skinMapping[activeSkin] || skinMapping['default'];
      
      const img = new Image();
      img.onload = () => {
        setMusicianAvatar(img);
        setAvatarLoaded(true);
      };
      img.onerror = () => {
        console.warn(`Failed to load avatar skin: ${activeSkin}, falling back to default`);
        // Try to load default skin as fallback
        if (activeSkin !== 'default') {
          const defaultImg = new Image();
          defaultImg.onload = () => {
            setMusicianAvatar(defaultImg);
            setAvatarLoaded(true);
          };
          defaultImg.onerror = () => {
            console.warn('Failed to load default avatar, falling back to emoji');
            setAvatarLoaded(false);
          };
          defaultImg.src = skinMapping['default'];
        } else {
          setAvatarLoaded(false);
        }
      };
      img.src = avatarSrc;
    };
    
    loadAvatar();
  }, [levelProgress]);

  // Set up wheel event listener with passive: false to allow preventDefault
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const wheelHandler = (event) => {
      event.preventDefault();
      const zoomFactor = 1.1;
      const delta = event.deltaY;
      
      if (event.ctrlKey || event.metaKey) {
        // Zoom functionality (optional enhancement)
        // Not implemented in this version
        return;
      }
      
      // Scroll functionality
      const scrollSpeed = 50;
      setScrollOffset(prev => ({
        x: 0,
        y: Math.max(0, Math.min(4500, prev.y + delta * scrollSpeed / 100))
      }));
    };

    canvas.addEventListener('wheel', wheelHandler, { passive: false });

    return () => {
      canvas.removeEventListener('wheel', wheelHandler);
    };
  }, []);

  const canMoveToLevel = (fromLevelId, toLevelId) => {
    // Can always stay on the same level
    if (fromLevelId === toLevelId) return true;
    
    const fromLevel = levels.find(l => l.id === fromLevelId);
    const toLevel = levels.find(l => l.id === toLevelId);
    
    if (!fromLevel || !toLevel) return false;
    
    // Cannot move to inactive levels
    if (toLevel.active === false) return false;
    
    // Allow movement to any unlocked level (removed path-based restrictions)
    const toLevelData = levelProgress[toLevelId];
    return toLevelData && toLevelData.unlocked;
  };

  const getCanvasCoordinates = (event) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (event.clientX - rect.left) * scaleX;
    const y = (event.clientY - rect.top) * scaleY;
    return { x, y };
  };

  const getWorldCoordinates = (canvasX, canvasY) => {
    return {
      x: canvasX + scrollOffset.x,
      y: canvasY + scrollOffset.y
    };
  };

  const handleCanvasMouseMove = (event) => {
    const { x: canvasX, y: canvasY } = getCanvasCoordinates(event);
    const { x, y } = getWorldCoordinates(canvasX, canvasY);

    if (isDragging) {
      const deltaX = canvasX - lastMousePos.x;
      const deltaY = canvasY - lastMousePos.y;
      
      setScrollOffset(prev => ({
        x: 0,
        y: Math.max(0, Math.min(4500, prev.y - deltaY))
      }));
      
      setLastMousePos({ x: canvasX, y: canvasY });
      return;
    }

    let foundLevel = null;

    // Check if mouse is over any level circle
    levels.forEach(level => {
      const pos = getPosition(level.mapGrid.x, level.mapGrid.y);
      const distance = Math.sqrt((x - pos.x) ** 2 + (y - pos.y) ** 2);
      
      if (distance <= 60) { // LEVEL_RADIUS
        foundLevel = level.id;
      }
    });

    // If not hovering over any level, show current level stats
    if (!foundLevel) {
      const currentLevelId = getCurrentLevel(levelProgress);
      setHoveredLevel(currentLevelId);
    } else {
      setHoveredLevel(foundLevel);
    }
  };

  const handleCanvasMouseDown = (event) => {
    const { x: canvasX, y: canvasY } = getCanvasCoordinates(event);
    setIsDragging(true);
    setLastMousePos({ x: canvasX, y: canvasY });
  };

  const handleCanvasMouseUp = () => {
    setIsDragging(false);
  };

  const handleCanvasMouseLeave = () => {
    setIsDragging(false);
    // When leaving canvas, show current level stats
    const currentLevelId = getCurrentLevel(levelProgress);
    setHoveredLevel(currentLevelId);
  };

  const handleCanvasClick = async (event) => {
    // Don't handle clicks if we were dragging
    if (isDragging) return;

    const { x: canvasX, y: canvasY } = getCanvasCoordinates(event);
    const { x, y } = getWorldCoordinates(canvasX, canvasY);

    // Clear any existing message
    setMessage("");

    // Check if click is on any level circle
    for (const level of levels) {
      const pos = getPosition(level.mapGrid.x, level.mapGrid.y);
      const distance = Math.sqrt((x - pos.x) ** 2 + (y - pos.y) ** 2);
      
      if (distance <= 60) { // LEVEL_RADIUS
        const levelData = levelProgress[level.id];
        const currentLevelId = getCurrentLevel(levelProgress);
        
        // Handle shop click - allow walking to shop but don't open it directly
        if (level.isShop) {
          const currentLevelId = getCurrentLevel(levelProgress);
          
          // Allow walking to shop if user can reach it from current position
          if (canMoveToLevel(currentLevelId, level.id)) {
            // Start animation to walk to shop
            const currentLevel = levels.find(l => l.id === currentLevelId);
            
            if (currentLevel) {
              const startPos = getPosition(currentLevel.mapGrid.x, currentLevel.mapGrid.y);
              const endPos = getPosition(level.mapGrid.x, level.mapGrid.y);
              
              setAnimationStart(startPos);
              setAnimationEnd(endPos);
              setAnimationProgress(0);
              setIsAnimating(true);
              
              // Animate over 2000ms (2 seconds)
              const startTime = Date.now();
              const animate = () => {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / 2000, 1);
                
                // Easing function for smooth animation
                const easedProgress = 1 - Math.pow(1 - progress, 3);
                
                setAnimationProgress(easedProgress);
                
                if (progress < 1) {
                  requestAnimationFrame(animate);
                } else {
                  // Animation complete - update level progress to set shop as current
                  const updatedProgress = { ...levelProgress };
                  // Only update level data, not the totalBleeps, inventory, or activeItems fields
                  Object.keys(updatedProgress).forEach(id => {
                    if (id !== 'totalBleeps' && id !== 'inventory' && id !== 'activeItems') {
                      updatedProgress[id] = { ...updatedProgress[id], currentNode: false };
                    }
                  });
                  updatedProgress[level.id] = { ...updatedProgress[level.id], currentNode: true };
                  
                  // Update the parent component's state
                  if (onUpdateLevelProgress) {
                    onUpdateLevelProgress(updatedProgress);
                  }
                  
                  setHoveredLevel(level.id);
                  setIsAnimating(false);
                }
              };
              
              requestAnimationFrame(animate);
            }
          } else {
            setMessage("You need to walk to the shop first");
            setTimeout(() => setMessage(""), 3000);
          }
          return;
        }
        
        // Move avatar first, then show modal when arrived
        if (!levelData || !levelData.unlocked) {
          setMessage("Level locked");
          setTimeout(() => setMessage(""), 3000);
        } else if (!canMoveToLevel(currentLevelId, level.id)) {
          setMessage("Cannot reach from current position");
          setTimeout(() => setMessage(""), 3000);
        } else {
          if (level.id === currentLevelId) {
            // Already at level → show modal immediately
            setModalLevelId(level.id);
            setShowLevelModal(true);
            return;
          }
          const currentLevel = levels.find(l => l.id === currentLevelId);
          const targetLevel = level;
          if (currentLevel) {
            const startPos = getPosition(currentLevel.mapGrid.x, currentLevel.mapGrid.y);
            const endPos = getPosition(targetLevel.mapGrid.x, targetLevel.mapGrid.y);
            setAnimationStart(startPos);
            setAnimationEnd(endPos);
            setAnimationProgress(0);
            setIsAnimating(true);

            const startTime = Date.now();
            const animate = () => {
              const elapsed = Date.now() - startTime;
              const progress = Math.min(elapsed / 2000, 1);
              const easedProgress = 1 - Math.pow(1 - progress, 3);
              setAnimationProgress(easedProgress);

              if (progress < 1) {
                requestAnimationFrame(animate);
              } else {
                const updatedProgress = { ...levelProgress };
                Object.keys(updatedProgress).forEach(id => {
                  if (id !== 'totalBleeps' && id !== 'inventory' && id !== 'activeItems') {
                    updatedProgress[id] = { ...updatedProgress[id], currentNode: false };
                  }
                });
                updatedProgress[targetLevel.id] = { ...updatedProgress[targetLevel.id], currentNode: true };

                if (onUpdateLevelProgress) {
                  onUpdateLevelProgress(updatedProgress);
                }

                setHoveredLevel(targetLevel.id);
                setIsAnimating(false);

                // Now show modal for the arrived level
                setModalLevelId(targetLevel.id);
                setShowLevelModal(true);
              }
            };

            requestAnimationFrame(animate);
          }
        }
      }
    }
  };



  const getPosition = (gridX, gridY) => {
    // Convert grid coordinates to world coordinates (larger virtual space)
    const cellWidth = 250; // Restored original cell size
    const cellHeight = 200; // Restored original height spacing
    
    // Use fixed left offset of 150px maximum
    const leftOffset = 150;
    const x = leftOffset + (gridX - 1) * cellWidth + cellWidth / 2;
    // Y-axis increases downward: 1 is near top, 22 is near bottom
    const y = 200 + (gridY - 1) * cellHeight + cellHeight / 2;
    
    return { x, y };
  };

  // Function to center the view on a specific level
  const centerViewOnLevel = (levelId) => {
    const level = levels.find(l => l.id === levelId);
    if (!level) return;
    
    const pos = getPosition(level.mapGrid.x, level.mapGrid.y);
    
    // Calculate scroll offset to center the level on screen
    const targetScrollX = Math.max(0, pos.x - canvas.width / 2); // Half canvas width
    const targetScrollY = Math.max(0, pos.y - canvas.height / 2); // Half canvas height
    
    // Smooth scroll to the new position
    setScrollOffset({
      x: targetScrollX,
      y: targetScrollY
    });
    
    console.log(`🎯 Centered view on level ${levelId} at position (${pos.x}, ${pos.y})`);
  };

  // Function to automatically move avatar to next level (called after level completion)
  const autoMoveToNextLevel = (currentLevelId) => {
    // Find the current level to get its nextLevel
    const currentLevel = levels.find(l => l.id === currentLevelId);
    if (!currentLevel || !currentLevel.nextLevel) {
      console.log(`🏁 Level ${currentLevelId} completed - no next level available`);
      return;
    }

    // Find the target level
    const targetLevel = levels.find(l => l.id === currentLevel.nextLevel);
    if (!targetLevel) {
      console.log(`⚠️ Next level ${currentLevel.nextLevel} not found`);
      return;
    }

    console.log(`🎯 Auto-moving avatar from ${currentLevelId} to ${currentLevel.nextLevel}`);
    
    // Start animation using the same logic as click handler
    const startPos = getPosition(currentLevel.mapGrid.x, currentLevel.mapGrid.y);
    const endPos = getPosition(targetLevel.mapGrid.x, targetLevel.mapGrid.y);
    
    setAnimationStart(startPos);
    setAnimationEnd(endPos);
    setAnimationProgress(0);
    setIsAnimating(true);
    
    // Animate over 2000ms (2 seconds)
    const startTime = Date.now();
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / 2000, 1);
      
      // Easing function for smooth animation
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      
      setAnimationProgress(easedProgress);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        // Animation complete - update level progress
        const updatedProgress = { ...levelProgress };
        // Only update level data, not the totalBleeps, inventory, or activeItems fields
        Object.keys(updatedProgress).forEach(id => {
          if (id !== 'totalBleeps' && id !== 'inventory' && id !== 'activeItems') {
            updatedProgress[id] = { ...updatedProgress[id], currentNode: false };
          }
        });
        updatedProgress[targetLevel.id] = { ...updatedProgress[targetLevel.id], currentNode: true };
        
        // Update the parent component's state
        if (onUpdateLevelProgress) {
          onUpdateLevelProgress(updatedProgress);
        }
        
        setHoveredLevel(targetLevel.id);
        setIsAnimating(false);
        
        // Center the view on the new level
        centerViewOnLevel(targetLevel.id);
        
        console.log(`✅ Avatar auto-moved to ${targetLevel.id}`);
      }
    };
    
    requestAnimationFrame(animate);
  };

  // Expose functions to parent component
  useImperativeHandle(ref, () => ({
    autoMoveToNextLevel
  }));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || levels.length === 0 || Object.keys(levelProgress).length === 0) return;
    
    const ctx = canvas.getContext("2d");

    // Set canvas size - dynamic based on container
    const containerWidth = canvas.parentElement.clientWidth || 800;
    const containerHeight = canvas.parentElement.clientHeight || 800;
    canvas.width = containerWidth;
    canvas.height = containerHeight;

    // Constants for drawing
    const LEVEL_RADIUS = 60;
    const CANVAS_PADDING = 100;

    // Clear canvas
    ctx.fillStyle = "#1a1a2e";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Save the current context state
    ctx.save();
    
    // Apply scroll offset (translate the drawing context)
    ctx.translate(-scrollOffset.x, -scrollOffset.y);



    // Determine first level of each unit (sorted by map position)
    const sortedLevels = [...levels].sort((a, b) => {
      const ay = a?.mapGrid?.y ?? 0; const by = b?.mapGrid?.y ?? 0;
      if (ay !== by) return ay - by;
      const ax = a?.mapGrid?.x ?? 0; const bx = b?.mapGrid?.x ?? 0;
      return ax - bx;
    });
    const unitFirstIds = new Set();
    const seenUnits = new Set();
    sortedLevels.forEach(lvl => {
      const unitName = lvl?.unit || '';
      if (!seenUnits.has(unitName)) {
        seenUnits.add(unitName);
        unitFirstIds.add(lvl.id);
      }
    });

    // Draw level circles
    levels.forEach(level => {
      const pos = getPosition(level.mapGrid.x, level.mapGrid.y);
      const levelData = levelProgress[level.id];
      const isUnlocked = levelData && levelData.unlocked;
      const isCurrent = levelData && levelData.currentNode;
      const isHovered = hoveredLevel === level.id;
      
      // Handle shop circle differently
      if (level.isShop) {
        // Shop circle styling - always off-white
        const shopFillColor = "#fefce8"; // Tailwind yellow-50
        const shopStrokeColor = "#e5e7eb"; // Light gray border
        
        // Draw shop glow
        const glowRadius = LEVEL_RADIUS + 30;
        const gradient = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, glowRadius);
        gradient.addColorStop(0, shopFillColor + "60");
        gradient.addColorStop(1, "transparent");
        ctx.fillStyle = gradient;
        ctx.fillRect(pos.x - glowRadius, pos.y - glowRadius, glowRadius * 2, glowRadius * 2);
        
        // Draw main shop circle
        ctx.fillStyle = shopFillColor;
        ctx.strokeStyle = shopStrokeColor;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, LEVEL_RADIUS, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
        
        // Draw shop icon
        ctx.fillStyle = "#92400e"; // Brown text for contrast
        ctx.font = "40px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("🛒", pos.x, pos.y);
        
        // Draw shop name
        ctx.fillStyle = "#92400e"; // Brown text for contrast
        ctx.font = "14px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "top";
        ctx.fillText("Shop", pos.x, pos.y + LEVEL_RADIUS + 15);
        
        // Draw person icon on top if this is the current level and not animating
        if (isCurrent && !isAnimating) {
          if (avatarLoaded && musicianAvatar) {
            // Draw musician avatar image
            const avatarSize = 80;
            ctx.drawImage(musicianAvatar, pos.x - avatarSize/2, pos.y - avatarSize/2, avatarSize, avatarSize);
          } else {
            // Fallback to emoji
            ctx.fillStyle = "#ffd700"; // Gold color for person icon
            ctx.font = "42px Arial";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText("👤", pos.x, pos.y);
          }
        }
        
        return; // Skip regular level drawing for shop
      }
      
      // Determine circle color based on level status and free/paid
      let fillColor, strokeColor;
      if (!isUnlocked) {
        if (level.freeVsPaid === "paid") {
          fillColor = "#C0C0C0"; // Silver for locked paid
          strokeColor = "#A0A0A0";
        } else {
          fillColor = "#4a5568"; // Darkish grey for locked free
          strokeColor = "#2d3748";
        }
      } else if (levelData.completed) {
        if (level.freeVsPaid === "paid") {
          fillColor = "#90EE90"; // Light green for completed paid
          strokeColor = "#7FBF7F";
        } else {
          fillColor = "#225522"; // Dark green for completed free
          strokeColor = "#1A441A";
        }
      } else {
        if (level.freeVsPaid === "paid") {
          fillColor = "#FFD700"; // Gold for unlocked paid
          strokeColor = "#DAA520";
        } else {
          fillColor = "#FEF3C7"; // Pale yellow for unlocked free
          strokeColor = "#F59E0B";
        }
      }
      
      // Draw outer glow (stronger for current level)
      const glowRadius = isCurrent ? LEVEL_RADIUS + 40 : LEVEL_RADIUS + 20;
      const glowOpacity = isCurrent ? "80" : "40";
      const gradient = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, glowRadius);
      gradient.addColorStop(0, fillColor + glowOpacity);
      gradient.addColorStop(1, "transparent");
      ctx.fillStyle = gradient;
      ctx.fillRect(pos.x - glowRadius, pos.y - glowRadius, glowRadius * 2, glowRadius * 2);
      
      // Draw additional pulsing glow for current level
      if (isCurrent) {
        const pulseRadius = LEVEL_RADIUS + 50;
        const pulseOpacity = "30";
        const pulseGradient = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, pulseRadius);
        pulseGradient.addColorStop(0, "#ffd700" + pulseOpacity);
        pulseGradient.addColorStop(1, "transparent");
        ctx.fillStyle = pulseGradient;
        ctx.fillRect(pos.x - pulseRadius, pos.y - pulseRadius, pulseRadius * 2, pulseRadius * 2);
      }
      
      // Draw main circle (slightly larger and lighter on hover)
      const drawRadius = LEVEL_RADIUS + (isHovered ? 6 : 0);
      ctx.fillStyle = fillColor;
      ctx.strokeStyle = isCurrent ? "#ffd700" : strokeColor; // Gold border for current level
      ctx.lineWidth = isCurrent ? 8 : 4;
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, drawRadius, 0, 2 * Math.PI);
      ctx.fill();
      ctx.stroke();
      if (isHovered) {
        // Subtle lighten overlay
        ctx.fillStyle = "rgba(255,255,255,0.12)";
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, drawRadius, 0, 2 * Math.PI);
        ctx.fill();
      }

      // Badge for jump levels (inside circle near bottom)
      if (level.jump) {
        ctx.fillStyle = "#fbbf24"; // amber-400
        ctx.font = "bold 16px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "alphabetic";
        ctx.fillText("jump", pos.x, pos.y + drawRadius - 18);
      }
      
      if (isUnlocked) {
        // Draw intervals and optional unit label to the right of the circle
        const textX = pos.x + drawRadius + 18;
        let textY = pos.y;
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        if (unitFirstIds.has(level.id) && level.unit) {
          ctx.fillStyle = "#e5e7eb"; // light gray
          ctx.font = "bold 16px Arial";
          ctx.fillText(level.unit, textX, textY - 12);
          textY += 6;
        }
        ctx.fillStyle = "#9ca3af"; // muted gray
        ctx.font = "12px Arial";
        const intervalsText = (level.intervals || []).join(', ');
        ctx.fillText(intervalsText, textX, textY + 8);

        // Draw "Virtuoso" text for paid levels
        if (level.freeVsPaid === "paid") {
          ctx.fillStyle = "#8B4513"; // Dark brown for contrast
          ctx.font = "bold 12px Arial";
          ctx.textAlign = "center";
          ctx.textBaseline = "bottom";
          ctx.fillText("Virtuoso", pos.x, pos.y - 25);
        }
        
        // Draw person icon on top if this is the current level and not animating
        if (isCurrent && !isAnimating) {
          if (avatarLoaded && musicianAvatar) {
            // Draw musician avatar image
            const avatarSize = 80;
            ctx.drawImage(musicianAvatar, pos.x - avatarSize/2, pos.y - avatarSize/2, avatarSize, avatarSize);
          } else {
            // Fallback to emoji
            ctx.fillStyle = "#ffd700"; // Gold color for person icon
            ctx.font = "42px Arial";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText("👤", pos.x, pos.y);
          }
        }
      } else {
        // Draw unit and intervals to the right even if locked
        const textX = pos.x + drawRadius + 18;
        let textY = pos.y;
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        if (unitFirstIds.has(level.id) && level.unit) {
          ctx.fillStyle = "#e5e7eb";
          ctx.font = "bold 16px Arial";
          ctx.fillText(level.unit, textX, textY - 12);
          textY += 6;
        }
        ctx.fillStyle = "#9ca3af";
        ctx.font = "12px Arial";
        const intervalsText = (level.intervals || []).join(', ');
        ctx.fillText(intervalsText, textX, textY + 8);

        // Draw big fat lock for locked levels
        ctx.fillStyle = "#cbd5e0";
        ctx.font = "40px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("🔒", pos.x, pos.y);
      }
      
      // Draw level name below circle (only for unlocked levels)
      if (isUnlocked) {
        ctx.fillStyle = "#e2e8f0";
        ctx.font = "14px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "top";
        const words = level.name.split(' ');
        let line1 = words.slice(0, 2).join(' ');
        let line2 = words.slice(2).join(' ');
        
        ctx.fillText(line1, pos.x, pos.y + LEVEL_RADIUS + 15);
        if (line2) {
          ctx.fillText(line2, pos.x, pos.y + LEVEL_RADIUS + 35);
        }
      }
    });

    // Draw animated person icon if animating
    if (isAnimating) {
      const currentX = animationStart.x + (animationEnd.x - animationStart.x) * animationProgress;
      const currentY = animationStart.y + (animationEnd.y - animationStart.y) * animationProgress;
      
      // Draw animated person icon
      if (avatarLoaded && musicianAvatar) {
        // Draw musician avatar image - keep same size as stationary
        const avatarSize = 80;
        ctx.drawImage(musicianAvatar, currentX - avatarSize/2, currentY - avatarSize/2, avatarSize, avatarSize);
      } else {
        // Fallback to emoji - keep same size as stationary
        ctx.fillStyle = "#ffd700"; // Gold color for person icon
        ctx.font = "42px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("👤", currentX, currentY);
      }
    }

    // Restore the context to draw fixed UI elements (title, legend, scrollbars)
    ctx.restore();

    // Draw title (fixed position, not scrolled)
    ctx.fillStyle = "#1a1a2e";
    ctx.fillRect(0, 0, canvas.width, 60); // Background for title
    ctx.fillStyle = "#e2e8f0";
    ctx.font = "bold 24px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText("Melody Bricks - Level Map", canvas.width / 2, 20);
    
    // Draw legend (fixed position, not scrolled)
    ctx.fillStyle = "#1a1a2e";
    ctx.fillRect(0, canvas.height - 40, canvas.width, 40); // Background for legend
    ctx.fillStyle = "#a0aec0";
    ctx.font = "14px Arial";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText("→ Drag to pan, scroll wheel to move", 20, canvas.height - 20);

    // Draw scroll indicators
    const scrollBarWidth = 10;
    const scrollBarColor = "#4a5568";
    const scrollThumbColor = "#718096";
    
    // Vertical scrollbar
    const vScrollHeight = (canvas.height - 140) * (canvas.height / 1200); // Total virtual height is 1200
    const vScrollTop = 70 + (scrollOffset.y / 1200) * (canvas.height - 140 - vScrollHeight);
    ctx.fillStyle = scrollBarColor;
    ctx.fillRect(canvas.width - scrollBarWidth - 5, 70, scrollBarWidth, canvas.height - 140);
    ctx.fillStyle = scrollThumbColor;
    ctx.fillRect(canvas.width - scrollBarWidth - 5, vScrollTop, scrollBarWidth, vScrollHeight);
    
    // No horizontal scrollbar in vertical layout

  }, [levels, levelProgress, scrollOffset, isAnimating, animationProgress, avatarLoaded, musicianAvatar, hoveredLevel]);

  return (
    <div className="flex justify-center items-start gap-6 p-4 min-h-[700px]">
      <div className="flex flex-col items-center">
        <div className="relative" style={{ width: 'clamp(400px, 50vw, 800px)', height: 'clamp(400px, 90vh, 800px)' }}>
          <canvas 
            ref={canvasRef} 
            className={`border-2 border-gray-600 rounded-lg shadow-lg ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
            style={{ 
              width: '100%', 
              height: '100%',
              userSelect: 'none' // Prevent text selection while dragging
            }}
            onClick={handleCanvasClick}
            onMouseMove={handleCanvasMouseMove}
            onMouseDown={handleCanvasMouseDown}
            onMouseUp={handleCanvasMouseUp}
            onMouseLeave={handleCanvasMouseLeave}

          />
          {/* Section selector overlay inside map */}
          {onBackToSections && (
            <div className="absolute left-0 right-0 bottom-2 px-4">
              <button
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-lg border border-emerald-500 shadow-md"
                onClick={onBackToSections}
              >
                ← Section {section} • {currentUnitLabel || ''}
              </button>
            </div>
          )}
        </div>
        
        {/* Bottom buttons moved to RightSidebar */}
        
        {/* Message Display */}
        {message && (
          <div className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg">
            {message}
          </div>
        )}
        
                 {/* Upgrade Popup */}
         {showUpgradePopup && (
           <MelodyBricksUpgradePopup
             message={upgradeMessage}
             onClose={handleCloseUpgradePopup}
           />
         )}

         {/* Signup Popup */}
         {showSignupPopup && (
           <MelodyBricksSignupPopup
             onClose={handleCloseSignupPopup}
           />
         )}

         {/* Settings Popup */}
         <FeedbackSettingsPopup
           isOpen={showSettings}
           onClose={() => setShowSettings(false)}
           correctSound={correctSound}
           setCorrectSound={setCorrectSound}
           correctVolume={correctVolume}
           setCorrectVolume={setCorrectVolume}
           incorrectSound={incorrectSound}
           setIncorrectSound={setIncorrectSound}
           incorrectVolume={incorrectVolume}
           setIncorrectVolume={setIncorrectVolume}
           onTestSound={(soundFile, volume) => {
             playWavFile(soundFile, volume);
           }}
         />

      </div>
      
      <div className="flex flex-col gap-4">
        {/* Level Info Modal (centered overlay) */}
        {showLevelModal && modalLevelId && (
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="bg-gray-900 border-2 border-gray-700 rounded-xl p-6 w-[520px] max-w-full shadow-2xl">
              {(() => {
                const levelInfo = levels.find(l => l.id === modalLevelId);
                const levelData = levelProgress[modalLevelId];
                if (!levelInfo || !levelData) return null;
                return (
                  <div className="text-white">
                    <h3 className="text-2xl font-bold mb-4">{levelInfo.name}</h3>
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between"><span className="text-gray-300">Status:</span><span className={levelData.completed ? 'text-yellow-400' : levelData.unlocked ? 'text-green-400' : 'text-red-400'}>{levelData.completed ? 'Completed' : levelData.unlocked ? 'Unlocked' : 'Locked'}</span></div>
                      {levelData.unlocked && (
                        <>
                          <div className="flex justify-between"><span className="text-gray-300">Best Score:</span><span className="text-yellow-400">{levelData.highestScore}</span></div>
                          <div className="flex justify-between"><span className="text-gray-300">Last Score:</span><span className="text-blue-400">{levelData.lastScore}</span></div>
                          <div className="flex justify-between"><span className="text-gray-300">Attempts:</span><span className="text-purple-400">{levelData.attempts}</span></div>
                          <div className="flex justify-between"><span className="text-gray-300">Intervals:</span><span className="text-cyan-400">{levelInfo?.intervals ? levelInfo.intervals.join(', ') : 'N/A'}</span></div>
                        </>
                      )}
                    </div>
                    <div className="flex flex-col gap-3">
                      {levelData.unlocked && (
                        <button
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg border border-blue-500"
                          onClick={() => {
                            const info = levels.find(l => l.id === modalLevelId);
                            setShowLevelModal(false);
                            setModalLevelId(null);
                            if (onPlayLevel && info) onPlayLevel(info);
                          }}
                        >
                          Play Level
                        </button>
                      )}
                      <button
                        className="w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-4 rounded-lg border border-gray-600"
                        onClick={() => { setShowLevelModal(false); setModalLevelId(null); }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        )}
        {/* Static stats panel removed */}

        {/* Overall Progress moved to ProgressView */}
      </div>
    </div>
  );
});

export default MapCanvas; 