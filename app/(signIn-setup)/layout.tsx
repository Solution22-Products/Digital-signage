export default function SetupLayout({children}: {children:React.ReactNode}) {
    return(
        <>
            <div className={` w-full bg-white text-black flex `}>
                
                    <main className='w-full'>
                            {children}
                    </main>
            
            </div>
        </>
    )
}