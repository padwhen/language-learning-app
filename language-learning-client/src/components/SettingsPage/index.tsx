import { useContext, useState, useEffect } from "react";
import { UserContext } from "@/contexts/UserContext";
import { useSettingsData, useTour } from "./hooks";
import { 
  ProfilePictureCard, 
  UserStatsCard, 
  AchievementsCard, 
  PersonalInfoCard, 
  TourOverlay 
} from "./components";

export const SettingPage = () => {
  const { user, setUser, refreshUserStats } = useContext(UserContext);
  const defaultAvatarUrl = "https://github.com/shadcn.png";
  const initialAvatarUrl = user?.avatarUrl ?? defaultAvatarUrl;

  const [selectedAvatar, setSelectedAvatar] = useState<string>(initialAvatarUrl);

  // Update selectedAvatar when user changes
  useEffect(() => {
    setSelectedAvatar(user?.avatarUrl ?? defaultAvatarUrl);
  }, [user?.avatarUrl]);

  // Custom hooks
  const { loginHistory, xpHistory, loading } = useSettingsData(user?._id);
  const tourProps = useTour();

  console.log(user);

  // Derived data
  const loginDays: Date[] = loginHistory?.loginDatesArray
    ? loginHistory.loginDatesArray.map((d) => new Date(d))
    : [];

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
    return (
      <div>Loading...</div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-8">
      <div className="w-full max-w-screen-2xl mx-auto p-6 space-y-6 bg-white rounded-2xl shadow-lg overflow-auto">
        <h1 className="text-3xl font-bold flex items-center gap-3">⚙️ Settings</h1>

        {/* Profile Picture Card */}
        <ProfilePictureCard
          selectedAvatar={selectedAvatar}
          setSelectedAvatar={setSelectedAvatar}
          highlightedElement={tourProps.highlightedElement}
        />

        {/* User Stats Card */}
        <UserStatsCard
          user={user}
          loginDays={loginDays}
          experienceHistory={experienceHistory}
          highlightedElement={tourProps.highlightedElement}
        />

        {/* Achievements Card */}
        <AchievementsCard
          user={user}
          highlightedElement={tourProps.highlightedElement}
        />

        {/* Personal Information Card */}
        <PersonalInfoCard
          user={user}
          setUser={setUser}
          refreshUserStats={refreshUserStats}
          selectedAvatar={selectedAvatar}
          highlightedElement={tourProps.highlightedElement}
        />
      </div>

      {/* Tour Overlay */}
      {tourProps.isTourActive && (
        <TourOverlay {...tourProps} />
      )}
    </div>
  );
};