import { useState, useEffect } from 'react';

export interface UserData {
  age?: string;
  name?: string;
  gender?: string;
}

const ONBOARDING_STORAGE_KEY = 'onboarding_completed';
const USER_DATA_STORAGE_KEY = 'user_data';

export function useOnboarding() {
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean>(() => {
    const completed = localStorage.getItem(ONBOARDING_STORAGE_KEY);
    return completed === 'true';
  });

  const [userData, setUserData] = useState<UserData>(() => {
    const stored = localStorage.getItem(USER_DATA_STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return {};
      }
    }
    return {};
  });

  const completeOnboarding = (data: UserData) => {
    // Sauvegarder les données utilisateur
    localStorage.setItem(USER_DATA_STORAGE_KEY, JSON.stringify(data));
    setUserData(data);

    // Marquer l'onboarding comme complété
    localStorage.setItem(ONBOARDING_STORAGE_KEY, 'true');
    setHasCompletedOnboarding(true);
  };

  const resetOnboarding = () => {
    localStorage.removeItem(ONBOARDING_STORAGE_KEY);
    localStorage.removeItem(USER_DATA_STORAGE_KEY);
    setHasCompletedOnboarding(false);
    setUserData({});
  };

  const updateUserData = (data: Partial<UserData>) => {
    const newData = { ...userData, ...data };
    localStorage.setItem(USER_DATA_STORAGE_KEY, JSON.stringify(newData));
    setUserData(newData);
  };

  return {
    hasCompletedOnboarding,
    userData,
    completeOnboarding,
    resetOnboarding,
    updateUserData
  };
}