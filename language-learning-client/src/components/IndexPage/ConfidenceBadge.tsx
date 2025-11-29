import { Info, AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

interface ConfidenceBadgeProps {
    confidence: number | null;
    onRerun?: () => void;
    confidenceDetails?: {
        accuracy?: number;
        completeness?: number;
        naturalness?: number;
        grammar?: number;
        concerns?: string[];
    };
}

export const ConfidenceBadge: React.FC<ConfidenceBadgeProps> = ({ 
    confidence, 
    onRerun,
    confidenceDetails 
}) => {
    if (confidence === null) {
        return null;
    }

    const getConfidenceColor = (conf: number) => {
        if (conf >= 80) return "text-green-700 bg-green-50 border-green-200 hover:bg-green-100";
        if (conf >= 60) return "text-yellow-700 bg-yellow-50 border-yellow-200 hover:bg-yellow-100";
        return "text-red-700 bg-red-50 border-red-200 hover:bg-red-100";
    };

    const getConfidenceIcon = (conf: number) => {
        if (conf < 70) {
            return <AlertCircle className="h-3.5 w-3.5" />;
        }
        return null;
    };

    const missingPercentage = 100 - confidence;
    
    // Generate tooltip content explaining confidence breakdown
    const getTooltipContent = () => {
        const parts: string[] = [];
        
        parts.push(`Overall Confidence: ${confidence}%`);
        parts.push('');
        parts.push('Based on:');
        
        if (confidenceDetails) {
            if (confidenceDetails.accuracy !== undefined) {
                parts.push(`• Accuracy: ${confidenceDetails.accuracy}%`);
            }
            if (confidenceDetails.completeness !== undefined) {
                parts.push(`• Completeness: ${confidenceDetails.completeness}%`);
            }
            if (confidenceDetails.naturalness !== undefined) {
                parts.push(`• Naturalness: ${confidenceDetails.naturalness}%`);
            }
            if (confidenceDetails.grammar !== undefined) {
                parts.push(`• Grammar: ${confidenceDetails.grammar}%`);
            }
        } else {
            parts.push('• Accuracy of word choices');
            parts.push('• Completeness (nothing omitted)');
            parts.push('• Naturalness of phrasing');
            parts.push('• Grammatical correctness');
        }
        
        if (missingPercentage > 0) {
            parts.push('');
            parts.push(`Missing ${missingPercentage}% due to:`);
            
            if (confidenceDetails?.concerns && confidenceDetails.concerns.length > 0) {
                confidenceDetails.concerns.forEach(concern => {
                    parts.push(`• ${concern}`);
                });
            } else {
                // Fallback explanations if concerns not provided
                const lowScores: string[] = [];
                if (confidenceDetails) {
                    if (confidenceDetails.accuracy !== undefined && confidenceDetails.accuracy < 90) {
                        lowScores.push(`Accuracy (${confidenceDetails.accuracy}%): Some word choices may need verification`);
                    }
                    if (confidenceDetails.completeness !== undefined && confidenceDetails.completeness < 90) {
                        lowScores.push(`Completeness (${confidenceDetails.completeness}%): Some content may be missing or summarized`);
                    }
                    if (confidenceDetails.naturalness !== undefined && confidenceDetails.naturalness < 90) {
                        lowScores.push(`Naturalness (${confidenceDetails.naturalness}%): Phrasing could be more idiomatic`);
                    }
                    if (confidenceDetails.grammar !== undefined && confidenceDetails.grammar < 90) {
                        lowScores.push(`Grammar (${confidenceDetails.grammar}%): Some grammatical structures may need review`);
                    }
                }
                
                if (lowScores.length > 0) {
                    lowScores.forEach(score => parts.push(`• ${score}`));
                } else {
                    // Generic fallback
                    if (confidence < 80) {
                        parts.push('• Potential word choice improvements');
                    }
                    if (confidence < 70) {
                        parts.push('• Some uncertainty in phrasing');
                    }
                    if (confidence < 60) {
                        parts.push('• Possible missing context or nuances');
                    }
                }
            }
        }
        
        return parts.join('\n');
    };

    const shouldShowRerun = confidence < 80;

    return (
        <div className="flex items-center gap-2">
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <div 
                            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium cursor-help transition-colors ${getConfidenceColor(confidence)}`}
                        >
                            {getConfidenceIcon(confidence)}
                            <span>AI: {confidence}%</span>
                            <Info className="h-3 w-3 opacity-70" />
                        </div>
                    </TooltipTrigger>
                    <TooltipContent 
                        side="bottom" 
                        className="max-w-sm p-3 text-sm whitespace-pre-line"
                    >
                        <div className="space-y-1">
                            {getTooltipContent().split('\n').map((line, index) => (
                                <div key={index} className={line.startsWith('•') ? 'ml-2' : line === '' ? 'h-1' : 'font-semibold'}>
                                    {line}
                                </div>
                            ))}
                        </div>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
            
            {shouldShowRerun && onRerun && (
                <Button
                    onClick={onRerun}
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-xs text-gray-600 hover:text-gray-900"
                    title="Rerun translation for better quality"
                >
                    <RefreshCw className="h-3.5 w-3.5" />
                </Button>
            )}
        </div>
    );
};

