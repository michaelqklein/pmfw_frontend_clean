export default function PianoPage() {
  return (
    <div className="reactive-container">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-6xl font-special text-green-600 mb-6">
          Piano Lessons
        </h1>
        <p className="text-xl md:text-2xl text-gray-700 max-w-3xl mx-auto">
          Master the piano with a creative approach that goes beyond traditional sheet music reading
        </p>
      </div>

      {/* Why Learn Piano */}
      <div className="mb-16">
        <h2 className="text-3xl md:text-4xl font-special text-green-600 mb-8 text-center">
          Why Learn Piano?
        </h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-yellow-50 p-6 rounded-lg border-2 border-green-200">
            <h3 className="text-2xl font-special text-green-700 mb-4">🎹 Foundation for All Music</h3>
            <p className="text-gray-700">
              Piano provides the best foundation for understanding music theory, harmony, and composition. It's the perfect starting point for any musical journey.
            </p>
          </div>
          <div className="bg-yellow-50 p-6 rounded-lg border-2 border-green-200">
            <h3 className="text-2xl font-special text-green-700 mb-4">🎵 Visual Learning</h3>
            <p className="text-gray-700">
              The piano's layout makes music theory visual and intuitive. You can see relationships between notes, chords, and scales in a way that's impossible on other instruments.
            </p>
          </div>
          <div className="bg-yellow-50 p-6 rounded-lg border-2 border-green-200">
            <h3 className="text-2xl font-special text-green-700 mb-4">🎼 Versatility</h3>
            <p className="text-gray-700">
              From classical to jazz, pop to blues, the piano can handle any musical style. It's both a solo and accompaniment instrument.
            </p>
          </div>
          <div className="bg-yellow-50 p-6 rounded-lg border-2 border-green-200">
            <h3 className="text-2xl font-special text-green-700 mb-4">🎯 Creative Expression</h3>
            <p className="text-gray-700">
              Develop your unique musical voice through improvisation, composition, and personal interpretation of music.
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
              I believe piano education should be about more than just reading notes. My approach combines traditional technique with creative exploration, helping you develop both the skills to play existing music and the confidence to create your own.
            </p>
            <p className="text-lg text-gray-700 mb-6">
              We start with fundamental skills like proper hand position and basic technique, but quickly move into making music that sounds good and feels rewarding. You'll learn to play by ear, improvise, and understand the theory behind what you're playing.
            </p>
            <p className="text-lg text-gray-700">
              Whether you're interested in classical piano, jazz improvisation, or contemporary styles, I'll help you develop the skills and musical understanding to pursue your interests.
            </p>
          </div>
        </div>
      </div>

      {/* What We'll Cover */}
      <div className="mb-16">
        <h2 className="text-3xl md:text-4xl font-special text-green-600 mb-8 text-center">
          What We'll Cover in Piano Lessons
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-yellow-50 p-6 rounded-lg border-2 border-green-200">
            <h3 className="text-xl font-special text-green-700 mb-3">🎯 Technique</h3>
            <p className="text-gray-700 text-sm">
              Proper hand position, finger independence, and efficient movement patterns for smooth, expressive playing
            </p>
          </div>
          <div className="bg-yellow-50 p-6 rounded-lg border-2 border-green-200">
            <h3 className="text-xl font-special text-green-700 mb-3">🎵 Reading Music</h3>
            <p className="text-gray-700 text-sm">
              Learn to read sheet music efficiently, but always with the goal of understanding what you're playing
            </p>
          </div>
          <div className="bg-yellow-50 p-6 rounded-lg border-2 border-green-200">
            <h3 className="text-xl font-special text-green-700 mb-3">🎼 Playing by Ear</h3>
            <p className="text-gray-700 text-sm">
              Develop the ability to hear a melody and play it on the piano without needing sheet music
            </p>
          </div>
          <div className="bg-yellow-50 p-6 rounded-lg border-2 border-green-200">
            <h3 className="text-xl font-special text-green-700 mb-3">🎹 Chord Progressions</h3>
            <p className="text-gray-700 text-sm">
              Master common chord patterns and learn to accompany yourself or others with rich harmonies
            </p>
          </div>
          <div className="bg-yellow-50 p-6 rounded-lg border-2 border-green-200">
            <h3 className="text-xl font-special text-green-700 mb-3">🎶 Improvisation</h3>
            <p className="text-gray-700 text-sm">
              Learn to create music spontaneously, developing your musical vocabulary and creative confidence
            </p>
          </div>
          <div className="bg-yellow-50 p-6 rounded-lg border-2 border-green-200">
            <h3 className="text-xl font-special text-green-700 mb-3">🎤 Performance Skills</h3>
            <p className="text-gray-700 text-sm">
              Build confidence in playing for others, managing performance anxiety, and connecting with your audience
            </p>
          </div>
        </div>
      </div>

      {/* Skill Levels */}
      <div className="mb-16">
        <h2 className="text-3xl md:text-4xl font-special text-green-600 mb-8 text-center">
          All Skill Levels Welcome
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-green-50 p-6 rounded-lg border-2 border-green-300 text-center">
            <h3 className="text-2xl font-special text-green-700 mb-4">🎯 Beginner</h3>
            <p className="text-gray-700 mb-4">
              No prior experience needed. We'll start with the basics and build a solid foundation.
            </p>
            <ul className="text-left text-gray-700 space-y-1 text-sm">
              <li>• Basic hand position</li>
              <li>• Simple melodies</li>
              <li>• Basic chords</li>
              <li>• Music reading fundamentals</li>
            </ul>
          </div>
          <div className="bg-green-50 p-6 rounded-lg border-2 border-green-300 text-center transform scale-105">
            <h3 className="text-2xl font-special text-green-700 mb-4">🎵 Intermediate</h3>
            <p className="text-gray-700 mb-4">
              For students with some piano experience looking to expand their skills and creativity.
            </p>
            <ul className="text-left text-gray-700 space-y-1 text-sm">
              <li>• Advanced technique</li>
              <li>• Complex pieces</li>
              <li>• Improvisation skills</li>
              <li>• Music theory application</li>
            </ul>
          </div>
          <div className="bg-green-50 p-6 rounded-lg border-2 border-green-300 text-center">
            <h3 className="text-2xl font-special text-green-700 mb-4">🎼 Advanced</h3>
            <p className="text-gray-700 mb-4">
              For experienced pianists looking to refine their artistry and develop their unique voice.
            </p>
            <ul className="text-left text-gray-700 space-y-1 text-sm">
              <li>• Performance preparation</li>
              <li>• Advanced composition</li>
              <li>• Style development</li>
              <li>• Professional skills</li>
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
            <h3 className="text-2xl font-special text-green-700 mb-4">🎼 Classical</h3>
            <p className="text-gray-700">
              Masterpieces from Bach to Debussy, developing technique and musical interpretation through the great composers.
            </p>
          </div>
          <div className="bg-yellow-50 p-6 rounded-lg border-2 border-green-200">
            <h3 className="text-2xl font-special text-green-700 mb-4">🎵 Jazz</h3>
            <p className="text-gray-700">
              Learn jazz harmony, improvisation, and the rhythmic feel that makes jazz so compelling and expressive.
            </p>
          </div>
          <div className="bg-yellow-50 p-6 rounded-lg border-2 border-green-200">
            <h3 className="text-2xl font-special text-green-700 mb-4">🎸 Pop & Contemporary</h3>
            <p className="text-gray-700">
              Modern songs and arrangements, learning to play the music you love and create your own contemporary pieces.
            </p>
          </div>
          <div className="bg-yellow-50 p-6 rounded-lg border-2 border-green-200">
            <h3 className="text-2xl font-special text-green-700 mb-4">🎹 Blues & Gospel</h3>
            <p className="text-gray-700">
              Soulful music that teaches emotional expression, groove, and the power of simple, effective musical ideas.
            </p>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="text-center bg-green-600 text-white p-8 rounded-lg">
        <h2 className="text-3xl md:text-4xl font-special mb-4">
          Ready to Master the Piano?
        </h2>
        <p className="text-xl mb-6">
          Start your piano journey and discover the joy of creating music at the keys
        </p>
        <div className="space-x-4">
          <a 
            href="/contact" 
            className="inline-block bg-yellow-400 text-green-800 px-8 py-3 rounded-lg font-bold text-lg hover:bg-yellow-300 transition-colors"
          >
            Start Piano Lessons
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