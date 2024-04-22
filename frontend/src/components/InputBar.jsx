export const InputBar = () => {
    return (
        <div className="mt-5 w-[830px] gap-x-4">
            <div class="w-full">
                <textarea rows="5"
                class="placeholder:italic appearance-none block w-full text-gray-700 border border-gray-200 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                placeholder="Enter a sentence, paragraph in your desired language..."
                />
    </div>
    <div class="flex justify-between w-full">
        <div class="md:flex md:items-center">
        </div>
        <button class="shadow bg-indigo-600 hover:bg-indigo-400 focus:shadow-outline focus:outline-none text-white font-bold py-2 px-6 rounded" type="submit">
            Translate
        </button>
    </div>
</div>
    )
}