'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import FreeTrialOrUpgradePopUp from './FreeTrialOrUpgradePopUp';
import { checkAccess } from '@/src/utils/checkAccess';
import Card from './Card';
import { useProduct } from "@/src/context/ProductContext";
import { useAuth } from '@/src/context/AuthContext';

const INTERVAL_TRAINER_PRODUCT_ID = process.env.NEXT_PUBLIC_INTERVAL_TRAINER_PRODUCT_ID;
const INTERVAL_TRAINER_PRICE_ID = process.env.NEXT_PUBLIC_INTERVAL_TRAINER_PRICE_ID;

const AudiationStudioLaunch = () => {
  const router = useRouter();
  const { currentUser } = useAuth();
  const { setProductId } = useProduct();
  const { setPriceId } = useProduct();
  const { setFeatureId } = useProduct();
  const { setFeatureName } = useProduct();
  const { setFreeTrialAvailable } = useProduct();
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
    if (!(featureName === 'Audiation Studio')) {
      if (!currentUser) {
        router.push('/not-logged-in');
        return;
      }
    }

    try {
      const userId = currentUser?.user_ID;

      setProductId(productId);
      setPriceId(priceId);
      setFeatureId(featureId);
      setFeatureName(featureName);
      setFreeTrialAvailable(freeTrialAvailable);
      setBetaTesting(betaTesting);

      if (freeFeaturesAvailable) {
        router.push(successRedirect);
      }
      else {
        const { access, freeTrialAvailable: trialOption, message } = await checkAccess(userId, featureId, featureName);

        setFreeTrialOption(trialOption);
        setAddedMessage(message);

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
      text: 'Audiation Studio - Is is time to get serious about ear training.',
      onClick: () =>
        handleAccess({
          featureName: 'Audiation Studio',
          featureId: 2,
          productId: INTERVAL_TRAINER_PRODUCT_ID,
          priceId: INTERVAL_TRAINER_PRICE_ID,
          freeTrialAvailable: false,
          freeFeaturesAvailable: true,
          betaTesting: false,
          successRedirect: '/audiation-studio',
        }),
    }
  ];

  return (
    <div className="min-h-screen flex flex-col items-center px-4">
      {/* Content Container */}
      <div className="reactive-container">
        {/* Heading */}
        <h1 className="text-3xl md:text-4xl font-bold text-center mb-6">
          Unlock your musical potential with daily 5-minute ear training sessions.
        </h1>
        
        {/* Mobile/Desktop Notice */}
        <div className="bg-yellow-100 border border-yellow-400 shadow-amber-900 rounded-lg pt-4 px-2 pb-0 mb-6 text-center">
          <p className="text-sm md:text-base">
            For the best experience try the desktop version.
            Mobile improvements are coming soon. A mobile app is in development — thank you for testing!
          </p>
        </div>
        
        {/* Main content area */}
        <div className="flex flex-col md:flex-row items-start justify-center gap-2 w-full">
          {/* Bullet points and Try Free Link */}
          <div className="flex flex-col space-y-4 text-lg md:text-xl md:mr-32">
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
            
            {/* Try Free Link */}
            <button
              onClick={() => router.push('/audiation-studio')}
              className="mt-8 text-xl font-semibold text-green-600 hover:text-green-800 hover:underline transition-colors duration-200 cursor-pointer text-left"
            >
              Try Audiation Studio free.
            </button>
          </div>
          
          {/* Card */}
          <div className="flex justify-center">
            {cards.map(({ title, image, text, onClick }) => (
              <Card
                key={title}
                title={title}
                imageUrl={image}
                text={text}
                onClick={onClick}
              />
            ))}
          </div>
        </div>
      </div>

      {showFreeTrialPopUp && (
        <FreeTrialOrUpgradePopUp
          addedMessage={addedMessage}
          setShowFreeTrialPopUp={setShowFreeTrialPopUp}
        />
      )}
    </div>
  );
};

export default AudiationStudioLaunch; 