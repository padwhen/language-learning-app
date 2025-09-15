"use client"

import * as React from "react"
import { Link, useLocation } from "react-router-dom"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useContext } from "react"
import { UserContext } from "@/contexts/UserContext"
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog"
import { LoginPage } from "./UsersComponents/LoginPage"
import { Home, LogOut, Settings, Library, BookOpen, Edit3 } from "lucide-react"
import axios from "axios"

export function MobileNav() {
  const [open, setOpen] = React.useState(false)
  const location = useLocation()
  const { user, setUser } = useContext(UserContext)

  const isPage = (path: string): boolean => location.pathname.startsWith(path)
  const deckId = location.pathname.split('/')[2]

  const handleLogout = async () => {
    try {
      await axios.post('/logout');
      setUser(null);
      localStorage.clear();
      window.location.reload();
    } catch (error) {
      console.error('Error logging out: ', error);
    }
  }

  return (
    <div className="md:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            data-testid="mobile-nav-toggle"
            aria-label="Toggle mobile navigation menu"
            aria-expanded={open}
            aria-controls="mobile-nav-content"
            variant="ghost"
            className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
          >
            <svg
              strokeWidth="1.5"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              aria-hidden="true"
            >
              <path
                d="M3 5H11"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              ></path>
              <path
                d="M3 12H16"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              ></path>
              <path
                d="M3 19H21"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              ></path>
            </svg>
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent 
          side="left" 
          className="pr-0" 
          data-testid="mobile-nav-content"
          id="mobile-nav-content"
          aria-label="Mobile navigation menu"
        >
          <MobileLink
            to="/"
            className="flex items-center"
            onOpenChange={setOpen}
            aria-label="Home"
            data-testid="mobile-nav-home"
          >
            <span className="font-bold text-xl text-blue-500">Frassitsanakirja</span>
          </MobileLink>
          <ScrollArea className="my-4 h-[calc(100vh-8rem)] pb-10 pl-6">
            <div className="flex flex-col space-y-3">
              <MobileLink 
                to="/" 
                onOpenChange={setOpen} 
                className="flex items-center gap-2"
                aria-label="Translate"
                data-testid="mobile-nav-translate"
              >
                <Home className="w-4 h-4" aria-hidden="true" />
                Translate
              </MobileLink>
              <MobileLink 
                to="/view-all-decks" 
                onOpenChange={setOpen} 
                className="flex items-center gap-2"
                aria-label="Your decks"
                data-testid="mobile-nav-decks"
              >
                <Library className="w-4 h-4" aria-hidden="true" />
                Your decks
              </MobileLink>
              {user ? (
                <>
                  <MobileLink 
                    to="/settings" 
                    onOpenChange={setOpen} 
                    className="flex items-center gap-2"
                    aria-label="Settings"
                    data-testid="mobile-nav-settings"
                  >
                    <Settings className="w-4 h-4" aria-hidden="true" />
                    Settings
                  </MobileLink>
                  <button 
                    onClick={handleLogout} 
                    className="flex items-center gap-2 text-base md:text-lg text-red-600 hover:text-red-700"
                    aria-label="Log out"
                    data-testid="mobile-nav-logout"
                  >
                    <LogOut className="w-4 h-4" aria-hidden="true" />
                    Log Out
                  </button>
                  <MobileLink 
                    to="/vocabulary" 
                    onOpenChange={setOpen} 
                    className="flex items-center gap-2"
                    aria-label="All saved terms"
                    data-testid="mobile-nav-vocabulary"
                  >
                    <Library className="w-4 h-4" aria-hidden="true" />
                    All saved terms
                  </MobileLink>
                </>
              ) : (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="lg" 
                      className="w-full"
                      aria-label="Open login dialog"
                      data-testid="mobile-nav-login"
                    >
                      Get Started
                    </Button>
                  </DialogTrigger>
                  <DialogContent 
                    className="max-w-[555px] max-h-[570px] overflow-y-auto"
                    aria-label="Login dialog"
                  >
                    <DialogHeader>
                      <DialogTitle className="text-4xl flex items-center justify-center mt-8">Log In</DialogTitle>
                    </DialogHeader>
                    <LoginPage />
                  </DialogContent>
                </Dialog>
              )}
              {(isPage('/view-decks') || isPage('/learn-decks') || isPage('/matchgame') || isPage('/flashcards') || isPage('/edit-deck')) && (
                <MobileLink 
                  to={`/view-decks/${deckId}`} 
                  onOpenChange={setOpen} 
                  className="flex items-center gap-2"
                  aria-label="Deck details"
                  data-testid="mobile-nav-deck-details"
                >
                  <BookOpen className="w-4 h-4" aria-hidden="true" />
                  Deck Details
                </MobileLink>
              )}
              {isPage('/learn-decks') && (
                <MobileLink 
                  to={location.pathname} 
                  onOpenChange={setOpen} 
                  className="flex items-center gap-2"
                  aria-label="Deck learning"
                  data-testid="mobile-nav-deck-learning"
                >
                  <BookOpen className="w-4 h-4" aria-hidden="true" />
                  Deck Learning
                </MobileLink>
              )}
              {isPage('/edit-deck') && (
                <MobileLink 
                  to={location.pathname} 
                  onOpenChange={setOpen} 
                  className="flex items-center gap-2"
                  aria-label="Edit deck"
                  data-testid="mobile-nav-edit-deck"
                >
                  <Edit3 className="w-4 h-4" aria-hidden="true" />
                  Edit deck
                </MobileLink>
              )}
              {isPage(`/view-decks/${deckId}/learning-report`) && (
                <MobileLink 
                  to={location.pathname} 
                  onOpenChange={setOpen} 
                  className="flex items-center gap-2"
                  aria-label="Learning report"
                  data-testid="mobile-nav-learning-report"
                >
                  <Library className="w-4 h-4" aria-hidden="true" />
                  Learning Report
                </MobileLink>
              )}
              {isPage('/flashcards') && (
                <MobileLink 
                  to={location.pathname} 
                  onOpenChange={setOpen} 
                  className="flex items-center gap-2"
                  aria-label="Flashcards review"
                  data-testid="mobile-nav-flashcards"
                >
                  <Library className="w-4 h-4" aria-hidden="true" />
                  Flashcards Review
                </MobileLink>
              )}
              {isPage('/matchgame') && (
                <MobileLink 
                  to={location.pathname} 
                  onOpenChange={setOpen} 
                  className="flex items-center gap-2"
                  aria-label="Match game"
                  data-testid="mobile-nav-match-game"
                >
                  <Library className="w-4 h-4" aria-hidden="true" />
                  Match Game
                </MobileLink>
              )}
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </div>
  )
}

interface MobileLinkProps {
  to: string
  onOpenChange?: (open: boolean) => void
  children: React.ReactNode
  className?: string
  'aria-label'?: string
  'data-testid'?: string
}

function MobileLink({
  to,
  onOpenChange,
  className,
  children,
  'aria-label': ariaLabel,
  'data-testid': testId,
  ...props
}: MobileLinkProps) {
  const location = useLocation()
  return (
    <Link
      to={to}
      onClick={() => {
        onOpenChange?.(false)
      }}
      className={cn(
        "text-base md:text-lg",
        location.pathname === to ? "border-b-2 border-blue-500" : "",
        className
      )}
      aria-label={ariaLabel}
      data-testid={testId}
      {...props}
    >
      {children}
    </Link>
  )
}