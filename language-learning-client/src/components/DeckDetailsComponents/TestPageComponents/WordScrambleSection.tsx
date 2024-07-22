import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Question } from "@/types";

interface WordScrambleProps {
    questions: Question[]
    handleAnswer: (questionId: string, answer: string) => void;
    isSubmitted: boolean;
    answers: Record<string, string>
}

export const WordScramble: React.FC<WordScrambleProps> = ({ questions, handleAnswer, isSubmitted, answers }) => {
    return (
        <Card className="mb-4">
            <CardContent className="p-4">
                <h3 className="text-lg font-semibold mb-2">Word Scramble</h3>
                {questions.map((question, index) => (
                    <div key={index} id={`question_${index + 1}`} className="mt-2">
                        <Label>{question.question}</Label>
                        <Input  type="text" 
                                onChange={(e) => handleAnswer(`scramble_${index}`, e.target.value)} 
                                disabled={isSubmitted}
                                value={answers[`scramble_${index}`] || ""}
                        />
                    </div>
                ))}
            </CardContent>
        </Card>
    )
}