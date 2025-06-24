import { useContext, useEffect, useState } from "react";
import { useError } from "@/state/hooks/useError";
import { useToast } from "@/components/ui/use-toast";
import { UserContext } from "@/contexts/UserContext";
import axios from "axios";
import ProfilePicture from "./ProfilePicture";
import { LoginHistoryResponse, XpHistoryResponse } from "./SettingsTypes";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { DialogTrigger } from "@radix-ui/react-dialog";
import { Badge } from "../ui/badge";
import { CalendarIcon, Edit2, EyeOff, Sparkles, Star, Trophy, Eye, Save } from "lucide-react";
import { Calendar } from "../ui/calendar";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

export const SettingPage = () => {
  const { user, setUser, refreshUserStats } = useContext(UserContext);
  const { handleError } = useError();
  const { toast } = useToast();

  const defaultAvatarUrl = "https://github.com/shadcn.png";
  const initialAvatarUrl = user?.avatarUrl ?? defaultAvatarUrl;

  const [selectedAvatar, setSelectedAvatar] = useState<string>(initialAvatarUrl);
  const [editMode, setEditMode] = useState<{ name: boolean; username: boolean; password: boolean }>({
    name: false,
    username: false,
    password: false
  })
  const [formData, setFormData] = useState({
    name: user?.name,
    username: user?.username,
    password: '',
  })
  const [showPassword, setShowPassword] = useState(false)

  // --- FETCHED DATA ---
  const [loginHistory, setLoginHistory] = useState<LoginHistoryResponse | null>(null)
  const [xpHistory, setXpHistory] = useState<XpHistoryResponse | null>(null)
  const [loading, setLoading] = useState(true)

  // -- FETCH LOGINHISTORY AND XPHISTORY --
  useEffect(() => {
    const fetchData = async () => {
      if (!user?._id) return
      setLoading(true)
      try {
        const [loginRes, xpRes] = await Promise.all([
          axios.get('/login-history'),
          axios.get('/xp-history')
        ])
        setLoginHistory(loginRes.data)
        setXpHistory(xpRes.data)
      } catch (err) {
        return;
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [user])

  // -- FUNCTIONS FOR XP CALCULATIONS --
  const calculateXPForCurrentLevel = (level: number) => {
    return Math.pow(level - 1, 2) * 100;
  };

  const calculateXPForNextLevel = (level: number) => {
    return Math.pow(level, 2) * 100;
  };

  const getXPProgress = () => {
    const currentLevel = user?.level ?? 1;
    const currentXP = user?.xp ?? 0;
    const xpForCurrentLevel = calculateXPForCurrentLevel(currentLevel);
    const xpForNextLevel = calculateXPForNextLevel(currentLevel);
    const xpInCurrentLevel = currentXP - xpForCurrentLevel;
    const xpNeededForNextLevel = xpForNextLevel - xpForCurrentLevel;
    const progressPercentage = (currentXP / xpNeededForNextLevel) * 100;
    
    return {
      xpInCurrentLevel,
      xpNeededForNextLevel,
      progressPercentage: Math.min(progressPercentage, 100)
    };
  };
  const xpProgress = getXPProgress();

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

  const toggleEdit = (field: 'name' | 'username' | 'password') => {
    setEditMode((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleInputChange = (field: 'name' | 'username' | 'password', value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

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
      toast({ title: 'Update failed', description: err?.response?.data?.error || 'Could not update profile', variant: 'destructive' });
    }
  };

  useEffect(() => {
    setFormData({
      name: user?.name ?? '',
      username: user?.username ?? '',
      password: '',
    });
    setSelectedAvatar(user?.avatarUrl ?? defaultAvatarUrl);
  }, [user]);

  return (
    <div className="min-h-screen">
      <div className="mx-auto p-6 space-y-6">
        <h1 className="text-3xl font-bold flex items-center gap-3">⚙️ Settings</h1>

        {/* Avatar Selection */}
        <Card className="overflow-hidden">
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
        {/* User Stats */}
        <Card>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Dialog>
                <DialogTrigger asChild>
                  <div className="bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl p-6 text-white cursor-pointer hover:scale-105 transition-transform duration-200">
                    <div className="text-sm opacity-90 mb-2">Experience</div>
                    <div className="text-4xl font-bold mb-1">{user?.xp ?? 0}</div>
                    <div className="text-xs opacity-80 mb-4">out of {xpProgress.xpNeededForNextLevel} XP</div>
                    <div className="w-full bg-white/20 rounded-full h-2 mb-4">
                      <div className="bg-white h-2 rounded-full" style={{ width: `${xpProgress.progressPercentage}%` }}></div>
                    </div>
                    <Badge className="bg-white/20 text-white border-white/20 hover:bg-white/30">
                      🏆 Level {user?.level}
                    </Badge>
                  </div>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Trophy className="h-5 w-5" />
                      Experience History
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-3 max-h-80 overflow-y-auto">
                    {experienceHistory.length > 0 ? experienceHistory.map((entry, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                        <div>
                          <div className="font-medium text-sm">{entry.action}</div>
                          <div className="text-xs text-slate-600">{entry.date}</div>
                        </div>
                        <Badge variant="secondary" className="bg-green-100 text-green-700">
                          +{entry.xp} XP
                        </Badge>
                      </div>
                    )) : <div className="text-slate-500 text-sm">No XP history yet.</div>}
                  </div>
                </DialogContent>
              </Dialog>

              {/* Streak Card */}
              <Dialog>
                <DialogTrigger asChild>
                  <div className="bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl p-6 text-white cursor-pointer hover:scale-105 transition-transform duration-200">
                    <div className="text-sm opacity-90 mb-2">Learning Streak</div>
                    <div className="text-4xl font-bold mb-1">{user?.currentStreak ?? 0}</div>
                    <div className="text-xs opacity-80 mb-4">Max: {user?.maxStreak ?? 0} days</div>
                    <div className="text-sm opacity-90">
                      🔥 Keep it up tomorrow!
                    </div>
                  </div>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <CalendarIcon className="w-5 h-5" />
                      Login Calendar
                    </DialogTitle>
                  </DialogHeader>
                  <div className="p-4">
                  <Calendar
                      mode="multiple"
                      selected={loginDays}
                      className="flex justify-center items-center w-full"
                      modifiers={{
                        loginDay: loginDays
                      }}
                      modifiersStyles={{
                        loginDay: {
                          backgroundColor: '#ef4444',
                          color: 'white',
                          fontWeight: 'bold'
                        }
                      }}
                      month={loginDays.length > 0 ? loginDays[0] : new Date()}
                      showOutsideDays={false}
                    />
                    <div className="mt-4 text-sm text-slate-600">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-4 h-4 bg-red-500 rounded"></div>
                        <span>Days you logged in</span>
                      </div>
                      <p>Current streak: {user?.currentStreak ?? 0} day(s) • Best streak: {user?.maxStreak ?? 0} days </p>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>
        {/* Achievements */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Achievements</CardTitle>
            <p className="text-sm text-slate-600">Your latest milestones</p>
          </CardHeader>
          <CardContent>
            <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 rounded-2xl blur opacity-30 group-hover:opacity-75 transition duration-1000 group-hover:duration-200 animate-pulse"></div>
              <div className="relative bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-2xl p-6 text-white">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-2xl">
                      ✅
                    </div>
                    <div className="absolute -top-1 -right-1">
                      <Sparkles className="h-4 w-4 text-yellow-300 animate-pulse" />
                    </div>
                  </div>
                  <div>
                    <div className="font-semibold text-lg">Daily Visitor</div>
                    <div className="text-sm opacity-90">Visited the app today</div>
                  </div>
                  <div className="ml-auto">
                    <Star className="h-6 w-6 text-yellow-300 animate-bounce" />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <p className="text-sm text-slate-600">Manage your account details</p>
          </CardHeader>
          <CardContent className="space-y-4">
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
              <Button onClick={saveChanges} className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};