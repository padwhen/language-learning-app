// src/components/SettingsPage/PersonalInfoCard.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Edit2, EyeOff, Eye, Save } from "lucide-react";

interface PersonalInfoCardProps {
  highlightedElement: string | null;
  formData: any;
  editMode: any;
  showPassword: boolean;
  isEditing: boolean;
  onInputChange: (field: 'name' | 'username' | 'password', value: string) => void;
  onToggleEdit: (field: 'name' | 'username' | 'password') => void;
  onTogglePasswordVisibility: () => void;
  onSaveChanges: () => void;
}

export const PersonalInfoCard: React.FC<PersonalInfoCardProps> = ({
  highlightedElement,
  formData,
  editMode,
  showPassword,
  isEditing,
  onInputChange,
  onToggleEdit,
  onTogglePasswordVisibility,
  onSaveChanges
}) => {
  return (
    <Card className={`transition-all duration-300 ${
      highlightedElement === 'personal-info' ? 'ring-4 ring-blue-500 ring-opacity-75 shadow-lg' : ''
    }`}>
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
              onChange={(e) => onInputChange('name', e.target.value)}
              readOnly={!editMode.name}
              className={!editMode.name ? 'bg-slate-50' : ''}
            />
            <Button variant="outline" size="sm" onClick={() => onToggleEdit('name')}>
              <Edit2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="username">Username</Label>
          <div className="flex gap-2">
            <Input 
              id="username"
              value={formData.username}
              onChange={(e) => onInputChange('username', e.target.value)}
              readOnly={!editMode.username}
              className={!editMode.username ? 'bg-slate-50' : ''}
            />
            <Button variant="outline" size="sm" onClick={() => onToggleEdit('username')}>
              <Edit2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={editMode.password ? formData.password : '••••••••'}
                onChange={(e) => onInputChange('password', e.target.value)}
                readOnly={!editMode.password}
                className={!editMode.password ? 'bg-slate-50' : ''}
              />
              {editMode.password && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                  onClick={onTogglePasswordVisibility}
                  type="button"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              )}
            </div>
            <Button variant="outline" size="sm" onClick={() => onToggleEdit('password')}>
              <Edit2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {isEditing && (
          <Button onClick={onSaveChanges} className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        )}
      </CardContent>
    </Card>
  );
};