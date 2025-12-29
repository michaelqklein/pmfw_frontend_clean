'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import FreeTrialOrUpgradePopUp from './FreeTrialOrUpgradePopUp';
import { checkAccess } from '@/src/utils/checkAccess';
import Card from './Card';
import { useProduct } from "@/src/context/ProductContext";
import { useAuth } from '@/src/context/AuthContext'; // Access currentUser

const INTERVAL_TRAINER_PRODUCT_ID = process.env.NEXT_PUBLIC_INTERVAL_TRAINER_PRODUCT_ID;
const INTERVAL_TRAINER_PRICE_ID = process.env.NEXT_PUBLIC_INTERVAL_TRAINER_PRICE_ID;
const MELODY_BRICKS_PRODUCT_ID = process.env.NEXT_PUBLIC_MELODY_BRICKS_PRODUCT_ID;
const MELODY_BRICKS_PRICE_ID = process.env.NEXT_PUBLIC_MELODY_BRICKS_PRICE_ID;

const TrainingMenu = () => {
  const router = useRouter();
  const { currentUser } = useAuth();
  const { setProductId } = useProduct();
  const { setPriceId } = useProduct();
  const { setFeatureId } = useProduct();
  const { setFeatureName } = useProduct();
  const { setFreeTrialAvailable } = useProduct();
  // const { setFreeFeaturesAvailable } = useProduct();
  const { setBetaTesting } = useProduct();

  const [addedMessage, setAddedMessage] = useState(null);
  const [showFreeTrialPopUp, setShowFreeTrialPopUp] = useState(false);
  const [freeTrialOption, setFreeTrialOption] = useState(false);

  const handleAccess = async ({
    featureName,
    featureId,
    productId,
    priceId,
    freeTrialAvailable,
    freeFeaturesAvailable,
    betaTesting,
    successRedirect,
  }) => {
    if (!((featureName === 'Audiation Studio') || (featureName === 'Melody Bricks'))) {
      if (!currentUser) {
        router.push('/not-logged-in');
        return;
      }
    }

    try {
      const userId = currentUser?.user_ID;

      // Set product context values
      /* console.log('Setting product context:', {
        productId,
        priceId,
        featureId,
        featureName,
        freeTrialAvailable,
        freeFeaturesAvailable,
        betaTesting,
      }); */

      setProductId(productId);
      // console.log("Incoming priceId:", priceId);
      setPriceId(priceId);
      setFeatureId(featureId);
      setFeatureName(featureName);
      setFreeTrialAvailable(freeTrialAvailable);
      setBetaTesting(betaTesting);

      if (freeFeaturesAvailable) {
        router.push(successRedirect);
      }
      else {

        // Optional: call your backend to confirm access
        const { access, freeTrialAvailable: trialOption, message } = await checkAccess(userId, featureId, featureName);

        setFreeTrialOption(trialOption); // local state for UI
        setAddedMessage(message); // optional UI message

        if (access) {
          router.push(successRedirect);
        } else {
          setShowFreeTrialPopUp(true);
        }
      }
    } catch (error) {
      console.error(`Error checking access to ${featureName}:`, error);
      alert(`An error occurred while checking your access to ${featureName}.`);
    }
  };

  const cards = [
    {
      title: 'Audiation Studio',
      image: '/images/GeminiEarTrainer.jpeg',
              text: 'Audiation Studio — It is time to get serious about ear training.',
      onClick: () =>
        handleAccess({
          featureName: 'Audiation Studio',
          featureId: 2, // use the actual feature ID for Interval Trainer
          productId: INTERVAL_TRAINER_PRODUCT_ID,
          priceId: INTERVAL_TRAINER_PRICE_ID,
          freeTrialAvailable: false,
          freeFeaturesAvailable: true,
          betaTesting: false,
          successRedirect: '/audiation-studio',
        }),

    },
    // ,
    // {
    //   title: 'neuroZart',
    //   image: '/images/Gemini_neuroZart.jpeg',
    //   text: 'AI-based Ear trainer that minimizes training time and maximizes learning effectivness',
    //   onClick: () =>
    //     handleAccess({
    //       featureName: 'neuroZart',
    //       featureId: 3, // use the actual feature ID for Interval Trainer
    //       productId: 'prod_SGBQizu4QZrs6l',
    //       priceId: 'price_1RLf53B3tFamvVaTgMgpEikt',
    //       freeTrialAvailable: false,
    //       freeFeaturesAvailable: true,
    //       betaTesting: false,
    //       successRedirect: '/coming-soon',
    //     }),
    // },

    // {
    //   title: 'Ear Training Beginner Level',
    //   image: '/images/Gemini_EarTrainingCourse.jpeg',
    //   text: 'This course teaches you to recognize ascending, descending, and harmonic intervals',
    //   onClick: () =>
    //     handleAccess({
    //       featureName: 'Audiation Studio',
    //       featureId: 4, // use the actual feature ID for Interval Trainer
    //       productId: 'prod_SGBQizu4QZrs6l',
    //       priceId: 'price_1RLf53B3tFamvVaTgMgpEikt',
    //       freeTrialAvailable: false,
    //       freeFeaturesAvailable: true,
    //       betaTesting: false,
    //       // successRedirect: '/courses/ear-training-for-beginners',
    //       successRedirect: '/coming-soon',
    //     }),
    // },
    /* {
      title: 'Piano Improvisation for Beginners',
      image: '/images/coming_soon.png',
      text: 'Free piano improvisation taster lesson', 
      onClick: () =>
        handleAccess({
          featureName: 'Piano Improvisation for Beginners',
          featureId: 4, // use the actual feature ID for Interval Trainer
          productId: 'prod_SGBQizu4QZrs6l',
          priceId: 'price_1RLf53B3tFamvVaTgMgpEikt',
          freeTrialAvailable: false,
          freeFeaturesAvailable: true,
          betaTesting: false,
          successRedirect: '/courses/piano-improvisation-for-beginners',
        }),
    } */

    // {
    //   title: 'meloAliens',
    //   image: '/images/KeyCommanderI.png',
    //   text: 'Train your ear by playing a fun space shooter game',
    //   onClick: () =>
    //     handleAccess({
    //       featureName: 'Key Commander I',
    //       featureId: 1,
    //       productId: 'prod_SGOq4CAMFbcQTq',
    //       priceId: 'price_1RLf53B3tFamvV',
    //       freeTrialAvailable: true,
    //       freeFeaturesAvailable: true,
    //       betaTesting: true,
    //       successRedirect: '/coming-soon',
    //       // successRedirect: '/key-commander-i',
    //     }),
    // },
    {
      title: 'Melody Bricks',
      image: '/images/MelodyBricks.jpeg',
      text: 'Train your ear by playing a fun brick stacking game',
      onClick: () =>
        handleAccess({
          featureName: 'Melody Bricks',
          featureId: 1,
          productId: null,
          priceId: null,
          freeTrialAvailable: true,
          freeFeaturesAvailable: true,
          betaTesting: true,
          successRedirect: '/melody-bricks',
        }),
    }
    /*  {
       title: '1-1 Online Lessons',
       image: '/images/BookLesson.jpg',
       text: 'Play by Ear. The price for a 1-hour private lesson is £40.',
       onClick: () => router.push('/contact'),
     }, */
    /*  {
       title: 'Course: Play by Ear, Melodies, Beginner Level',
       image: '/images/BookLesson.jpg',
       text: 'Play by Ear. The price for group lesson course of 10 lessons is £100.',
       onClick: () => router.push('/contact'),
     }, */
  ];

  return (
    <div className="min-h-screen flex justify-center items-start p-4 sm:p-8 lg:p-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 w-full max-w-6xl">
        {/* Melody Bricks Card with Container */}
        <div className="text-base w-full mx-auto px-3 sm:px-6 py-4 sm:py-8 bg-yellow-50 border-2 border-[#a49480] rounded-2xl shadow-2xl shadow-black/100 overflow-hidden">
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold text-center mb-3 sm:mb-4">
            Melody Bricks
          </h1>
          <h2 className="text-lg sm:text-2xl md:text-3xl font-bold text-center mb-4 sm:mb-6">
            Become addicted to a game that improves your musical ear.
          </h2>

          {/* Primary action buttons */}
          <div className="flex flex-row flex-wrap justify-center gap-3 sm:gap-6 mb-4 sm:mb-6">
            {/* Android / Play Store - left */}
            <div className="flex flex-col items-center">
              <span className="text-xs sm:text-sm font-semibold tracking-wide mb-1">
                android phone:
              </span>
              <a
                href="https://play.google.com/store/apps/details?id=com.playmusicfromwithin.melodybricks.premium"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-[144px] sm:w-[248px] transform transition-all duration-150 hover:scale-105 active:scale-100"
              >
                <img
                  src="/images/GetItOnPlayStore.png"
                  alt="Get it on Google Play"
                  className="block w-full h-auto"
                />
              </a>
            </div>

            {/* iPhone / Desktop - right */}
            <div className="flex flex-col items-center">
              <span className="text-xs sm:text-sm font-semibold tracking-wide mb-1">
                iphone / desktop:
              </span>
              <button
                onClick={() => router.push('/melody-bricks')}
                className="font-rubik block w-[130px] sm:w-[225px] inline-flex items-center justify-center px-5 rounded-lg bg-black text-white text-base sm:text-3xl font-normal h-10 sm:h-16 leading-none mt-2 sm:mt-4 transform transition-all duration-150 hover:scale-105 active:scale-100"
              >
                Play on Web
              </button>
            </div>
          </div>

          {/* Screenshot and bullet points side by side */}
          <div className="mt-2 sm:mt-4 flex flex-row flex-wrap items-start gap-3 sm:gap-6">
            {/* Screenshot on the left */}
            <div className="w-[160px] sm:w-[160px] md:w-1/2">
              <img
                src="/images/MB_Game_Canvas_Screenshot_1.png"
                alt="Melody Bricks gameplay screenshot"
                className="w-full max-h-56 sm:max-h-60 md:max-h-[26rem] object-contain rounded-xl"
              />
            </div>

            {/* Bullet points and slogans on the right */}
            <div className="flex-1 md:w-1/2 flex flex-col space-y-2 sm:space-y-3 text-xs sm:text-base md:text-lg">
              <div className="flex items-center">
                <span className="w-2 h-2 sm:w-3 sm:h-3 bg-blue-600 rounded-full mr-4 flex-shrink-0"></span>
                <span>This game rewires your musical intuition.</span>
              </div>
              <div className="flex items-center">
                <span className="w-2 h-2 sm:w-3 sm:h-3 bg-blue-600 rounded-full mr-4 flex-shrink-0"></span>
                <span>Start hearing. Start playing by ear.</span>
              </div>
              <div className="flex items-center">
                <span className="w-2 h-2 sm:w-3 sm:h-3 bg-blue-600 rounded-full mr-4 flex-shrink-0"></span>
                <span>Real musical progress - fast.</span>
              </div>
              <div className="flex items-center">
                <span className="w-2 h-2 sm:w-3 sm:h-3 bg-blue-600 rounded-full mr-4 flex-shrink-0"></span>
                <span>So much fun, you forget it's practise.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Audiation Studio Card with Container */}
        <div className="text-base w-full mx-auto px-3 sm:px-6 py-4 sm:py-8 bg-yellow-50 border-2 border-[#a49480] rounded-2xl shadow-2xl shadow-black/100 overflow-hidden">
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold text-center mb-3 sm:mb-4">
            Audiation Studio
          </h1>
          <h2 className="text-lg sm:text-2xl md:text-3xl font-bold text-center mb-4 sm:mb-6">
            Unlock your musical potential with daily 5-minute ear training sessions.
          </h2>
          
          {/* Bullet points */}
          <div className="flex flex-col space-y-3 sm:space-y-4 text-base sm:text-lg md:text-xl mb-4 sm:mb-6">
            <div className="flex items-center">
              <span className="w-2 h-2 bg-green-600 rounded-full mr-4"></span>
              <span>Informative performance tracking</span>
            </div>
            <div className="flex items-center">
              <span className="w-2 h-2 bg-green-600 rounded-full mr-4"></span>
              <span>Simple & enjoyable interface</span>
            </div>
            <div className="flex items-center">
              <span className="w-2 h-2 bg-green-600 rounded-full mr-4"></span>
              <span>Suitable for all skill levels</span>
            </div>
          </div>
          
          {/* Try Free Link */}
          <button
            onClick={() => router.push('/audiation-studio')}
            className="text-lg sm:text-xl font-semibold text-green-600 hover:text-green-800 hover:underline transition-colors duration-200 cursor-pointer mb-4 sm:mb-6 block"
          >
            Try Audiation Studio free.
          </button>
          
          <Card
            title={cards[0].title}
            imageUrl={cards[0].image}
            text={cards[0].text}
            onClick={cards[0].onClick}
          />
        </div>
      </div>

      {showFreeTrialPopUp && (
        <FreeTrialOrUpgradePopUp
          addedMessage={addedMessage}
          setShowFreeTrialPopUp={setShowFreeTrialPopUp}
        //setCurrentPage={(page) => router.push(`/${page}`)}
        />
      )}
    </div>
  );
};

export default TrainingMenu;
