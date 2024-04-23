export const Translation = ({text}) => {
    if (!text) {
        return null;
    }
    return (
        <div className="mt-5 w-[830px] gap-x-4">
            <blockquote class="relative">
                <div class="relative z-10">
                    <p class="text-gray-800 sm:text-xl dark:text-white"><em>
                        {text}
                    </em></p>
                </div>
            </blockquote>
        </div>
    )
}