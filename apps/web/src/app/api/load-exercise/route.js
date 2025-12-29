import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Import the exercise data directly
    const exerciseData = {
      "id": "ex001",
      "name": "Level 2",
      "section": "1",
      "description": "Learn ascending intervals: Major 2nd, Perfect 5th, and Perfect Octave",
      "introText": "Time to expand your interval recognition! In this level, you'll learn to distinguish between ascending Major 2nds, Perfect 5ths, and Perfect Octaves. These are some of the most recognizable intervals in music.",
      "type": "12 tone wall",
      "freeVsPaid": "free",
      "settings": {
        "ascending": true,
        "descending": false,
        "harmonic": false,
        "ascendingVector": [0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1],
        "descendingVector": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        "harmonicVector": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        "randomIntervalRoot": false
      },
      "nextLevel": "aP4aM7aP8",
      "requires": [],
      "mapGrid": {
        "x": 1,
        "y": 3
      },
      "difficulty": "beginner",
      "intervals": ["M2", "P5", "P8"],
      "winCondition": {
        "eliminatedRows": 5
      },
      "active": true,
      "unit": "Major Scale",
      "jump": true
    };
    
    return NextResponse.json(exerciseData);
  } catch (error) {
    console.error('Error loading exercise data:', error);
    return NextResponse.json({ error: 'Failed to load exercise data' }, { status: 500 });
  }
}
