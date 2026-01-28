/**
 * Tour System Types
 * Defines types for interactive product tours
 */

export interface TourStep {
  /** Unique identifier for the step */
  id: string;
  /** Target element selector (CSS selector) */
  target: string;
  /** Title of the tooltip */
  title: string;
  /** Description text */
  content: string;
  /** Placement of the tooltip relative to target */
  placement?: 'top' | 'bottom' | 'left' | 'right';
  /** Whether to show spotlight/highlight on target */
  spotlight?: boolean;
  /** Whether this is the last step */
  isLastStep?: boolean;
}

export interface TourDefinition {
  /** Unique identifier for the tour */
  id: string;
  /** Display name */
  name: string;
  /** Tour description */
  description: string;
  /** Array of tour steps */
  steps: TourStep[];
  /** Auto-start tour on first visit */
  autoStart?: boolean;
}

export interface TourProgress {
  business_id: string;
  tour_id: string;
  completed: boolean;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface TourState {
  /** Currently active tour ID */
  activeTourId: string | null;
  /** Current step index */
  currentStepIndex: number;
  /** Whether tour is running */
  isRunning: boolean;
  /** Completed tours (cached from API) */
  completedTours: Set<string>;
}

export interface TourContextValue extends TourState {
  /** Start a tour */
  startTour: (tourId: string) => void;
  /** Go to next step */
  nextStep: () => void;
  /** Go to previous step */
  previousStep: () => void;
  /** Skip/exit current tour */
  skipTour: () => void;
  /** Complete current tour and save progress */
  completeTour: () => Promise<void>;
  /** Check if a tour has been completed */
  isTourCompleted: (tourId: string) => boolean;
  /** Get current tour definition */
  getCurrentTour: () => TourDefinition | null;
  /** Get current step */
  getCurrentStep: () => TourStep | null;
}
