export default function TheoryPage() {
  return (
    <div className="reactive-container">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-6xl font-special text-green-600 mb-6">
          Music Theory Lessons
        </h1>
        <p className="text-xl md:text-2xl text-gray-700 max-w-3xl mx-auto">
          Understand the language of music and unlock your creative potential through practical theory
        </p>
      </div>

      {/* Why Learn Music Theory */}
      <div className="mb-16">
        <h2 className="text-3xl md:text-4xl font-special text-green-600 mb-8 text-center">
          Why Learn Music Theory?
        </h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-yellow-50 p-6 rounded-lg border-2 border-green-200">
            <h3 className="text-2xl font-special text-green-700 mb-4">🎵 Musical Communication</h3>
            <p className="text-gray-700">
              Learn the universal language of music that allows you to communicate with other musicians and understand musical ideas.
            </p>
          </div>
          <div className="bg-yellow-50 p-6 rounded-lg border-2 border-green-200">
            <h3 className="text-2xl font-special text-green-700 mb-4">🎼 Creative Freedom</h3>
            <p className="text-gray-700">
              Understand why certain musical choices work and use that knowledge to make informed creative decisions in your own music.
            </p>
          </div>
          <div className="bg-yellow-50 p-6 rounded-lg border-2 border-green-200">
            <h3 className="text-2xl font-special text-green-700 mb-4">🎹 Faster Learning</h3>
            <p className="text-gray-700">
              Learn new songs and pieces more quickly by understanding the patterns and structures that make them work.
            </p>
          </div>
          <div className="bg-yellow-50 p-6 rounded-lg border-2 border-green-200">
            <h3 className="text-2xl font-special text-green-700 mb-4">🎯 Musical Confidence</h3>
            <p className="text-gray-700">
              Build confidence in your musical abilities by understanding the underlying principles that guide musical creation.
            </p>
          </div>
        </div>
      </div>

      {/* My Teaching Approach */}
      <div className="mb-16">
        <h2 className="text-3xl md:text-4xl font-special text-green-600 mb-8 text-center">
          My Teaching Approach
        </h2>
        <div className="bg-gradient-to-r from-green-50 to-yellow-50 p-8 rounded-lg border-2 border-green-200">
          <div className="max-w-4xl mx-auto">
            <p className="text-lg text-gray-700 mb-6">
              I believe music theory should be practical and immediately applicable. My approach focuses on understanding concepts through playing and creating music, rather than just memorizing rules.
            </p>
            <p className="text-lg text-gray-700 mb-6">
              We start with fundamental concepts and immediately apply them to real music. You'll learn to hear and recognize theoretical concepts in the music you love, and use that understanding to create your own music.
            </p>
            <p className="text-lg text-gray-700">
              Whether you're a complete beginner or an experienced musician looking to deepen your understanding, I'll help you develop a practical knowledge of music theory that enhances your musical creativity.
            </p>
          </div>
        </div>
      </div>

      {/* What We'll Cover */}
      <div className="mb-16">
        <h2 className="text-3xl md:text-4xl font-special text-green-600 mb-8 text-center">
          What We'll Cover in Theory Lessons
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-yellow-50 p-6 rounded-lg border-2 border-green-200">
            <h3 className="text-xl font-special text-green-700 mb-3">🎵 Fundamentals</h3>
            <p className="text-gray-700 text-sm">
              Notes, scales, intervals, and the building blocks of musical language
            </p>
          </div>
          <div className="bg-yellow-50 p-6 rounded-lg border-2 border-green-200">
            <h3 className="text-xl font-special text-green-700 mb-3">🎼 Harmony</h3>
            <p className="text-gray-700 text-sm">
              Chords, chord progressions, and how harmony creates musical tension and resolution
            </p>
          </div>
          <div className="bg-yellow-50 p-6 rounded-lg border-2 border-green-200">
            <h3 className="text-xl font-special text-green-700 mb-3">🥁 Rhythm</h3>
            <p className="text-gray-700 text-sm">
              Time signatures, rhythmic patterns, and the groove that drives music forward
            </p>
          </div>
          <div className="bg-yellow-50 p-6 rounded-lg border-2 border-green-200">
            <h3 className="text-xl font-special text-green-700 mb-3">🎹 Key Signatures</h3>
            <p className="text-gray-700 text-sm">
              Understanding keys, modes, and how they affect the character of music
            </p>
          </div>
          <div className="bg-yellow-50 p-6 rounded-lg border-2 border-green-200">
            <h3 className="text-xl font-special text-green-700 mb-3">🎶 Form & Analysis</h3>
            <p className="text-gray-700 text-sm">
              How music is organized and structured to create compelling listening experiences
            </p>
          </div>
          <div className="bg-yellow-50 p-6 rounded-lg border-2 border-green-200">
            <h3 className="text-xl font-special text-green-700 mb-3">🎯 Ear Training</h3>
            <p className="text-gray-700 text-sm">
              Developing your ability to hear and recognize theoretical concepts in music
            </p>
          </div>
        </div>
      </div>

      {/* Theory Fundamentals */}
      <div className="mb-16">
        <h2 className="text-3xl md:text-4xl font-special text-green-600 mb-8 text-center">
          Theory Fundamentals
        </h2>
        <div className="space-y-6">
          <div className="bg-green-50 p-6 rounded-lg border-2 border-green-300">
            <h3 className="text-xl font-special text-green-700 mb-2">🎵 Notes & Scales</h3>
            <p className="text-gray-700">
              Learn to understand the musical alphabet, major and minor scales, and how they form the foundation of Western music. We'll explore how scales create different moods and characters in music.
            </p>
          </div>
          <div className="bg-green-50 p-6 rounded-lg border-2 border-green-300">
            <h3 className="text-xl font-special text-green-700 mb-2">🎼 Intervals & Harmony</h3>
            <p className="text-gray-700">
              Master the building blocks of harmony by understanding intervals - the distances between notes. Learn how intervals combine to create chords and how chords work together to create progressions.
            </p>
          </div>
          <div className="bg-green-50 p-6 rounded-lg border-2 border-green-300">
            <h3 className="text-xl font-special text-green-700 mb-2">🎹 Chord Construction</h3>
            <p className="text-gray-700">
              Learn to build chords from the ground up, understanding triads, seventh chords, and extended harmonies. Discover how different chord types create different emotional effects.
            </p>
          </div>
          <div className="bg-green-50 p-6 rounded-lg border-2 border-green-300">
            <h3 className="text-xl font-special text-green-700 mb-2">🥁 Rhythm & Meter</h3>
            <p className="text-gray-700">
              Understand how rhythm organizes music in time. Learn about time signatures, rhythmic patterns, and how rhythm creates energy and movement in music.
            </p>
          </div>
          <div className="bg-green-50 p-6 rounded-lg border-2 border-green-300">
            <h3 className="text-xl font-special text-green-700 mb-2">🎶 Key Signatures & Modes</h3>
            <p className="text-gray-700">
              Explore how keys and modes create different musical characters. Learn to recognize key signatures and understand how they affect the notes and chords used in a piece.
            </p>
          </div>
        </div>
      </div>

      {/* Advanced Concepts */}
      <div className="mb-16">
        <h2 className="text-3xl md:text-4xl font-special text-green-600 mb-8 text-center">
          Advanced Theory Concepts
        </h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-yellow-50 p-6 rounded-lg border-2 border-green-200">
            <h3 className="text-2xl font-special text-green-700 mb-4">🎼 Harmonic Analysis</h3>
            <p className="text-gray-700 mb-4">
              Learn to analyze the harmonic structure of music, understanding chord progressions and how they create musical tension and resolution.
            </p>
            <ul className="text-left text-gray-700 space-y-1 text-sm">
              <li>• Roman numeral analysis</li>
              <li>• Functional harmony</li>
              <li>• Secondary dominants</li>
              <li>• Modal interchange</li>
            </ul>
          </div>
          <div className="bg-yellow-50 p-6 rounded-lg border-2 border-green-200">
            <h3 className="text-2xl font-special text-green-700 mb-4">🎵 Counterpoint</h3>
            <p className="text-gray-700 mb-4">
              Master the art of writing multiple melodic lines that work together harmoniously, creating rich, complex musical textures.
            </p>
            <ul className="text-left text-gray-700 space-y-1 text-sm">
              <li>• Voice leading principles</li>
              <li>• Species counterpoint</li>
              <li>• Canon and fugue</li>
              <li>• Modern applications</li>
            </ul>
          </div>
          <div className="bg-yellow-50 p-6 rounded-lg border-2 border-green-200">
            <h3 className="text-2xl font-special text-green-700 mb-4">🎹 Jazz Theory</h3>
            <p className="text-gray-700 mb-4">
              Explore jazz harmony, chord extensions, and the theoretical foundations that make jazz music so rich and expressive.
            </p>
            <ul className="text-left text-gray-700 space-y-1 text-sm">
              <li>• Extended harmonies</li>
              <li>• Jazz chord voicings</li>
              <li>• Improvisation theory</li>
              <li>• Jazz standards analysis</li>
            </ul>
          </div>
          <div className="bg-yellow-50 p-6 rounded-lg border-2 border-green-200">
            <h3 className="text-2xl font-special text-green-700 mb-4">🎤 Contemporary Theory</h3>
            <p className="text-gray-700 mb-4">
              Understand modern music theory concepts used in pop, rock, and contemporary music, including modal harmony and non-functional progressions.
            </p>
            <ul className="text-left text-gray-700 space-y-1 text-sm">
              <li>• Modal harmony</li>
              <li>• Non-functional progressions</li>
              <li>• Contemporary chord voicings</li>
              <li>• Production theory</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Practical Application */}
      <div className="mb-16">
        <h2 className="text-3xl md:text-4xl font-special text-green-600 mb-8 text-center">
          Practical Application
        </h2>
        <div className="bg-yellow-50 p-8 rounded-lg border-2 border-green-200">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-2xl font-special text-green-700 mb-4 text-center">🎯 Theory in Practice</h3>
            <p className="text-lg text-gray-700 mb-6">
              Every theoretical concept we learn will be immediately applied to real music. You'll analyze songs you love, understand why they work, and use that knowledge to create your own music.
            </p>
            <p className="text-lg text-gray-700 mb-6">
              We'll work with your instrument (piano, guitar, voice, etc.) to put theory into practice. You'll learn to recognize theoretical concepts by ear and use them in improvisation and composition.
            </p>
            <p className="text-lg text-gray-700">
              By the end of your theory studies, you'll have a deep understanding of how music works and the confidence to use that knowledge creatively in your musical pursuits.
            </p>
          </div>
        </div>
      </div>

      {/* Learning Path */}
      <div className="mb-16">
        <h2 className="text-3xl md:text-4xl font-special text-green-600 mb-8 text-center">
          Your Theory Learning Path
        </h2>
        <div className="space-y-6">
          <div className="bg-yellow-50 p-6 rounded-lg border-2 border-green-200">
            <h3 className="text-xl font-special text-green-700 mb-2">Weeks 1-4: Foundation</h3>
            <p className="text-gray-700">
              Learn the musical alphabet, basic intervals, and major/minor scales. Start recognizing these concepts in the music you listen to and play.
            </p>
          </div>
          <div className="bg-yellow-50 p-6 rounded-lg border-2 border-green-200">
            <h3 className="text-xl font-special text-green-700 mb-2">Weeks 5-12: Building Blocks</h3>
            <p className="text-gray-700">
              Master chord construction, basic harmony, and rhythm. Begin analyzing simple songs and understanding how they work.
            </p>
          </div>
          <div className="bg-yellow-50 p-6 rounded-lg border-2 border-green-200">
            <h3 className="text-xl font-special text-green-700 mb-2">Months 3-6: Application</h3>
            <p className="text-gray-700">
              Apply your theoretical knowledge to more complex music. Start using theory to inform your creative decisions in improvisation and composition.
            </p>
          </div>
          <div className="bg-yellow-50 p-6 rounded-lg border-2 border-green-200">
            <h3 className="text-xl font-special text-green-700 mb-2">6+ Months: Mastery</h3>
            <p className="text-gray-700">
              Advanced theoretical concepts, complex analysis, and the ability to use theory as a powerful tool for musical creativity and understanding.
            </p>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="text-center bg-green-600 text-white p-8 rounded-lg">
        <h2 className="text-3xl md:text-4xl font-special mb-4">
          Ready to Understand Music?
        </h2>
        <p className="text-xl mb-6">
          Start your music theory journey and unlock the secrets of musical creation
        </p>
        <div className="space-x-4">
          <a 
            href="/contact" 
            className="inline-block bg-yellow-400 text-green-800 px-8 py-3 rounded-lg font-bold text-lg hover:bg-yellow-300 transition-colors"
          >
            Start Theory Lessons
          </a>
          <a 
            href="/lessons" 
            className="inline-block bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg font-bold text-lg hover:bg-white hover:text-green-600 transition-colors"
          >
            View All Lessons
          </a>
        </div>
      </div>
    </div>
  );
} 