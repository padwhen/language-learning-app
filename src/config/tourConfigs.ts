import { TourStep } from "@/state/hooks/useTour";

interface TourConfig {
  totalSteps: number;
  stepHighlights: (string | null)[];
  steps: TourStep[];
}

export const TOUR_CONFIGS: Record<string, TourConfig> = {
  settings: {
    totalSteps: 4,
    stepHighlights: [
      'profile-picture', 
      'user-stats', 
      'achievements', 
      'personal-info'
    ],
    steps: [
      {
        title: "Settings Tour",
        description: "Welcome to your Settings page! Let's explore the key features."
      },
      {
        title: "User Statistics",
        description: "Here you can view your experience points and learning streak."
      },
      {
        title: "Achievements",
        description: "Check out your recent achievements and milestones."
      },
      {
        title: "Personal Information",
        description: "Update your personal information and account details."
      }
    ]
  },
  index: {
    totalSteps: 8,
    stepHighlights: [
      null, 
      'translation-bar', 
      'input-bar', 
      'translation', 
      'word-details', 
      'user-header', 
      'deck-info', 
      null
    ],
    steps: [
      {
        title: "Welcome Tour",
        description: "Welcome! Let's take a quick tour of the main features."
      },
      {
        title: "Translation Bar",
        description: "Select your source language here."
      },
      {
        title: "Input Area",
        description: "Type or paste the text you want to translate."
      },
      {
        title: "Translation Result",
        description: "Your translation will appear here."
      },
      {
        title: "Word Details",
        description: "Click on words to see detailed explanations."
      },
      {
        title: "User Profile",
        description: "Access your profile and settings here."
      },
      {
        title: "Deck Information",
        description: "View and manage your learning decks."
      },
      {
        title: "Tour Complete",
        description: "You're all set! Start learning languages now."
      }
    ]
  }
} as const;