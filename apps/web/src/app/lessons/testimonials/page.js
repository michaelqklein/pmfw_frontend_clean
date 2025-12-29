export default function TestimonialsPage() {
  return (
    <div className="reactive-container">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-6xl font-special text-green-600 mb-6">
          Student Testimonials
        </h1>
        <p className="text-xl md:text-2xl text-gray-700 max-w-3xl mx-auto">
          Hear from students who have transformed their musical journey with my teaching approach
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-16">
        <div className="bg-yellow-50 p-6 rounded-lg border-2 border-green-200">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-xl mr-4">
              S
            </div>
            <div>
              <h3 className="text-xl font-special text-green-700">Stella</h3>
              <p className="text-gray-600">Mother of Danai (9), Piano Student</p>
            </div>
          </div>
          <div className="flex mb-3">
            {[...Array(5)].map((_, i) => (
              <span key={i} className="text-yellow-500 text-xl">★</span>
            ))}
          </div>
          <p className="text-gray-700 italic">
            "Michael has been an excellent piano teacher for my 9-years-old daughter. Danai was looking so forward to his visit each week. His positive, encouraging and fun teaching style made lessons enjoyable while keeping my daughter focused and engaged until the last minute of the lesson. I highly recommend Michael to anyone."
          </p>
          <p className="text-sm text-gray-500 mt-2">Plymouth, UK</p>
        </div>

        <div className="bg-yellow-50 p-6 rounded-lg border-2 border-green-200">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-xl mr-4">
              R
            </div>
            <div>
              <h3 className="text-xl font-special text-green-700">Robert Merrison-Hort</h3>
              <p className="text-gray-600">Guitar Student</p>
            </div>
          </div>
          <div className="flex mb-3">
            {[...Array(5)].map((_, i) => (
              <span key={i} className="text-yellow-500 text-xl">★</span>
            ))}
          </div>
          <p className="text-gray-700 italic">
            "Being an almost complete newcomer to playing guitar (or any instrument) I was quite nervous to start lessons. However, Michael has the gift of being an extremely patient teacher who is also able to gently push me beyond my comfort zone to develop new techniques; as a result my playing has come on a great deal already. I love Michael's fluid style of teaching – although he prepares a plan for each lesson they are often more like free flowing conversations that end up going in different and interesting directions. He has a deep knowledge and passion for music that is infectious, and I always leave feeling full of enthusiasm and that I've learnt a lot. Highly recommended!"
          </p>
          <p className="text-sm text-gray-500 mt-2">Newton Abbot, UK</p>
        </div>

        <div className="bg-yellow-50 p-6 rounded-lg border-2 border-green-200">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-xl mr-4">
              T
            </div>
            <div>
              <h3 className="text-xl font-special text-green-700">Tracy Picton Evans</h3>
              <p className="text-gray-600">Mother of Madeleine (11)</p>
            </div>
          </div>
          <div className="flex mb-3">
            {[...Array(5)].map((_, i) => (
              <span key={i} className="text-yellow-500 text-xl">★</span>
            ))}
          </div>
          <p className="text-gray-700 italic">
            "Michael is absolutely brilliant with our daughter. He is patient and thorough ensuring that she fully understands before moving on. She is full of excitement after the lesson."
          </p>
          <p className="text-sm text-gray-500 mt-2">Plymouth, UK</p>
        </div>

        <div className="bg-yellow-50 p-6 rounded-lg border-2 border-green-200">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-xl mr-4">
              M
            </div>
            <div>
              <h3 className="text-xl font-special text-green-700">Martha Nash</h3>
              <p className="text-gray-600">Guitar & Theory Student</p>
            </div>
          </div>
          <div className="flex mb-3">
            {[...Array(5)].map((_, i) => (
              <span key={i} className="text-yellow-500 text-xl">★</span>
            ))}
          </div>
          <p className="text-gray-700 italic">
            "I have been playing guitar for many years, and wanted to learn more about theory, using both keyboard and guitar. Michael asked me how much I already knew and went through the basics in a way that was logical and flowing, at a pace that was right for me. He has a very good understanding of talking about theoretical concepts in a way I can relate to, and was patient when I asked him questions. Highly recommended to all!"
          </p>
          <p className="text-sm text-gray-500 mt-2">Plymouth, UK</p>
        </div>

        <div className="bg-yellow-50 p-6 rounded-lg border-2 border-green-200">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-xl mr-4">
              W
            </div>
            <div>
              <h3 className="text-xl font-special text-green-700">Wendy Easton</h3>
              <p className="text-gray-600">Grandmother of Olivia (11)</p>
            </div>
          </div>
          <div className="flex mb-3">
            {[...Array(5)].map((_, i) => (
              <span key={i} className="text-yellow-500 text-xl">★</span>
            ))}
          </div>
          <p className="text-gray-700 italic">
            "Michael has been working with my 11 year old granddaughter for a year. Originally this was weekly face to face lessons but when covid hit we transferred over to weekly lessons via zoom. It has been surprising how effective this remote learning has been. Michael is able to demonstrate playing techniques during the session and the lessons are highly interactive. He is able to gauge my granddaughter's mood and will tailor the lesson accordingly by sometimes making the lesson less formal and more chilled by encouraging her to use improvisation to help her relax and express her emotions through music. He has a real love and enthusiasm for music which comes across in his teaching. He is really patient and makes the lessons fun. He is always encouraging and will gently push her to try new techniques without putting any pressure on her. He also makes the learning modern by using basic versions of her favourite songs, so she can see her own progression."
          </p>
          <p className="text-sm text-gray-500 mt-2">Plymouth, UK</p>
        </div>

        <div className="bg-yellow-50 p-6 rounded-lg border-2 border-green-200">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-xl mr-4">
              M
            </div>
            <div>
              <h3 className="text-xl font-special text-green-700">Mary McKay</h3>
              <p className="text-gray-600">Grandmother of Isaac (7)</p>
            </div>
          </div>
          <div className="flex mb-3">
            {[...Array(5)].map((_, i) => (
              <span key={i} className="text-yellow-500 text-xl">★</span>
            ))}
          </div>
          <p className="text-gray-700 italic">
            "Amazing children's teacher – really knows how to bring out the best in a child."
          </p>
          <p className="text-sm text-gray-500 mt-2">Plymouth, UK</p>
        </div>
      </div>

      <div className="bg-green-50 p-8 rounded-lg border-2 border-green-200 text-center">
        <h2 className="text-3xl font-special text-green-700 mb-4">
          Ready to Join These Success Stories?
        </h2>
        <p className="text-lg text-gray-700 mb-6">
          Every student starts somewhere. Let me help you discover your musical potential and create your own success story.
        </p>
        <a 
          href="/contact" 
          className="inline-block bg-green-600 text-white px-8 py-3 rounded-lg font-bold text-lg hover:bg-green-700 transition-colors"
        >
          Start Your Musical Journey
        </a>
      </div>
    </div>
  );
} 