export default function FAQPage() {
  return (
    <div className="reactive-container">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-6xl font-special text-green-600 mb-6">
          Frequently Asked Questions
        </h1>
        <p className="text-xl md:text-2xl text-gray-700 max-w-3xl mx-auto">
          Everything you need to know about starting your musical journey with me
        </p>
      </div>

      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-yellow-50 p-6 rounded-lg border-2 border-green-200">
          <h3 className="text-2xl font-special text-green-700 mb-3">
            Where are in-person lessons held?
          </h3>
          <p className="text-gray-700">
            In-person lessons are held at my teaching studio located at{' '}
            <span className="font-bold text-lg text-green-700 bg-green-100 px-3 py-1 rounded">
              40 Durham Avenue, PL4 8SP Plymouth
            </span>
            . The studio is equipped with quality instruments and provides a comfortable, inspiring environment for learning.
          </p>
        </div>

        <div className="bg-yellow-50 p-6 rounded-lg border-2 border-green-200">
          <h3 className="text-2xl font-special text-green-700 mb-3">
            How do online lessons compare to in-person lessons?
          </h3>
          <p className="text-gray-700">
            Online lessons offer the same quality of instruction with added convenience. I use high-quality video and audio, screen sharing for music notation, and can record sessions for your review. The main difference is the physical distance, but the learning experience remains excellent.
          </p>
        </div>

        <div className="bg-yellow-50 p-6 rounded-lg border-2 border-green-200">
          <h3 className="text-2xl font-special text-green-700 mb-3">
            How do I schedule and pay for lessons?
          </h3>
          <p className="text-gray-700">
            To book your first lesson, please use the{' '}
            <a href="/contact" className="text-green-600 hover:text-green-700 underline font-semibold">
              contact form
            </a>
            . For payment, I accept cash after the lesson or bank transfer before the lesson. I offer flexible scheduling and can arrange weekly, bi-weekly, or flexible lesson arrangements.
          </p>
        </div>

        <div className="bg-yellow-50 p-6 rounded-lg border-2 border-green-200">
          <h3 className="text-2xl font-special text-green-700 mb-3">
            What makes your teaching approach different?
          </h3>
          <p className="text-gray-700">
            I focus on developing your musical intuition and creativity rather than just teaching you to read sheet music. My approach combines practical theory with immediate application, helping you understand not just what to play, but why it sounds good and how to create your own music.
          </p>
        </div>

        <div className="bg-yellow-50 p-6 rounded-lg border-2 border-green-200">
          <h3 className="text-2xl font-special text-green-700 mb-3">
            Do I need to own an instrument to start lessons?
          </h3>
          <p className="text-gray-700">
            While it's ideal to have your own instrument for practice, I can help you choose the right instrument to start with. For online lessons, you'll need access to an instrument, but for in-person lessons, I can provide instruments during the lesson if needed.
          </p>
        </div>

        <div className="bg-yellow-50 p-6 rounded-lg border-2 border-green-200">
          <h3 className="text-2xl font-special text-green-700 mb-3">
            How often should I take lessons?
          </h3>
          <p className="text-gray-700">
            Most students benefit from weekly lessons, but I'm flexible and can work with your schedule. Beginners often start with weekly lessons to build momentum, while more advanced students might prefer bi-weekly sessions. The key is consistent practice between lessons.
          </p>
        </div>

        <div className="bg-yellow-50 p-6 rounded-lg border-2 border-green-200">
          <h3 className="text-2xl font-special text-green-700 mb-3">
            What age groups do you teach?
          </h3>
          <p className="text-gray-700">
            I teach students of all ages, from young children (6+) to adults. My approach adapts to each student's learning style and experience level. For younger students, I incorporate more games and interactive elements to keep them engaged.
          </p>
        </div>

        <div className="bg-yellow-50 p-6 rounded-lg border-2 border-green-200">
          <h3 className="text-2xl font-special text-green-700 mb-3">
            Can I learn multiple instruments at once?
          </h3>
          <p className="text-gray-700">
            Absolutely! Many students study multiple instruments with me. In fact, learning piano alongside another instrument can greatly enhance your understanding of music theory and improve your overall musicianship. I can structure lessons to cover multiple instruments efficiently.
          </p>
        </div>

        <div className="bg-yellow-50 p-6 rounded-lg border-2 border-green-200">
          <h3 className="text-2xl font-special text-green-700 mb-3">
            Do you offer group lessons or just private instruction?
          </h3>
          <p className="text-gray-700">
            I primarily offer private lessons to provide personalized attention, but I can arrange small group sessions for families or friends who want to learn together. Group lessons can be a great way to learn while sharing the experience with others.
          </p>
        </div>

        <div className="bg-yellow-50 p-6 rounded-lg border-2 border-green-200">
          <h3 className="text-2xl font-special text-green-700 mb-3">
            How long will it take me to see progress?
          </h3>
          <p className="text-gray-700">
            Most students notice improvement within the first few weeks, especially in their understanding of music and ability to create simple melodies. The rate of progress depends on your practice time and natural musical aptitude, but consistent practice leads to steady improvement.
          </p>
        </div>

        <div className="bg-yellow-50 p-6 rounded-lg border-2 border-green-200">
          <h3 className="text-2xl font-special text-green-700 mb-3">
            What materials or books do I need to purchase?
          </h3>
          <p className="text-gray-700">
            I'll recommend specific materials based on your goals and current level, but I try to keep additional costs minimal. Many of my teaching materials are digital and provided during lessons. I focus on practical learning rather than expensive textbooks.
          </p>
        </div>
      </div>

      <div className="text-center mt-16">
        <h2 className="text-3xl font-special text-green-700 mb-4">
          Still Have Questions?
        </h2>
        <p className="text-lg text-gray-700 mb-6">
          I'm here to help! Contact me directly to discuss your specific needs and get personalized answers.
        </p>
        <a 
          href="/contact" 
          className="inline-block bg-green-600 text-white px-8 py-3 rounded-lg font-bold text-lg hover:bg-green-700 transition-colors"
        >
          Get in Touch
        </a>
      </div>
    </div>
  );
} 