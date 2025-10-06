import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Menu, X, PenSquare } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const categories = [
  "Business",
  "Design",
  "Technology",
  "Lifestyle",
  "Latest News",
  "Marketing",
];

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Searching for:", searchQuery);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between gap-4">
          <Link href="/" data-testid="link-home">
            <h1 className="text-2xl font-bold text-foreground">BlogMaster</h1>
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

            <Button variant="default" size="sm" className="hidden sm:flex" asChild data-testid="button-write">
              <Link href="/editor">
                <PenSquare className="h-4 w-4 mr-2" />
                Write
              </Link>
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
              <Button variant="default" size="sm" className="justify-start" asChild data-testid="button-write-mobile">
                <Link href="/editor">
                  <PenSquare className="h-4 w-4 mr-2" />
                  Write Article
                </Link>
              </Button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
