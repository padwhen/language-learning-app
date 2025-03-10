import { useContext, useEffect, useState } from "react";
import { useError } from "@/state/hooks/useError";
import { useToast } from "@/components/ui/use-toast";
import { UserContext } from "@/contexts/UserContext";
import { Link } from "react-router-dom";
import axios, { AxiosError } from "axios";
import { Separator } from "../ui/separator";
import { ToastAction } from "../ui/toast";
import ProfilePicture from "./ProfilePicture";
import EditableField from "./EditableField";
import ErrorAlert from "./ErrorAlert";
import UpdateButton from "./UpdateButton";
import { UserStats } from "./UserStats";

export const SettingPage = () => {
  const { user, setUser, refreshUserStats } = useContext(UserContext);
  console.log(user)
  const { error, handleError } = useError();
  const { toast } = useToast();

  const defaultAvatarUrl = "https://github.com/shadcn.png";
  const initialAvatarUrl = user?.avatarUrl ?? defaultAvatarUrl;

  const [selectedAvatar, setSelectedAvatar] = useState<string>(initialAvatarUrl);
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState({
    name: user?.name || "",
    username: user?.username || "",
  });
  const [focusField, setFocusField] = useState<"name" | "username" | "">("");

  useEffect(() => {
    if (user) {
      setUserData({ name: user.name, username: user.username });
      setSelectedAvatar(user.avatarUrl ?? defaultAvatarUrl);
    }
  }, [user]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>, field: string) => {
    setUserData((prevData) => ({ ...prevData, [field]: event.target.value }));
  };

  const handleEditClick = (field: "name" | "username") => {
    setIsEditing(!isEditing);
    setFocusField(field);
  };

  const handleUpdate = async () => {
    try {
      const updatedUser = { ...userData, avatarUrl: selectedAvatar };
      const { data } = await axios.put("/update", updatedUser);
      setUser(data);
      const countdown = 3;
      toast({
        title: "Update successfully!",
        description: `Reload to the front page in ${countdown} seconds`,
        action: (
          <Link to={"/"}>
            <ToastAction altText="Reload now">Reload now</ToastAction>
          </Link>
        ),
      });
      setTimeout(() => {
        window.location.replace("/");
      }, 3000);
    } catch (error) {
      const axiosError = error as AxiosError;
      if (axiosError.response && (axiosError.response.data as any)?.error) {
        handleError("Username already exists. Try another username.");
      } else {
        handleError("Error updating to the server. Try again later!");
      }
    }
  };

  const hasChanges =
    user?.name !== userData.name ||
    user?.username !== userData.username ||
    user?.avatarUrl !== selectedAvatar;

  return (
    <div className="pt-4 md:pt-16">
      <div className="container w-full flex flex-col bg-white z-10 py-2 md:py-4 px-4 md:px-32">
        <h1 className="text-3xl md:text-5xl font-bold">Settings 🛠️</h1>
        <div className="pt-4 md:pt-8">
          <h2 className="md:text-2xl text-xl text-gray-500">Personal Information</h2>
          <div className="border rounded-md p-4 md:p-6 mt-4 space-y-6">
            {/* Profile Picture Section */}
            <ProfilePicture
              selectedAvatar={selectedAvatar}
              setSelectedAvatar={setSelectedAvatar}
            />
            <Separator className="my-6" />

            {/* User Stats Section */}
            {user && <UserStats user={user} refreshUserStats={refreshUserStats} />}
            <Separator className="my-6" />

            {/* Editable Fields Section */}
            <EditableField
              label="Name"
              value={userData.name}
              field="name"
              isEditing={isEditing && focusField === "name"}
              onEditClick={handleEditClick}
              onChange={handleInputChange}
            />
            <Separator className="my-6" />
            <EditableField
              label="Username"
              value={userData.username}
              field="username"
              isEditing={isEditing && focusField === "username"}
              onEditClick={handleEditClick}
              onChange={handleInputChange}
            />
          </div>

          {/* Error and Update Button Section */}
          <div className="mt-6 flex flex-col md:flex-row justify-between items-center gap-4">
            {error && <ErrorAlert error={error} />}
            <div className="md:ml-auto">
              {hasChanges && <UpdateButton onClick={handleUpdate} />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};