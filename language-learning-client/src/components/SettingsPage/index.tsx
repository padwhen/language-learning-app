import { TOUR_CONFIGS } from "@/config/tourConfigs"
import { UserContext } from "@/contexts/UserContext"
import { useProfileEdit } from "@/state/hooks/useProfileEdit"
import { useSettingsData } from "@/state/hooks/useSettingsData"
import { useTour } from "@/state/hooks/useTour"
import { getXpProgress } from "@/utils/xpCalculations"
import { useContext } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import ProfilePicture from "./ProfilePicture"
import { StatsCard } from "./StatsCard"
import { StreakCard } from "./StreakCard"
import { AchievementsCard } from "./AchivementsCard"
import { PersonalInfoCard } from "./PersonalInfoCard"
import { TourOverlay } from "@/composables/TourOverlay"
import { LearningPreferences } from "./LearningPreferences"

export const SettingsPage = () => {
  const { user } = useContext(UserContext)
  const { loginHistory, xpHistory, loading } = useSettingsData()
  const tourProps = useTour(TOUR_CONFIGS.settings)
  const profileEditProps = useProfileEdit()
  const xpProgress = getXpProgress(user)

  // CONVERTS INTO DATES
  const loginDays: Date[] = loginHistory?.loginDatesArray
  ? loginHistory.loginDatesArray.map((d) => new Date(d))
  : []

  // Transforms the XP history data into a flattened array of experience events
  // Each event contains the date it occurred, the formatted action name (capitalized with spaces), 
  // and the XP amount earned. If no history exists, returns empty array.
  const experienceHistory = xpHistory?.xpHistory
    ? xpHistory.xpHistory.flatMap((day) =>
        day.events.map((event) => ({
          date: day.date,
          action: event.eventType.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
          xp: event.xpAmount,
        }))
      )
    : [];

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen bg-white pt-8">
      <div className="w-full max-w-screen-2xl mx-auto p-6 space-y-6 bg-white rounded-2xl shadow-lg overflow-auto">
        <h1 className="text-3xl font-bold flex items-center gap-3">⚙️ Settings</h1>
        {/* Profile Picture Card */}
        <Card className={`overflow-hidden transition-all duration-300 ${
          tourProps.highlightedElement === 'profile-picture' ? 'ring-4 ring-blue-500 ring-opacity-75 shadow-lg' : ''
        }`}>
          <CardHeader>
            <CardTitle>Profile Picture</CardTitle>
            <p className="text-sm text-slate-600">Choose your avatar from our Moomin collection!</p>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-4">
              <ProfilePicture
                selectedAvatar={profileEditProps.selectedAvatar}
                setSelectedAvatar={profileEditProps.setSelectedAvatar}
              />
            </div>
          </CardContent>
        </Card>
        {/* User Stats with Experience and Streak */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <StatsCard
            user={user}
            xpProgress={xpProgress}
            experienceHistory={experienceHistory}
            highlightedElement={tourProps.highlightedElement}
          />
          <StreakCard user={user} loginDays={loginDays} />
        </div>

        {/* Achievements */}
        <AchievementsCard highlightedElement={tourProps.highlightedElement} />

        {/* Personal Information */}
        <PersonalInfoCard
          highlightedElement={tourProps.highlightedElement}
          formData={profileEditProps.formData}
          editMode={profileEditProps.editMode}
          showPassword={profileEditProps.showPassword}
          isEditing={profileEditProps.isEditing}
          onInputChange={profileEditProps.handleInputChange}
          onToggleEdit={profileEditProps.toggleEdit}
          onTogglePasswordVisibility={() => profileEditProps.setShowPassword(!profileEditProps.showPassword)}
          onSaveChanges={profileEditProps.saveChanges}
        />
        <LearningPreferences
          flashcardWordForm={user?.flashcardWordForm || 'original'} 
          handleFlashcardFormChange={profileEditProps.handleFlashcardFormChange}
        />
      </div>

      {tourProps.isTourActive && (
        <TourOverlay
          currentStep={tourProps.currentStep}
          totalSteps={tourProps.totalSteps}
          steps={tourProps.steps}
          onNext={tourProps.handleNext}
          onPrev={tourProps.handlePrev}
          onSkip={tourProps.handleSkip}
          onFinish={tourProps.handleFinish}
        />
      )}
    </div>
  )
}