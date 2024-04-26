export const Translation: React.FC<{text: string}> = ({ text }) => {
    return (
        <div className="mt-5 w-[830px] gap-x-4">
            <blockquote className="relative">
                <div className="relative z-10">
                    <p className="text-gray-800">
                        <em className="text-2xl">{text}</em>
                    </p>
                </div>
            </blockquote>
        </div>
    )
}