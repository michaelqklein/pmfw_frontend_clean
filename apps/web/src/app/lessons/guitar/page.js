export default function GuitarPage() {
  return (
    <div className="reactive-container">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-6xl font-special text-green-600 mb-6">
          Guitar Lessons
        </h1>
        <p className="text-xl md:text-2xl text-gray-700 max-w-3xl mx-auto">
          Master the guitar with a creative approach that develops your unique musical voice
        </p>
      </div>

      {/* Why Learn Guitar */}
      <div className="mb-16">
        <h2 className="text-3xl md:text-4xl font-special text-green-600 mb-8 text-center">
          Why Learn Guitar?
        </h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-yellow-50 p-6 rounded-lg border-2 border-green-200">
            <h3 className="text-2xl font-special text-green-700 mb-4">🎸 Versatility</h3>
            <p className="text-gray-700">
              From acoustic folk to electric rock, classical to jazz, the guitar adapts to any musical style and setting.
            </p>
          </div>
          <div className="bg-yellow-50 p-6 rounded-lg border-2 border-green-200">
            <h3 className="text-2xl font-special text-green-700 mb-4">🎵 Portable & Social</h3>
            <p className="text-gray-700">
              Take your music anywhere and easily join jam sessions, campfires, or impromptu performances with friends.
            </p>
          </div>
          <div className="bg-yellow-50 p-6 rounded-lg border-2 border-green-200">
            <h3 className="text-2xl font-special text-green-700 mb-4">🎼 Songwriting Tool</h3>
            <p className="text-gray-700">
              Perfect for accompanying your voice and developing your own songs with rich harmonies and rhythms.
            </p>
          </div>
          <div className="bg-yellow-50 p-6 rounded-lg border-2 border-green-200">
            <h3 className="text-2xl font-special text-green-700 mb-4">🎯 Creative Expression</h3>
            <p className="text-gray-700">
              Develop your unique playing style through improvisation, composition, and personal interpretation.
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
              I believe guitar education should be about more than just learning songs. My approach focuses on developing your musical understanding, technical skills, and creative voice simultaneously.
            </p>
            <p className="text-lg text-gray-700 mb-6">
              We start with fundamental techniques and quickly move into making music that sounds good. You'll learn to play by ear, understand chord progressions, and develop the skills to create your own music.
            </p>
            <p className="text-lg text-gray-700">
              Whether you're interested in strumming chords, fingerpicking, lead guitar, or classical technique, I'll help you build a solid foundation and develop your unique style.
            </p>
          </div>
        </div>
      </div>

      {/* What We'll Cover */}
      <div className="mb-16">
        <h2 className="text-3xl md:text-4xl font-special text-green-600 mb-8 text-center">
          What We'll Cover in Guitar Lessons
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-yellow-50 p-6 rounded-lg border-2 border-green-200">
            <h3 className="text-xl font-special text-green-700 mb-3">🎯 Basic Technique</h3>
            <p className="text-gray-700 text-sm">
              Proper hand position, picking technique, and efficient movement patterns for clean, clear playing
            </p>
          </div>
          <div className="bg-yellow-50 p-6 rounded-lg border-2 border-green-200">
            <h3 className="text-xl font-special text-green-700 mb-3">🎵 Chords & Progressions</h3>
            <p className="text-gray-700 text-sm">
              Master open chords, barre chords, and common progressions that form the foundation of most songs
            </p>
          </div>
          <div className="bg-yellow-50 p-6 rounded-lg border-2 border-green-200">
            <h3 className="text-xl font-special text-green-700 mb-3">🎼 Strumming Patterns</h3>
            <p className="text-gray-700 text-sm">
              Learn rhythmic strumming techniques and develop your sense of timing and groove
            </p>
          </div>
          <div className="bg-yellow-50 p-6 rounded-lg border-2 border-green-200">
            <h3 className="text-xl font-special text-green-700 mb-3">🎸 Fingerpicking</h3>
            <p className="text-gray-700 text-sm">
              Develop finger independence and learn beautiful fingerpicking patterns for solo guitar
            </p>
          </div>
          <div className="bg-yellow-50 p-6 rounded-lg border-2 border-green-200">
            <h3 className="text-xl font-special text-green-700 mb-3">🎶 Lead Guitar</h3>
            <p className="text-gray-700 text-sm">
              Master scales, soloing techniques, and develop your melodic voice on the guitar
            </p>
          </div>
          <div className="bg-yellow-50 p-6 rounded-lg border-2 border-green-200">
            <h3 className="text-xl font-special text-green-700 mb-3">🎤 Playing by Ear</h3>
            <p className="text-gray-700 text-sm">
              Develop the ability to hear a song and figure out how to play it without tabs or sheet music
            </p>
          </div>
        </div>
      </div>

      {/* Guitar Types */}
      <div className="mb-16">
        <h2 className="text-3xl md:text-4xl font-special text-green-600 mb-8 text-center">
          Guitar Types We'll Explore
        </h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-green-50 p-6 rounded-lg border-2 border-green-300">
            <h3 className="text-2xl font-special text-green-700 mb-4">🎸 Acoustic Guitar</h3>
            <p className="text-gray-700 mb-4">
              Perfect for beginners and versatile for any style. Great for strumming, fingerpicking, and accompanying vocals.
            </p>
            <ul className="text-left text-gray-700 space-y-1 text-sm">
              <li>• Folk and singer-songwriter styles</li>
              <li>• Rich, warm tone</li>
              <li>• No amplification needed</li>
              <li>• Great for songwriting</li>
            </ul>
          </div>
          <div className="bg-green-50 p-6 rounded-lg border-2 border-green-300">
            <h3 className="text-2xl font-special text-green-700 mb-4">⚡ Electric Guitar</h3>
            <p className="text-gray-700 mb-4">
              Ideal for rock, blues, jazz, and contemporary styles. Offers endless tonal possibilities and effects.
            </p>
            <ul className="text-left text-gray-700 space-y-1 text-sm">
              <li>• Rock, blues, and jazz styles</li>
              <li>• Effects and amplification</li>
              <li>• Lead guitar and soloing</li>
              <li>• Band performance</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Musical Styles */}
      <div className="mb-16">
        <h2 className="text-3xl md:text-4xl font-special text-green-600 mb-8 text-center">
          Musical Styles We'll Explore
        </h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-yellow-50 p-6 rounded-lg border-2 border-green-200">
            <h3 className="text-2xl font-special text-green-700 mb-4">🎵 Folk & Acoustic</h3>
            <p className="text-gray-700">
              Beautiful fingerpicking patterns, strumming techniques, and the art of accompanying your voice with rich harmonies.
            </p>
          </div>
          <div className="bg-yellow-50 p-6 rounded-lg border-2 border-green-200">
            <h3 className="text-2xl font-special text-green-700 mb-4">🎸 Rock & Blues</h3>
            <p className="text-gray-700">
              Power chords, blues progressions, and the techniques that make electric guitar so expressive and powerful.
            </p>
          </div>
          <div className="bg-yellow-50 p-6 rounded-lg border-2 border-green-200">
            <h3 className="text-2xl font-special text-green-700 mb-4">🎼 Jazz & Classical</h3>
            <p className="text-gray-700">
              Sophisticated harmonies, complex chord voicings, and the refined techniques of jazz and classical guitar.
            </p>
          </div>
          <div className="bg-yellow-50 p-6 rounded-lg border-2 border-green-200">
            <h3 className="text-2xl font-special text-green-700 mb-4">🎤 Contemporary</h3>
            <p className="text-gray-700">
              Modern pop, indie, and alternative styles, learning to play the music you love and create your own contemporary pieces.
            </p>
          </div>
        </div>
      </div>

      {/* Skill Development Path */}
      <div className="mb-16">
        <h2 className="text-3xl md:text-4xl font-special text-green-600 mb-8 text-center">
          Your Guitar Journey
        </h2>
        <div className="space-y-6">
          <div className="bg-yellow-50 p-6 rounded-lg border-2 border-green-200">
            <h3 className="text-xl font-special text-green-700 mb-2">Month 1-2: Foundation</h3>
            <p className="text-gray-700">
              Learn basic chords, strumming patterns, and simple songs. Build confidence and develop proper technique from the start.
            </p>
          </div>
          <div className="bg-yellow-50 p-6 rounded-lg border-2 border-green-200">
            <h3 className="text-xl font-special text-green-700 mb-2">Month 3-6: Building Skills</h3>
            <p className="text-gray-700">
              Master barre chords, fingerpicking, and more complex songs. Start developing your own style and musical preferences.
            </p>
          </div>
          <div className="bg-yellow-50 p-6 rounded-lg border-2 border-green-200">
            <h3 className="text-xl font-special text-green-700 mb-2">Month 6-12: Expanding Horizons</h3>
            <p className="text-gray-700">
              Explore lead guitar, improvisation, and advanced techniques. Begin writing your own music and developing your unique voice.
            </p>
          </div>
          <div className="bg-yellow-50 p-6 rounded-lg border-2 border-green-200">
            <h3 className="text-xl font-special text-green-700 mb-2">1+ Years: Mastery</h3>
            <p className="text-gray-700">
              Advanced techniques, performance skills, and the confidence to play in any musical setting. Your guitar becomes an extension of your musical expression.
            </p>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="text-center bg-green-600 text-white p-8 rounded-lg">
        <h2 className="text-3xl md:text-4xl font-special mb-4">
          Ready to Master the Guitar?
        </h2>
        <p className="text-xl mb-6">
          Start your guitar journey and discover the joy of creating music with six strings
        </p>
        <div className="space-x-4">
          <a 
            href="/contact" 
            className="inline-block bg-yellow-400 text-green-800 px-8 py-3 rounded-lg font-bold text-lg hover:bg-yellow-300 transition-colors"
          >
            Start Guitar Lessons
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