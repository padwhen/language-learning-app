import { BookOpen, Check, ChevronDown } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../ui/collapsible"
import { Input } from "../ui/input"
import { Label } from "../ui/label"

// Previously it was called "simplified". To make it easier to understand, I will now use "base" instead
// EG: dogS => original (in the sentence). dog => BASE

interface LearningPreferencesProps {
    flashcardWordForm: 'original' | 'base'
    handleFlashcardFormChange: (flashcardWordForm: 'original' | 'base') => void
}

export const LearningPreferences:React.FC<LearningPreferencesProps> = ({ 
    flashcardWordForm,
    handleFlashcardFormChange
}) => {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Learning Preferences</CardTitle>
                <p className="text-sm text-slate-600">Customize how you learn with flashcards</p>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-3">
                    <Label htmlFor="flashcard-form">Default Flashcard Word Form</Label>
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                            <Input
                                type="radio"
                                id="base-form"
                                name="flashcard-form"
                                value="base"
                                checked={flashcardWordForm === 'base'}
                                onChange={() => handleFlashcardFormChange('base')}
                                className="w-4 h-4 text-blue-600"
                            />
                            <Label htmlFor="base-form" className="cursor-pointer text-sm">
                                Base Form
                            </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Input
                                type="radio"
                                id="context-form"
                                name="flashcard-form"
                                value="original"
                                checked={flashcardWordForm === 'original'}
                                onChange={() => handleFlashcardFormChange('original')}
                                className="w-4 h-4 text-blue-600"
                            />
                            <Label htmlFor="context-form" className="cursor-pointer text-sm">
                                Context Form
                            </Label>
                        </div>
                    </div>
                </div>
                {/* Collapsible Preview Section */}
                <Collapsible>
                    <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                        <span className="font-medium text-sm">Preview Example</span>
                        <ChevronDown className="h-4 w-4" />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="mt-4">
                        {/* Integrated FlashcardFormSelector */}
                        <div className="space-y-4">
                            {/* Translation Context */}
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <BookOpen className="w-4 h-4 text-blue-600" />
                                    <span className="text-sm font-medium text-blue-800">Finnish → English</span>
                                </div>
                                <p className="text-lg text-gray-800">Tämä ruoka on <span className="bg-yellow-200 px-1 rounded">[herkkullista]</span>!</p>
                                <p className="text-sm text-gray-600 mt-1">This food is delicious</p>
                            </div>
                            {/* Form Selection Preview */}
                            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4">
                                <h4 className="text-sm font-semibold text-gray-800 mb-3">Your flashcard will save:</h4>
                                <div className="space-y-3">
                                    {/* Base Form Preview */}
                                    <div className={`border-2 rounded-lg p-3 transition-all duration-200 ${
                                        flashcardWordForm === 'base'
                                        ? 'border-blue-500 bg-blue-50'
                                        : 'border-gray-200 bg-gray-50'
                                    }`}>
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className={`w-3 h-3 rounded-full border-2 flex items-center justify-center ${
                                                flashcardWordForm === 'base' ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                                            }`}>
                                                {flashcardWordForm === 'base' && <div className="w-1.5 h-1.5 bg-white rounded-full"></div>}
                                            </div>
                                            <span className="text-sm font-medium text-gray-800">Base Form</span>
                                        </div>
                                        <div className="ml-5">
                                            <div className="flex items-center gap-2">
                                                <span className="text-blue-600 font-medium">herkullista</span>
                                                <span className="text-gray-400">→</span>
                                                <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm font-medium">
                                                    Herkullinen
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1">Dictionary form for easy lookup</p>
                                        </div>
                                    </div>

                                    {/* Context Form Preview */}
                                    <div className={`border-2 rounded-lg p-3 transition-all duration-200 ${
                                        flashcardWordForm === 'original'
                                            ? 'border-blue-500 bg-blue-50' 
                                            : 'border-gray-200 bg-gray-50'
                                    }`}>
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className={`w-3 h-3 rounded-full border-2 flex items-center justify-center ${
                                                flashcardWordForm === 'original' ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                                            }`}>
                                                {flashcardWordForm === 'original' && <div className="w-1.5 h-1.5 bg-white rounded-full"></div>}
                                            </div>
                                            <span className="text-sm font-medium text-gray-800">Context Form</span>
                                        </div>
                                        <div className="ml-5">
                                            <div className="flex items-center gap-2">
                                                <span className="text-blue-600 font-medium">herkullista</span>
                                                <span className="text-gray-400">→</span>
                                                <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-sm font-medium">
                                                    Herkulli<span className="text-red-600 underline decoration-red-600">sta</span>
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1">Form as it appears in context</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Current Setting Indicator */}
                                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <Check className="w-4 h-4 text-green-600" />
                                        <span className="text-sm font-medium text-gray-700">
                                            Currently saving: {flashcardWordForm === 'base' ? 'Base' : 'Context'} form
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">
                                    {flashcardWordForm  === 'base' 
                                        ? 'Your flashcards will use "Herkullinen" for easier dictionary lookup'
                                        : 'Your flashcards will use "Herkullista" to practice real-world usage'
                                    }
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CollapsibleContent>
                </Collapsible>
            </CardContent>
        </Card>
    )
}