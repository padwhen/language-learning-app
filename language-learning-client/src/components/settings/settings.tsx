import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import jsonData from "../../avatarurl.json"; 
import { useContext, useEffect, useState } from "react";
import { Separator } from "../ui/separator";
import { Button } from "../ui/button";
import { ChangeEvent } from "@/types";
import { Input } from "../ui/input";
import { UserContext } from "@/UserContext";
import axios from "axios";


export const SettingPage = () => {
    const { user, setUser } = useContext(UserContext);
    useEffect(() => {
        if (user) {
            setUserData({ name: user.name, username: user.username });
        }
    }, [user]);    
    const defaultAvatarUrl = "https://github.com/shadcn.png";
    const [selectedAvatar, setSelectedAvatar] = useState(user?.avatarUrl ?? defaultAvatarUrl);
    const [isEditing, setIsEditing] = useState(false)
    const [hasChanges, setHasChanges] = useState(false)
    const [userData, setUserData] = useState({
        name: user?.name, username: user?.username
    })
    const [focusField, setFocusField] = useState<"name" | "username" | "">("")

    const handleClick = (newAvatarUrl: string) => {
        setSelectedAvatar(newAvatarUrl);
        setHasChanges(true)
    };

    const getCharacterName = (avatarUrl: string) => {
        const characterName = Object.entries(jsonData).find(([_key, value]) => value === avatarUrl)?.[0];
        return characterName?.replace(/_/g, " ");
    };

    const handleInputChange = (event: ChangeEvent, field: string) => {
        setUserData((prevData) => ({...prevData, [field]: event.target.value}))
        setHasChanges(true)
    }

    const handleEditClick = (field: "name" | "username") => {
        setIsEditing(!isEditing)
        setFocusField(field)
    }

    const handleUpdate = async () => {
        try {
            const updatedUser = {...userData, avatarUrl: selectedAvatar}
            const { data } = await axios.put('/update', updatedUser)
            setUser(data)
        } catch (error) {
            console.error("Error updating user: ", error)
        }
    }

    return (
        <div className="pt-16">
        <div className="container sticky top-0 w-full flex flex-col justify-between bg-white z-10 py-4 px-32">
            <h1 className="text-5xl font-bold">Settings 🛠️</h1>
            <div className="pt-8">
            <h2 className="text-2xl text-gray-500">Personal Information</h2>
            <div className="border rounded-md py-4 mt-4">
                <div>
                <h1 className="ml-4 font-bold">Profile Picture</h1>
                <div className="flex items-center">
                    <div className="flex-col">
                        <Avatar className="w-32 h-32 m-4 mr-8" key={selectedAvatar}>
                            <AvatarImage src={selectedAvatar} alt="Profile Picture" />
                            <AvatarFallback>CN</AvatarFallback>
                        </Avatar>
                        <div className="text-center">
                            {getCharacterName(selectedAvatar)}
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-4">
                    {Object.entries(jsonData).map(([characterName, avatarUrl]) => 
                        <Avatar key={characterName}
                            className={`w-16 h-16 cursor-pointer border rounded-full ${
                                avatarUrl === selectedAvatar ? "opacity-10" : ""
                            }`}
                            onClick={() => handleClick(avatarUrl)}>
                            <AvatarImage src={avatarUrl} alt={characterName} />
                            <AvatarFallback>{characterName.slice(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                    )}
                    </div>
                </div>
                </div>
                <Separator className="my-4" />
                <div>
                    <h1 className="ml-4 font-bold">Name</h1>
                    <span className="flex justify-between mx-4 my-2 items-center">
                        {isEditing && focusField === "name" ? (
                            <Input type="text" value={userData.name} onChange={(event) => handleInputChange(event, "name")} className="w-3/4 focus:outline-blue-500 border border-gray-300 rounded-md px-2 py-1 text-lg" />
                        ) : (
                            <h1 className="text-xl text-center">{userData.name}</h1>
                        )} 
                        <Button onClick={() => handleEditClick("name")}>{isEditing && focusField === "name" ? "Save" : "Edit"}</Button>
                    </span>
                </div>
                <Separator className="my-4" />
                <div>
                    <h1 className="ml-4 font-bold">Username</h1>
                    <span className="flex justify-between m-4">
                        {isEditing && focusField === "username" ? (
                            <Input type="text" value={userData.username} onChange={(event) => handleInputChange(event, "username")} className="w-3/4 focus:outline-blue-500 border border-gray-300 rounded-md px-2 py-1 text-lg" />
                        ) : (
                            <h1 className="text-xl text-center">{userData.username}</h1>
                        )} 
                        <Button onClick={() => handleEditClick("username")}>{isEditing && focusField === "username" ? "Save" : "Edit"}</Button>
                    </span>
                </div>
            </div>
                <div className="mt-4 flex justify-end"> 
                    {hasChanges && (
                        <Button size="lg" className="text-lg" onClick={handleUpdate}>Update</Button>
                    )}
                </div>                
            </div>
        </div>
        </div>
    );
};
