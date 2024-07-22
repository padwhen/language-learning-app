import { Statistics } from "@/types";
import { Dispatch, SetStateAction } from "react";
import mockData from '../../components/DeckDetailsComponents/TestPageComponents/mockdata.json'

interface UseTestSubmit {
    (answers: Record<string, string>, setGrade: Dispatch<SetStateAction<string | null>>, setStatistics: Dispatch<SetStateAction<Statistics | null>>): { handleSubmit: () => void };
}

export const useTestSubmit: UseTestSubmit = (answers, setGrade, setStatistics) => {
    const calculateGrade = (score: number, totalQuestions: number): string => {
        const percentage = (score / totalQuestions) * 100;
        if (percentage >= 97) return 'A+';
        if (percentage >= 93) return 'A';
        if (percentage >= 90) return 'A-';
        if (percentage >= 87) return 'B+';
        if (percentage >= 83) return 'B';
        if (percentage >= 80) return 'B-';
        if (percentage >= 77) return 'C+';
        if (percentage >= 73) return 'C';
        if (percentage >= 70) return 'C-';
        if (percentage >= 67) return 'D+';
        if (percentage >= 63) return 'D';
        if (percentage >= 60) return 'D-';
        return 'F';
    }

    const handleSubmit = () => {
        let score = 0;
        let totalQuestions = 0;
        const wrongAnswers: Statistics['wrongAnswers'] = {
          passage: [],
          synonym: [],
          scramble: []
        };
    
        // Check passage answers
        Object.entries(mockData.passage.blanks).forEach(([id, blank]) => {
          totalQuestions++;
          if (answers[`passage_${id}`] === blank.correct_answer) {
            score++;
          } else {
            wrongAnswers.passage.push(id);
          }
        });
    
        // Check synonym answers
        mockData.questions.synonym_matching.forEach((question, index) => {
          totalQuestions++;
          if (answers[`synonym_${index}`] === question.correct_answer) {
            score++;
          } else {
            wrongAnswers.synonym.push(String(index + 1));
          }
        });
    
        // Check scramble answers
        mockData.questions.word_scramble.forEach((question, index) => {
          totalQuestions++;
          if (answers[`scramble_${index}`]?.toLowerCase() === question.correct_answer.toLowerCase()) {
            score++;
          } else {
            wrongAnswers.scramble.push(String(index + 1));
          }
        });
    
        const grade = calculateGrade(score, totalQuestions);
        setGrade(grade);
    
        setStatistics({
          totalScore: `${score}/${totalQuestions}`,
          passageScore: `${Object.keys(mockData.passage.blanks).length - wrongAnswers.passage.length}/${Object.keys(mockData.passage.blanks).length}`,
          synonymScore: `${mockData.questions.synonym_matching.length - wrongAnswers.synonym.length}/${mockData.questions.synonym_matching.length}`,
          scrambleScore: `${mockData.questions.word_scramble.length - wrongAnswers.scramble.length}/${mockData.questions.word_scramble.length}`,
          wrongAnswers
        });
      };
    
      return { handleSubmit };
}