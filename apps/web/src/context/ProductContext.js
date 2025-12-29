"use client";

import { createContext, useContext, useState } from "react";

const ProductContext = createContext();

export const useProduct = () => useContext(ProductContext);

export const ProductProvider = ({ children }) => {
  const [productId, setProductId] = useState(null);
  const [priceId, setPriceId] = useState(null);
  const [featureId, setFeatureId] = useState(null);
  const [featureName, setFeatureName] = useState(null);
  const [freeTrialAvailable, setFreeTrialAvailable] = useState(false);
  const [freeFeaturesAvailable, setFreeFeaturesAvailable] = useState(false);
  const [betaTesting, setBetaTesting] = useState(false);

  return (
    <ProductContext.Provider
      value={{
        productId,
        setProductId,
        priceId,
        setPriceId,
        featureId,
        setFeatureId,
        featureName,
        setFeatureName,
        freeTrialAvailable,
        setFreeTrialAvailable,
        freeFeaturesAvailable,
        setFreeFeaturesAvailable,
        betaTesting,
        setBetaTesting,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};
