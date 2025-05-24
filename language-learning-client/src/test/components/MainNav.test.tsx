import { vi } from "vitest";
import { BrowserRouter } from "react-router-dom";
import { UserContext } from "@/contexts/UserContext";
import { render, screen } from "@testing-library/react";
import { MainNav } from "@/components/MainNav";

const mockUseLocation = vi.fn()
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom')
    return {
        ...actual,
        useLocation: () => mockUseLocation()
    }
})

const mockRefreshUserContext = vi.fn()
const mockSetUser = vi.fn()

const renderWithProviders = (
    ui: React.ReactElement, 
    { user = null }: { user?: { name: string; avatarUrl: string } | null } = {}
) => {
    return render(
        <BrowserRouter>
            <UserContext.Provider value={{ 
                user: user ? { ...user, _id: '123', username: user.name } : null, 
                setUser: mockSetUser, 
                isAuthenticated: false, 
                refreshUserStats: mockRefreshUserContext
            }}>
                {ui}
            </UserContext.Provider>
        </BrowserRouter>
    );
};


describe('MainNav Breadcrumbs', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        mockUseLocation.mockReturnValue({ 
            pathname: '/',
        })
    })
    it('shows only "Your decks" on view-all-decks page', () => {
        mockUseLocation.mockReturnValue({ pathname:  '/view-all-decks' })
        renderWithProviders(<MainNav />)
        expect(screen.getByText('Your decks')).toBeInTheDocument()
        expect(screen.queryByText('Deck Details')).not.toBeInTheDocument()
    })
    it('shows "Your decks" and "Deck Details" on deck view page', () => {
        mockUseLocation.mockReturnValue({ pathname: '/view-decks/123' })
        renderWithProviders(<MainNav />)
        expect(screen.getByText('Your decks')).toBeInTheDocument()
        expect(screen.getByText('Deck Details')).toBeInTheDocument()
    })
    it('shows "Your decks", "Deck Details", and "Deck Learning" on learn page', () => {
        mockUseLocation.mockReturnValue({ pathname: '/learn-decks/123' })
        renderWithProviders(<MainNav />)
        expect(screen.getByText('Your decks')).toBeInTheDocument()
        expect(screen.getByText('Deck Details')).toBeInTheDocument()
        expect(screen.getByText('Deck Learning')).toBeInTheDocument()
    })
    it('shows "Your decks", "Deck Details", and "Edit deck" on edit page', () => {
        mockUseLocation.mockReturnValue({ pathname: '/edit-deck/123' })
        renderWithProviders(<MainNav />)
        expect(screen.getByText('Your decks')).toBeInTheDocument()
        expect(screen.getByText('Deck Details')).toBeInTheDocument()
    })
    it('shows "Settings" when on settings page', () => {
        mockUseLocation.mockReturnValue({ pathname: '/settings' })
        renderWithProviders(<MainNav />)
        expect(screen.getByText('Settings')).toBeInTheDocument()
        expect(screen.queryByText('Your decks')).not.toBeInTheDocument()
    })
})
