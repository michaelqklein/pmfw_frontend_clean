export default function LessonsPage() {
  return (
    <div className="reactive-container">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-6xl font-special text-green-600 mb-6">
          Music Lessons
        </h1>
        <p className="text-xl md:text-2xl text-gray-700 max-w-3xl mx-auto">
          Unlock your musical potential with personalized instruction that goes beyond traditional music education
        </p>
      </div>

      {/* What I Teach Section */}
      <div className="mb-16">
        <h2 className="text-3xl md:text-4xl font-special text-green-600 mb-8 text-center">
          What I Teach
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-yellow-50 p-6 rounded-lg border-2 border-green-200">
            <h3 className="text-2xl font-special text-green-700 mb-4">🎹 Piano</h3>
            <p className="text-gray-700">
              From classical technique to jazz improvisation, learn to express yourself through the piano with a focus on creativity and musical understanding.
            </p>
          </div>
          <div className="bg-yellow-50 p-6 rounded-lg border-2 border-green-200">
            <h3 className="text-2xl font-special text-green-700 mb-4">🎤 Vocals</h3>
            <p className="text-gray-700">
              Develop your singing voice through proper technique, ear training, and learning to connect emotionally with your music.
            </p>
          </div>
          <div className="bg-yellow-50 p-6 rounded-lg border-2 border-green-200">
            <h3 className="text-2xl font-special text-green-700 mb-4">🎸 Guitar</h3>
            <p className="text-gray-700">
              Master acoustic and electric guitar with emphasis on creativity and musical understanding.
            </p>
          </div>
          <div className="bg-yellow-50 p-6 rounded-lg border-2 border-green-200">
            <h3 className="text-2xl font-special text-green-700 mb-4">✍️ Songwriting</h3>
            <p className="text-gray-700">
              Learn to craft compelling melodies, lyrics, and arrangements that capture your personal experiences and emotions.
            </p>
          </div>
          <div className="bg-yellow-50 p-6 rounded-lg border-2 border-green-200">
            <h3 className="text-2xl font-special text-green-700 mb-4">🎼 Composing</h3>
            <p className="text-gray-700">
              Create original music from scratch, learning to develop musical ideas and structure them into complete compositions.
            </p>
          </div>
          <div className="bg-yellow-50 p-6 rounded-lg border-2 border-green-200">
            <h3 className="text-2xl font-special text-green-700 mb-4">🎵 Music Theory</h3>
            <p className="text-gray-700">
              Understand the language of music through practical application, helping you make informed creative decisions.
            </p>
          </div>
        </div>
      </div>

      {/* Lesson Formats */}
      <div className="mb-16">
        <h2 className="text-3xl md:text-4xl font-special text-green-600 mb-8 text-center">
          Lesson Formats
        </h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-green-50 p-8 rounded-lg border-2 border-green-300 text-center">
            <h3 className="text-3xl font-special text-green-700 mb-4">🏠 In-Person Lessons</h3>
            <p className="text-gray-700 mb-6 text-lg">
              Traditional face-to-face instruction in a comfortable, inspiring environment in Plymouth UK, close to the city centre. 
              Ideal for hands-on learning and immediate feedback.
            </p>
            <ul className="text-left text-gray-700 space-y-2">
              <li>• Direct physical guidance</li>
              <li>• Access to quality instruments</li>
              <li>• Immediate hands-on correction</li>
              <li>• Personal connection and rapport</li>
            </ul>
          </div>
          <div className="bg-green-50 p-8 rounded-lg border-2 border-green-300 text-center">
            <h3 className="text-3xl font-special text-green-700 mb-4">🌐 Online Lessons</h3>
            <p className="text-gray-700 mb-6 text-lg">
              Convenient virtual lessons from anywhere in the world using video conferencing technology. 
              Perfect for busy schedules and remote learning.
            </p>
            <ul className="text-left text-gray-700 space-y-2">
              <li>• High-quality video and audio</li>
              <li>• Screen sharing for music notation</li>
              <li>• Flexible scheduling</li>
              <li>• Recorded sessions for review</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div className="mb-16">
        <h2 className="text-3xl md:text-4xl font-special text-green-600 mb-8 text-center">
          Investment in Your Musical Journey
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-yellow-50 p-6 rounded-lg border-2 border-green-200 text-center">
            <h3 className="text-2xl font-special text-green-700 mb-4">30-Minute Lesson</h3>
            <p className="text-4xl font-bold text-green-600 mb-2">£17</p>
            <p className="text-xs text-gray-500 mb-2">($21.6 / €19.8)</p>
            <p className="text-gray-700 mb-4">Ideal for children or regular lessons on a lower budget</p>
          </div>
          <div className="bg-green-50 p-6 rounded-lg border-2 border-green-300 text-center transform scale-105">
            <h3 className="text-2xl font-special text-green-700 mb-4">45-Minute Lesson</h3>
            <p className="text-4xl font-bold text-green-600 mb-2">£24.50</p>
            <p className="text-xs text-gray-500 mb-2">($31.2 / €28.6)</p>
            <p className="text-gray-700 mb-4">Most popular option for comprehensive learning</p>
          </div>
          <div className="bg-yellow-50 p-6 rounded-lg border-2 border-green-200 text-center">
            <h3 className="text-2xl font-special text-green-700 mb-4">1-Hour Lesson</h3>
            <p className="text-4xl font-bold text-green-600 mb-2">£32</p>
            <p className="text-xs text-gray-500 mb-2">($40.7 / €37.3)</p>
            <p className="text-gray-700 mb-4">Intensive sessions for serious students. Recommended for singing lessons.</p>
          </div>
        </div>

      </div>

      {/* Teaching Philosophy */}
      <div className="mb-16 bg-gradient-to-r from-green-50 to-yellow-50 p-8 rounded-lg border-2 border-green-200">
        <h2 className="text-3xl md:text-4xl font-special text-green-600 mb-6 text-center">
          My Teaching Philosophy
        </h2>
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-lg text-gray-700 mb-6">
            I believe music education should be about more than just reading notes on a page. 
            My approach focuses on developing your musical intuition, creativity, and ability to express yourself through sound.
          </p>
          <p className="text-lg text-gray-700 mb-6">
            Whether you're a complete beginner or an experienced musician looking to expand your skills, 
            I'll help you develop a deep understanding of music that goes beyond traditional methods.
          </p>
          <p className="text-lg text-gray-700">
            My goal is to help you find your unique musical voice and give you the tools to bring your musical ideas to life.
          </p>
        </div>
      </div>

      {/* Call to Action */}
      <div className="text-center bg-green-600 text-white p-8 rounded-lg">
        <h2 className="text-3xl md:text-4xl font-special mb-4">
          Ready to Start Your Musical Journey?
        </h2>
        <p className="text-xl mb-6">
          Contact me to schedule your first lesson or learn more about my teaching approach
        </p>
        <div className="space-x-4">
          <a 
            href="/contact" 
            className="inline-block bg-yellow-400 text-green-800 px-8 py-3 rounded-lg font-bold text-lg hover:bg-yellow-300 transition-colors"
          >
            Get Started
          </a>
          <a 
            href="/lessons/faq" 
            className="inline-block bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg font-bold text-lg hover:bg-white hover:text-green-600 transition-colors"
          >
            Learn More
          </a>
        </div>
      </div>
    </div>
  );
}