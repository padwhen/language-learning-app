import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Question } from "@/types";

interface SynonymMatchingProps {
    questions: Question[]
    handleAnswer: (questionId: string, answer: string) => void;
}

export const SynonymMatchingSections: React.FC<SynonymMatchingProps> = ({ questions, handleAnswer}) => {
    return (
        <Card className="mb-4">
            <CardContent className="p-4">
                <h3 className="text-lg font-semibold mb-2">Synonym Matching</h3>
                {questions.map((question, index) =>  (
                    <div key={index} className="mt-2">
                        <Label>{question.question}</Label>
                        <RadioGroup onValueChange={(value) => handleAnswer(`synonym_${index}`, value)}>
                            {question.options?.map((option) => (
                                <div className="flex items-center space-x-2" key={option}>
                                    <RadioGroupItem value={option} id={`synonym_${index}_${option}`} />
                                    <Label htmlFor={`synonym_${index}_${option}`}>{option}</Label>
                                </div>
                            ))}
                        </RadioGroup>
                    </div>
                ))}
            </CardContent>
        </Card>
    )
}