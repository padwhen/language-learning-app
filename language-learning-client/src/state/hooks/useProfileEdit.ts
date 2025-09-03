import { UserContext } from "@/contexts/UserContext"
import { useContext, useEffect, useState } from "react"
import { useError } from "./useError"
import { useToast } from "@/components/ui/use-toast"
import axios from "axios"

export const useProfileEdit = () => {
    const { user, setUser, refreshUserStats } = useContext(UserContext)
    const { handleError }  = useError()
    const { toast } = useToast()

    const defaultAvatarUrl = "https://github.com/shadcn.png"
    const initialAvatarUrl = user?.avatarUrl ?? defaultAvatarUrl;

    const [selectedAvatar, setSelectedAvatar] = useState<string>(initialAvatarUrl)
    const [editMode, setEditMode] = useState<{ name: boolean; username: boolean; password: boolean}>({
        name: false,
        username: false,
        password: false
    })
    const [formData, setFormData] = useState({
        name: user?.name,
        username: user?.username,
        password: ''
    })
    const [showPassword, setShowPassword] = useState(false)

    const toggleEdit = (field: 'name' | 'username' | 'password') => {
        setEditMode((prev) => ({ ...prev, [field]: !prev[field] }))
    } 

    const handleInputChange = (field: 'name' | 'username' | 'password', value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }))
    }

    const handleFlashcardFormChange = async (form: 'original' | 'base') => {
        try {
            const res = await axios.put('/update', { flashcardWordForm: form })
            if (res.data) {
                setUser((prev: any) => ({ ...prev, flashcardWordForm: form }))
                refreshUserStats && refreshUserStats()
                toast({
                    title: 'Preference updated!',
                    description: `Flashcards will now use ${form} word form.`
                })
            }
        } catch (err: any) {
            handleError(err)
            toast({
                title: 'Update failed',
                description: err?.response?.data?.error || 'Could not update preference', 
                variant: 'destructive'
            })
        }
    }

    const isEditing = editMode.name || editMode.username || editMode.password || selectedAvatar !== (user?.avatarUrl ?? defaultAvatarUrl)

    const saveChanges = async () => {
        try {
            const payload: any = {
                name: formData.name,
                username: formData.username,
                avatarUrl: selectedAvatar
            }
            if (editMode.password && formData.password) {
                payload.password = formData.password
            }
            const res = await axios.put('/update', payload)
            if (res.data) {
                setUser((prev: any) => ({ ...prev, ...res.data, avatarUrl: selectedAvatar}))
                refreshUserStats && refreshUserStats()
                toast({ title: 'Profile updated!', description: 'Your changes have been saved.'})
                setEditMode({ name: false, username: false, password: false })
                setFormData((prev) => ({ ...prev, password: '' }))
            } 
        } catch (err: any) {
            handleError(err)
            toast({ title: 'Update failed', description: 'Could not update profile - try again later', variant: 'destructive' });
        }
    }

    useEffect(() => {
        setFormData({
            name: user?.name ?? '',
            username: user?.username ?? '',
            password: ''
        })
        setSelectedAvatar(user?.avatarUrl ?? defaultAvatarUrl)
    }, [user])

    return {
        selectedAvatar,
        setSelectedAvatar,
        editMode,
        formData,
        showPassword,
        setShowPassword,
        toggleEdit,
        handleInputChange,
        isEditing,
        saveChanges,
        handleFlashcardFormChange
      };
}