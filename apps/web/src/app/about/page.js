// File: src/app/key-commander-i/page.js

export default function AboutPage() {
  return (
    <div className="reactive-container">
      {/* Personal photo at top */}
      <div className="photo-container mb-4">
        <img
          src="/images/face_and_mic.jpeg"
          alt="Michael, founder of Play Music from Within"
          className="rounded-full w-32 h-32 mx-auto"
        />
      </div>

      <p>
        Hi, I’m <strong>Michael</strong> — the musician, music teacher, and developer 
        behind <strong> Play Music from Within </strong>. 
        Since I was a kid, I have loved music. However, when I was young 
        (and naive and full of drive), I was never really 
        interested in playing music that already existed. 
        I wanted to create my own music. 
        Or I just wanted to play.
        However, my initial music education was traditional and focused almost exclusively on 
        teaching me how to read sheet music. 
        
        Reading music is certainly an important tool,
        but the strong focus on replicating sheet music as it is prevalent in western musical 
        education can stamp 
        out the urge (and eventually also the ability) of children 
        (and adults) to express themselves freely through music. 
        Frustrated with music eduction, I learned music mostly on my own through a lot 
        of trial and error, which is a very slow (but fun) process.
        </p>

      <p>
        Now I am a music teacher myself. What do I teach besides reading music? I teach 
        music theory, but in a very applied and immediate way. 
        I teach my students how they can create music,
        improvise, and make what they feel manifest itself in music.
        </p>
       
      <p>
        So, whether you’re a budding composer, a parent nurturing a young musician, or someone 
        who just loves creating, my mission is to help you tap into your inner creative voice and bring it to life.
        Having a good ear for music - understanding how the music in your head can be brought to life is one
        of the most important skills you can develop as a musician, especially as a composer or improvisor.
      </p>

      <p>
      How can you connect what you hear to the mechanics 
      or your instruments? Like with most music related skills, you need regular practice.
        I always teach ear training in my music classes, but realized that while my students 
        enjoyed it, they couldn’t practice it at home as it requires a second person or an ear training tool
        Most ear trainers out there are a bit dull and often have an overcomplicated user interface while
        not giving you feedback on your overall progress.
        I created <strong>Audiation Studio</strong> to be an easy to use and fun, but at the same time very effective tool 
        to train your ear. It provides you immediate feedback that tells you where your abilities are and what 
        you need to practise.       
        </p>

      <p>
        Try the free trainer. Feel free to contact me if you have any questions or feedback or suggestions. 
        I’m here to support you on your musical journey of self-discovery and creativity every step of the way.
      </p>
    </div>
  );
}
