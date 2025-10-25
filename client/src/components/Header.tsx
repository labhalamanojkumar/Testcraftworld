import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Menu, X, PenSquare, Sun, Moon, User, LayoutDashboard, UserCircle, LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

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
  const { isAuthenticated, user, logout } = useAuth();
  const [, setLocation] = useLocation();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Searching for:", searchQuery);
  };

  const handleLogout = async () => {
    await logout();
    setLocation("/");
  };

  const getUserInitials = () => {
    if (!user) return "U";
    if (user.name) {
      const names = user.name.split(" ");
      if (names.length >= 2) {
        return `${names[0][0]}${names[1][0]}`.toUpperCase();
      }
      return user.name.substring(0, 2).toUpperCase();
    }
    return user.username?.substring(0, 2).toUpperCase() || "U";
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

            {!isAuthenticated && (
              <>
                <Button variant="ghost" size="sm" className="hidden sm:flex" asChild data-testid="button-login">
                  <Link href="/login">Login</Link>
                </Button>

                <Button variant="outline" size="sm" className="hidden sm:flex" asChild data-testid="button-register">
                  <Link href="/register">Sign Up</Link>
                </Button>
              </>
            )}

            {isAuthenticated && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="hidden sm:flex gap-2" data-testid="button-user-menu">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-xs">{getUserInitials()}</AvatarFallback>
                    </Avatar>
                    <span>{user?.name || user?.username}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user?.name || user?.username}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="cursor-pointer" data-testid="menu-dashboard">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      <span>Dashboard</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="cursor-pointer" data-testid="menu-profile">
                      <UserCircle className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600" data-testid="menu-logout">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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
              {!isAuthenticated && (
                <>
                  <Button variant="ghost" size="sm" className="justify-start" asChild data-testid="button-login-mobile">
                    <Link href="/login">Login</Link>
                  </Button>
                  <Button variant="outline" size="sm" className="justify-start" asChild data-testid="button-register-mobile">
                    <Link href="/register">Sign Up</Link>
                  </Button>
                </>
              )}
              {isAuthenticated && (
                <>
                  <div className="my-2 border-t pt-2">
                    <div className="px-2 py-2 text-sm font-medium text-muted-foreground">
                      {user?.name || user?.username}
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="justify-start" asChild data-testid="button-dashboard-mobile">
                    <Link href="/dashboard">
                      <LayoutDashboard className="h-4 w-4 mr-2" />
                      Dashboard
                    </Link>
                  </Button>
                  <Button variant="ghost" size="sm" className="justify-start" asChild data-testid="button-profile-mobile">
                    <Link href="/profile">
                      <UserCircle className="h-4 w-4 mr-2" />
                      Profile
                    </Link>
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950" 
                    onClick={handleLogout}
                    data-testid="button-logout-mobile"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </>
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
