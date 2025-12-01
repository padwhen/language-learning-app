import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import ProfilePicture from "../ProfilePicture";

interface ProfilePictureCardProps {
  selectedAvatar: string;
  setSelectedAvatar: (url: string) => void;
  highlightedElement?: string | null;
}

export const ProfilePictureCard = ({ 
  selectedAvatar, 
  setSelectedAvatar, 
  highlightedElement 
}: ProfilePictureCardProps) => {
  return (
    <Card className={`overflow-hidden transition-all duration-300 ${
      highlightedElement === 'profile-picture' ? 'ring-4 ring-blue-500 ring-opacity-75 shadow-lg' : ''
    }`}>
      <CardHeader>
        <CardTitle>Profile Picture</CardTitle>
        <p className="text-sm text-slate-600">Choose your avatar from our Moomin collection!</p>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 mb-4">
          <ProfilePicture
            selectedAvatar={selectedAvatar}
            setSelectedAvatar={setSelectedAvatar}
          />
        </div>
      </CardContent>
    </Card>
  );
}; 