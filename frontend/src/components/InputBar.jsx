export const InputBar = ({inputText, setInputText, handleTranslation, ready}) => {
    const handleInputChange = (event) => {
        setInputText(event.target.value)
    }
    return (
        <div className="mt-5 w-[830px] gap-x-4">
            <div class="w-full">
                <textarea   rows="5"
                            class="placeholder:italic appearance-none block w-full text-gray-700 border border-gray-200 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                            placeholder="Enter a sentence, paragraph in your desired language... For example: Talvi on kaunis, kun lumipeite peittää maan"
                            value={inputText}
                            onChange={handleInputChange}
                />
    </div>
    <div class="flex justify-between w-full">
        <div class="md:flex md:items-center">
        </div>
        {ready ? (
            <button onClick={handleTranslation}
                    class="shadow bg-indigo-600 hover:bg-indigo-400 focus:shadow-outline focus:outline-none text-white font-bold py-2 px-6 rounded" type="submit">
                Translate
            </button>            
        ) : (
            <button type="button" class="inline-flex items-center shadow bg-indigo-600 hover:bg-indigo-400 focus:shadow-outline focus:outline-none text-white font-bold py-2 px-6 rounded disabled:opacity-50 disabled:pointer-events-none" disabled>
                <span class="mr-2 animate-spin inline-block size-4 border-[3px] border-current border-t-transparent text-white rounded-full" role="status" aria-label="loading"></span>
                Loading
            </button>    
        )}
    </div>
</div>
    )
}