import Navbar from "./Navbar"

export default function Header({ setCurrentView }) {
    return (
        <header className="border-b-2 border-underground-border bg-underground-card sticky top-0 z-50 px-4 py-3">
            <Navbar setCurrentView={setCurrentView} />
        </header>
    )
}