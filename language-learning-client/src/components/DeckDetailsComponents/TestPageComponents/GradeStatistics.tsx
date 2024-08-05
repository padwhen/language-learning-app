import { Statistics } from "@/types";
import React from "react";

interface GradeStatisticsProps {
    grade: string;
    statistics: Statistics | null
}

export const GradeStatistics: React.FC<GradeStatisticsProps> = ({ grade, statistics }) => {
    return (
        <div className="mt-4">
            <h2 className='text-xl font-bold'>Your Grade: {grade}</h2>
            <h3 className='text-lg font-semibold mt-2'>Statistics:</h3>
            <p>Total Score: {statistics?.totalScore}</p>
            <p>Passage Section: {statistics?.passageScore}</p>
            <p>Synonym Matching: {statistics?.synonymScore}</p>
            <p>Word Scramble: {statistics?.scrambleScore}</p>
            <h4 className='text-md font-semibold mt-2'>Incorrect Answers</h4>
            <p>Passage: {statistics?.wrongAnswers.passage.join(', ') || 'None'}</p>
            <p>Synonym Matching: {statistics?.wrongAnswers.synonym.join(', ') || 'None'}</p>
            <p>Scramble: {statistics?.wrongAnswers.scramble.join(', ') || 'None'}</p>
        </div>
    )
}