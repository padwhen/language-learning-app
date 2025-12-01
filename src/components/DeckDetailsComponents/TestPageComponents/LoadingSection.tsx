import loadingSvg from '../../../assets/3-dots-bounce.svg'

export const LoadingSection = () => {
    return (
        <div className='flex flex-col items-center justify-center w-full h-full'>
            <img src={loadingSvg} alt='Loading' className='w-16 h-16 mb-4' />
            <p className='text-lg font-semibold'>Generating your test...</p>
        </div>
    )
}