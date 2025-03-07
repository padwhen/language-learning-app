import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import jsonData from "../../avatarurl.json";

interface ProfilePictureProps {
  selectedAvatar: string;
  setSelectedAvatar: (url: string) => void;
}

const ProfilePicture = ({ selectedAvatar, setSelectedAvatar }: ProfilePictureProps) => {
  const handleClick = (newAvatarUrl: string) => {
    setSelectedAvatar(newAvatarUrl);
  };

  const getCharacterName = (avatarUrl: string) => {
    const characterName = Object.entries(jsonData).find(([_key, value]) => value === avatarUrl)?.[0];
    return characterName?.replace(/_/g, " ");
  };

  return (
    <div>
      <h1 className="ml-4 font-bold">Profile Picture</h1>
      <div className="flex flex-col md:flex-row items-center">
        <div className="flex-col mb-4 md:mb-0">
          <Avatar className="w-24 h-24 md:w-32 md:h-32 m-2 md:m-4 md:mr-8" key={selectedAvatar}>
            <AvatarImage src={selectedAvatar} alt="Profile Picture" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          <div className="text-center">{getCharacterName(selectedAvatar)}</div>
        </div>
        <div className="flex flex-wrap md:gap-4 gap-2 justify-center">
          {Object.entries(jsonData).map(([characterName, avatarUrl]) => (
            <Avatar
              key={characterName}
              className={`md:w-16 md:h-16 w-12 h-12 cursor-pointer border rounded-full ${
                avatarUrl === selectedAvatar ? "opacity-10" : ""
              }`}
              onClick={() => handleClick(avatarUrl)}
            >
              <AvatarImage src={avatarUrl} alt={characterName} />
              <AvatarFallback>{characterName.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProfilePicture;