export const Translation: React.FC<{text: string}> = ({ text }) => {
    return (
        <div className="mt-5 w-full max-w-4xl px-4 mx-auto">
            <blockquote className="relative">
                <div className="relative z-10">
                    <p className="text-gray-800">
                        <em className="text-lg sm:text-xl md:text-2xl" data-testid="translation-result">{text}</em>
                    </p>
                </div>
            </blockquote>
        </div>
    )
}