import { useNavigate } from 'react-router-dom'
import { Boxes } from "../components/ui/background-boxes"
import { cn } from "@/lib/utils"

export default function WelcomePage() {
    const navigate = useNavigate()

    const handleStartGame = () => {
        navigate('/game')
    }

    return (
        <div className="h-screen w-screen relative overflow-hidden bg-white flex flex-col items-center justify-center">
            <div className="absolute inset-0 w-full h-full bg-white z-20 mask-[radial-gradient(transparent,white)] pointer-events-none" />
            <Boxes />
            <div className="relative z-20 flex flex-col items-center gap-6 px-4">
                <div className="flex flex-col items-center px-8 py-6 rounded-3xl bg-white/20 backdrop-blur-lg border border-black/10 shadow-lg">
                    <h1 className={cn("md:text-6xl text-4xl text-black font-semibold text-center")}>
                        Game of Life
                    </h1>
                </div>
                <div className="flex flex-col items-center px-8 py-5 rounded-3xl bg-white/20 backdrop-blur-lg border border-black/10 shadow-lg">
                    <p className="text-center text-black/70 max-w-md">
                        Explore Conway's Game of Life - a cellular automaton where simple rules create complex patterns
                    </p>
                </div>
                <div className="flex flex-col items-center px-2 py-2 rounded-3xl bg-white/20 backdrop-blur-lg border border-black/10 shadow-lg">
                    <button
                        onClick={handleStartGame}
                        className="px-6 py-2 rounded-3xl border border-black/10 bg-white text-black hover:opacity-60 shadow-lg font-semibold transition-opacity"
                    >
                        Start the game
                    </button>
                </div>
            </div>
        </div>
    )
}
