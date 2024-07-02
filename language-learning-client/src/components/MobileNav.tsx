"use client"

import * as React from "react"
import { Link, useLocation } from "react-router-dom"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

export function MobileNav() {
  const [open, setOpen] = React.useState(false)
  const location = useLocation()

  const isPage = (path: string): boolean => location.pathname.startsWith(path)
  const deckId = location.pathname.split('/')[2]

  return (
    <div className="md:hidden">
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
            data-testid="mobile-nav-toggle"
          variant="ghost"
          className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
        >
          <svg
            strokeWidth="1.5"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
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
      <SheetContent side="left" className="pr-0" data-testid="mobile-nav-content">
        <MobileLink
          to="/"
          className="flex items-center"
          onOpenChange={setOpen}
        >
          <span className="font-bold text-xl text-blue-500">Frassitsanakirja</span>
        </MobileLink>
        <ScrollArea className="my-4 h-[calc(100vh-8rem)] pb-10 pl-6">
          <div className="flex flex-col space-y-3">
            <MobileLink to="/" onOpenChange={setOpen}>
              Translate
            </MobileLink>
            <MobileLink to="/view-all-decks" onOpenChange={setOpen}>
              Your decks
            </MobileLink>
            <MobileLink to="/settings" onOpenChange={setOpen}>
              Settings
            </MobileLink>
            {(isPage('/view-decks') || isPage('/learn-decks') || isPage('/edit-deck')) && (
              <MobileLink to={`/view-decks/${deckId}`} onOpenChange={setOpen}>
                Deck Details
              </MobileLink>
            )}
            {isPage('/learn-decks') && (
              <MobileLink to={location.pathname} onOpenChange={setOpen}>
                Deck Learning
              </MobileLink>
            )}
            {isPage('/edit-deck') && (
              <MobileLink to={location.pathname} onOpenChange={setOpen}>
                Edit deck
              </MobileLink>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet></div>
  )
}

interface MobileLinkProps {
  to: string
  onOpenChange?: (open: boolean) => void
  children: React.ReactNode
  className?: string
}

function MobileLink({
  to,
  onOpenChange,
  className,
  children,
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
      {...props}
    >
      {children}
    </Link>
  )
}