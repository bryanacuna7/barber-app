'use client';

/**
 * Tour Provider
 * Context provider for interactive product tours
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { TourContextValue, TourState, TourDefinition, TourStep } from './types';
import { getTourById } from './tour-definitions';

const TourContext = createContext<TourContextValue | undefined>(undefined);

interface TourProviderProps {
  children: React.ReactNode;
  businessId: string;
}

export function TourProvider({ children, businessId }: TourProviderProps) {
  const [state, setState] = useState<TourState>({
    activeTourId: null,
    currentStepIndex: 0,
    isRunning: false,
    completedTours: new Set<string>(),
  });

  // Fetch completed tours on mount
  useEffect(() => {
    if (!businessId) return;

    fetch('/api/tours')
      .then((res) => res.json())
      .then((data) => {
        if (data.tours) {
          const completed = new Set(
            data.tours.filter((t: any) => t.completed).map((t: any) => t.tour_id)
          );
          setState((prev) => ({ ...prev, completedTours: completed }));
        }
      })
      .catch((err) => console.error('Failed to fetch tour progress:', err));
  }, [businessId]);

  const startTour = useCallback((tourId: string) => {
    const tour = getTourById(tourId);
    if (!tour) {
      console.error(`Tour not found: ${tourId}`);
      return;
    }

    setState({
      activeTourId: tourId,
      currentStepIndex: 0,
      isRunning: true,
      completedTours: state.completedTours,
    });
  }, [state.completedTours]);

  const nextStep = useCallback(() => {
    setState((prev) => {
      const tour = prev.activeTourId ? getTourById(prev.activeTourId) : null;
      if (!tour) return prev;

      const nextIndex = prev.currentStepIndex + 1;
      if (nextIndex >= tour.steps.length) {
        // Last step reached
        return prev;
      }

      return { ...prev, currentStepIndex: nextIndex };
    });
  }, []);

  const previousStep = useCallback(() => {
    setState((prev) => {
      if (prev.currentStepIndex === 0) return prev;
      return { ...prev, currentStepIndex: prev.currentStepIndex - 1 };
    });
  }, []);

  const skipTour = useCallback(() => {
    setState((prev) => ({
      ...prev,
      activeTourId: null,
      currentStepIndex: 0,
      isRunning: false,
    }));
  }, []);

  const completeTour = useCallback(async () => {
    if (!state.activeTourId) return;

    try {
      // Save completion to backend
      await fetch('/api/tours', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tourId: state.activeTourId,
          completed: true,
        }),
      });

      // Update local state
      setState((prev) => {
        const newCompleted = new Set(prev.completedTours);
        newCompleted.add(prev.activeTourId!);

        return {
          ...prev,
          activeTourId: null,
          currentStepIndex: 0,
          isRunning: false,
          completedTours: newCompleted,
        };
      });
    } catch (err) {
      console.error('Failed to complete tour:', err);
      // Still mark as complete locally even if API fails
      setState((prev) => {
        const newCompleted = new Set(prev.completedTours);
        newCompleted.add(prev.activeTourId!);

        return {
          ...prev,
          activeTourId: null,
          currentStepIndex: 0,
          isRunning: false,
          completedTours: newCompleted,
        };
      });
    }
  }, [state.activeTourId]);

  const isTourCompleted = useCallback(
    (tourId: string) => {
      return state.completedTours.has(tourId);
    },
    [state.completedTours]
  );

  const getCurrentTour = useCallback((): TourDefinition | null => {
    if (!state.activeTourId) return null;
    return getTourById(state.activeTourId) || null;
  }, [state.activeTourId]);

  const getCurrentStep = useCallback((): TourStep | null => {
    const tour = getCurrentTour();
    if (!tour) return null;
    return tour.steps[state.currentStepIndex] || null;
  }, [getCurrentTour, state.currentStepIndex]);

  const value: TourContextValue = {
    ...state,
    startTour,
    nextStep,
    previousStep,
    skipTour,
    completeTour,
    isTourCompleted,
    getCurrentTour,
    getCurrentStep,
  };

  return <TourContext.Provider value={value}>{children}</TourContext.Provider>;
}

/**
 * Hook to use tour context
 */
export function useTour() {
  const context = useContext(TourContext);
  if (context === undefined) {
    throw new Error('useTour must be used within a TourProvider');
  }
  return context;
}
