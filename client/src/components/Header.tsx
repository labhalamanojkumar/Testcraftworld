import { useState } from "react";
import { Link } from "wouter";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Menu, X, PenSquare, Sun, Moon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/use-auth";

const categories = [
  "Business",
  "Design",
  "Technology",
  "Lifestyle",
  "Latest News",
  "Marketing",
  "News",
  "Others",
];

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { theme, setTheme } = useTheme();
  const { isAuthenticated } = useAuth();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Searching for:", searchQuery);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between gap-4">
          <Link href="/" data-testid="link-home">
            <h1 className="text-xl font-bold relative group cursor-pointer transition-transform duration-300 hover:scale-105">
              <span className="bg-gradient-to-r from-blue-600 to-blue-600 bg-clip-text text-transparent group-hover:from-blue-500 group-hover:to-blue-700 transition-all duration-300">Testcraft</span>
              <span className="bg-gradient-to-r from-orange-500 to-orange-500 bg-clip-text text-transparent group-hover:from-orange-400 group-hover:to-orange-600 transition-all duration-300"> World</span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/30 via-orange-500/30 to-blue-500/30 opacity-0 group-hover:opacity-100 transition-all duration-500 rounded-lg blur-2xl scale-150 -z-10 animate-pulse group-hover:animate-none"></div>
            </h1>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" data-testid="button-categories">
                  Categories
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {categories.map((category) => (
                  <DropdownMenuItem key={category} asChild>
                    <Link href={`/category/${category.toLowerCase().replace(" ", "-")}`} data-testid={`link-category-${category.toLowerCase().replace(" ", "-")}`}>
                      {category}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="ghost" size="sm" asChild data-testid="link-about">
              <Link href="/about">About</Link>
            </Button>
          </nav>

          <div className="flex items-center gap-2">
            <form onSubmit={handleSearch} className="hidden sm:flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search articles..."
                  className="pl-9 w-48 lg:w-64"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  data-testid="input-search"
                />
              </div>
            </form>

            {isAuthenticated && (
              <Button variant="default" size="sm" className="hidden sm:flex" asChild data-testid="button-write">
                <Link href="/editor">
                  <PenSquare className="h-4 w-4 mr-2" />
                  Write
                </Link>
              </Button>
            )}

            <Button variant="ghost" size="sm" className="hidden sm:flex" asChild data-testid="button-login">
              <Link href="/login">Login</Link>
            </Button>

            <Button variant="outline" size="sm" className="hidden sm:flex" asChild data-testid="button-register">
              <Link href="/register">Sign Up</Link>
            </Button>

            {isAuthenticated && (
              <Button variant="ghost" size="sm" className="hidden sm:flex" asChild data-testid="button-dashboard">
                <Link href="/dashboard">Dashboard</Link>
              </Button>
            )}

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="hidden sm:flex"
              data-testid="button-theme-toggle"
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              data-testid="button-mobile-menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <form onSubmit={handleSearch} className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search articles..."
                  className="pl-9 w-full"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  data-testid="input-search-mobile"
                />
              </div>
            </form>
            <nav className="flex flex-col gap-2">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant="ghost"
                  size="sm"
                  className="justify-start"
                  asChild
                  data-testid={`button-category-mobile-${category.toLowerCase().replace(" ", "-")}`}
                >
                  <Link href={`/category/${category.toLowerCase().replace(" ", "-")}`}>
                    {category}
                  </Link>
                </Button>
              ))}
              <Button variant="ghost" size="sm" className="justify-start" asChild data-testid="button-about-mobile">
                <Link href="/about">About</Link>
              </Button>
              {isAuthenticated && (
                <Button variant="default" size="sm" className="justify-start" asChild data-testid="button-write-mobile">
                  <Link href="/editor">
                    <PenSquare className="h-4 w-4 mr-2" />
                    Write Article
                  </Link>
                </Button>
              )}
              <Button variant="ghost" size="sm" className="justify-start" asChild data-testid="button-login-mobile">
                <Link href="/login">Login</Link>
              </Button>
              <Button variant="outline" size="sm" className="justify-start" asChild data-testid="button-register-mobile">
                <Link href="/register">Sign Up</Link>
              </Button>
              {isAuthenticated && (
                <Button variant="ghost" size="sm" className="justify-start" asChild data-testid="button-dashboard-mobile">
                  <Link href="/dashboard">Dashboard</Link>
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="justify-start"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                data-testid="button-theme-toggle-mobile"
              >
                {theme === "dark" ? (
                  <>
                    <Sun className="h-4 w-4 mr-2" />
                    Light Mode
                  </>
                ) : (
                  <>
                    <Moon className="h-4 w-4 mr-2" />
                    Dark Mode
                  </>
                )}
              </Button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
