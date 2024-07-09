import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import jsonData from "../../avatarurl.json"; 
import { useContext, useEffect, useState } from "react";
import { Separator } from "../ui/separator";
import { Button } from "../ui/button";
import { ChangeEvent } from "@/types";
import { Input } from "../ui/input";
import { UserContext } from "@/UserContext";
import { useError } from "@/state/hooks/useError";
import axios, { AxiosError } from "axios";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { FaExclamationTriangle } from "react-icons/fa";
import { useToast } from "@/components/ui/use-toast"
import { Link } from "react-router-dom";
import { ToastAction } from "../ui/toast";

export const SettingPage = () => {
    const { user, setUser } = useContext(UserContext);
    const { error, handleError } = useError();
    
    const defaultAvatarUrl = "https://github.com/shadcn.png";
    const initialAvatarUrl = user?.avatarUrl ?? defaultAvatarUrl;

    const [selectedAvatar, setSelectedAvatar] = useState<string>(initialAvatarUrl);
    const [isEditing, setIsEditing] = useState(false)
    const [userData, setUserData] = useState({
        name: user?.name, username: user?.username
    })
    const [focusField, setFocusField] = useState<"name" | "username" | "">("")

    const { toast } = useToast()

    useEffect(() => {
        if (user) {
            setUserData({ name: user.name, username: user.username });
            setSelectedAvatar(user.avatarUrl ?? defaultAvatarUrl); 
        }
    }, [user]);

    const handleClick = (newAvatarUrl: string) => {
        setSelectedAvatar(newAvatarUrl);
    };

    const getCharacterName = (avatarUrl: string) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const characterName = Object.entries(jsonData).find(([_key, value]) => value === avatarUrl)?.[0];
        return characterName?.replace(/_/g, " ");
    };

    const handleInputChange = (event: ChangeEvent, field: string) => {
        setUserData((prevData) => ({...prevData, [field]: event.target.value}))
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
            const countdown = 3;
            toast({
                title: 'Update succesfully!',
                description: `Reload to the front page in ${countdown} seconds`,
                action: <Link to={'/'}><ToastAction altText="Reload now" className="">Reload now</ToastAction></Link>
            })
            setTimeout(() => {
                window.location.replace('/');
            }, 3000);
        } catch (error) {
            const axiosError = error as AxiosError;
            if (axiosError.response && axiosError.response.data && (axiosError.response.data as any).error) {
                handleError('Username already exists. Try another username.')
            } else {
                handleError('Error updating to the server. Try again later!')
            }
        }
    }

    return (
        <div className="pt-4 md:pt-16">
        <div className="container sticky top-0 w-full flex flex-col justify-between bg-white z-10 py-2 md:py-4 px-4 md:px-32">
            <h1 className="text-3xl md:text-5xl font-bold">Settings 🛠️</h1>
            <div className="pt-4 md:pt-8">
            <h2 className="md:text-2xl text-xl text-gray-500">Personal Information</h2>
            <div className="border rounded-md py-2 md:py-4 mt-2 md:mt-4">
                <div>
                <h1 className="ml-4 font-bold">Profile Picture</h1>
                <div className="flex flex-col md:flex-row items-center">
                    <div className="flex-col mb-4 md:mb-0">
                        <Avatar className="w-24 h-24 md:w-32 md:h-32 m-2 md:m-4 md:mr-8" key={selectedAvatar}>
                            <AvatarImage src={selectedAvatar} alt="Profile Picture" />
                            <AvatarFallback>CN</AvatarFallback>
                        </Avatar>
                        <div className="text-center">
                            {getCharacterName(selectedAvatar)}
                        </div>
                    </div>
                    <div className="flex flex-wrap md:gap-4 gap-2 justify-center">
                    {Object.entries(jsonData).map(([characterName, avatarUrl]) => 
                        <Avatar key={characterName}
                            className={`md:w-16 md:h-16 w-12 h-12 cursor-pointer border rounded-full ${
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
                    <span className="flex flex-col md:flex-row justify-between mx-2 md:mx-4 my-2 items-center">
                        {isEditing && focusField === "name" ? (
                            <Input type="text" value={userData.name} onChange={(event) => handleInputChange(event, "name")} className="w-3/4 focus:outline-blue-500 border border-gray-300 rounded-md px-2 py-1 text-lg" />
                        ) : (
                            <h1 className="md:text-xl text-lg text-center mb-2 md:mb-0">{userData.name}</h1>
                        )} 
                        <Button onClick={() => handleEditClick("name")}>{isEditing && focusField === "name" ? "Save" : "Edit"}</Button>
                    </span>
                </div>
                <Separator className="my-4" />
                <div>
                    <h1 className="ml-4 font-bold">Username</h1>
                    <span className="flex flex-col md:flex-row justify-between mx-2 md:mx-4 my-2 items-center">
                        {isEditing && focusField === "username" ? (
                            <Input type="text" value={userData.username} onChange={(event) => handleInputChange(event, "username")} className="w-3/4 focus:outline-blue-500 border border-gray-300 rounded-md px-2 py-1 text-lg" />
                        ) : (
                            <h1 className="md:text-xl text-lg text-center mb-2 md:mb-0">{userData.username}</h1>
                        )} 
                        <Button onClick={() => handleEditClick("username")}>{isEditing && focusField === "username" ? "Save" : "Edit"}</Button>
                    </span>
                </div>
            </div>
                <div className="mt-4 flex flex-col md:flex-row justify-between items-center md:gap-6 gap-2">
                    {error && (
                        <Alert variant="destructive" className="">
                            <FaExclamationTriangle className="h-4 w-4" />
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>
                                {error}
                            </AlertDescription>
                        </Alert>                        
                    )}
                    <div className="md:ml-auto md:w-auto w-full">
                        {(user?.name !== userData.name || user?.username !== userData.username || user?.avatarUrl !== selectedAvatar) && (
                            <Button size="lg" className="text-lg" onClick={handleUpdate}>Update</Button>
                        )}                      
                    </div> 
                </div>                
            </div>
        </div>
        </div>
    );
};
