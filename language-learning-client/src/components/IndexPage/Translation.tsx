export const Translation: React.FC<{text: string; highlighted?: boolean}> = ({ text, highlighted }) => {
    return (
        <div className={`mt-5 w-full max-w-4xl px-4 mx-auto transition-all duration-300 ${highlighted ? 'ring-4 ring-blue-500 ring-opacity-75 bg-blue-50 rounded-lg p-6 shadow-lg' : ''}`}>
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