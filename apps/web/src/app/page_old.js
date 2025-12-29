'use client';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  const handleStartTraining = () => {
    router.push('/training-menu');
  };

  return (
    <div className="w-full flex flex-col items-center pt-8 sm:pt-0">
      {/* Logo container - bigger on mobile */}
      <div className="relative w-80 h-80 sm:w-80 sm:h-60 md:w-[600px] md:h-[600px]">
        <Image
          src="/PMFW_logo_2025_05_03.png"
          alt="Play Music from Within (Logo)"
          fill
          className="object-contain"
          priority
        />
      </div>

      {/* Headline */}

      <p className="text-sm sm:text-base md:text-2xl lg:text-3xl text-center lg:-mt-10 md:-mt-10 sm:mt-0 -mt-5">
        Innovative Musical Training
      </p>

      {/* Button: responsive sizing */}
    {/*   <button
        className="mt-4 px-6 py-2 text-sm sm:text-base md:text-lg lg:text-xl bg-green-700 text-white rounded shadow hover:bg-green-600 transition"
        onClick={handleStartTraining}
      >
        Start Free Ear Training Now
      </button> */}
    </div>
  );


} 