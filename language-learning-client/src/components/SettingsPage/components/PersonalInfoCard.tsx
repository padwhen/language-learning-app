import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Label } from "../../ui/label";
import { Input } from "../../ui/input";
import { Button } from "../../ui/button";
import { Edit2, EyeOff, Eye, Save } from "lucide-react";
import { useError } from "@/state/hooks/useError";
import { useToast } from "../../ui/use-toast";
import axios from "axios";

interface PersonalInfoCardProps {
  user: any;
  setUser: (user: any) => void;
  refreshUserStats?: () => void;
  selectedAvatar: string;
  highlightedElement?: string | null;
}

export const PersonalInfoCard = ({ 
  user, 
  setUser, 
  refreshUserStats, 
  selectedAvatar, 
  highlightedElement 
}: PersonalInfoCardProps) => {
  const { handleError } = useError();
  const { toast } = useToast();
  const defaultAvatarUrl = "https://github.com/shadcn.png";

  const [editMode, setEditMode] = useState<{ name: boolean; username: boolean; password: boolean }>({
    name: false,
    username: false,
    password: false
  });
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    username: user?.username || '',
    password: '',
  });
  
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    setFormData({
      name: user?.name ?? '',
      username: user?.username ?? '',
      password: '',
    });
  }, [user]);

  const toggleEdit = (field: 'name' | 'username' | 'password') => {
    setEditMode((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleInputChange = (field: 'name' | 'username' | 'password', value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const isEditing = editMode.name || editMode.username || editMode.password || selectedAvatar !== (user?.avatarUrl ?? defaultAvatarUrl);

  const saveChanges = async () => {
    try {
      const payload: any = {
        name: formData.name,
        username: formData.username,
        avatarUrl: selectedAvatar,
      };
      // Only send password if it's being edited and not empty
      if (editMode.password && formData.password) {
        payload.password = formData.password;
      }
      const res = await axios.put('/update', payload);
      if (res.data) {
        setUser((prev: any) => ({ ...prev, ...res.data, avatarUrl: selectedAvatar }));
        refreshUserStats && refreshUserStats();
        toast({ title: 'Profile updated!', description: 'Your changes have been saved.' });
        setEditMode({ name: false, username: false, password: false });
        setFormData((prev) => ({ ...prev, password: '' }));
      }
    } catch (err: any) {
      handleError(err);
      toast({ 
        title: 'Update failed', 
        description: err?.response?.data?.error || 'Could not update profile', 
        variant: 'destructive' 
      });
    }
  };

  return (
    <Card className={`transition-all duration-300 ${
      highlightedElement === 'personal-info' ? 'ring-4 ring-blue-500 ring-opacity-75 shadow-lg' : ''
    }`}>
      <CardHeader>
        <CardTitle>Personal Information</CardTitle>
        <p className="text-sm text-slate-600">Manage your account details</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Display Name Field */}
        <div className="space-y-2">
          <Label htmlFor="name">Display Name</Label>
          <div className="flex gap-2">
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              readOnly={!editMode.name}
              className={!editMode.name ? 'bg-slate-50' : ''}
            />
            <Button variant="outline" size="sm" onClick={() => toggleEdit('name')}>
              <Edit2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Username Field */}
        <div className="space-y-2">
          <Label htmlFor="username">Username</Label>
          <div className="flex gap-2">
            <Input 
              id="username"
              value={formData.username}
              onChange={(e) => handleInputChange('username', e.target.value)}
              readOnly={!editMode.username}
              className={!editMode.username ? 'bg-slate-50' : ''}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => toggleEdit('username')}
            >
              <Edit2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Password Field */}
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={editMode.password ? formData.password : '••••••••'}
                onChange={(e) => handleInputChange('password', e.target.value)}
                readOnly={!editMode.password}
                className={!editMode.password ? 'bg-slate-50' : ''}
              />
              {editMode.password && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                  onClick={() => setShowPassword(!showPassword)}
                  type="button"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => toggleEdit('password')}
            >
              <Edit2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {isEditing && (
          <Button 
            onClick={saveChanges} 
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
          >
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        )}
      </CardContent>
    </Card>
  );
}; 