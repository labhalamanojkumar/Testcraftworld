import { Link } from "wouter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Facebook, Twitter, Instagram, Linkedin } from "lucide-react";
import { useState } from "react";

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

export default function Footer() {
  const [email, setEmail] = useState("");

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Subscribing email:", email);
    setEmail("");
  };

  return (
    <footer className="border-t bg-muted/30 mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <h3 className="text-lg font-bold relative group cursor-pointer transition-transform duration-300 hover:scale-105">
                <span className="bg-gradient-to-r from-blue-600 to-blue-600 bg-clip-text text-transparent group-hover:from-blue-500 group-hover:to-blue-700 transition-all duration-300">Testcraft</span>
                <span className="bg-gradient-to-r from-orange-500 to-orange-500 bg-clip-text text-transparent group-hover:from-orange-400 group-hover:to-orange-600 transition-all duration-300"> World</span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/30 via-orange-500/30 to-blue-500/30 opacity-0 group-hover:opacity-100 transition-all duration-500 rounded-lg blur-2xl scale-150 -z-10 animate-pulse group-hover:animate-none"></div>
              </h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Testcraft World is a modern blogging platform where readers and writers connect through diverse ideas and stories. It offers rich content across Business, Design, Technology, Lifestyle, News, and Marketing. The platform inspires curiosity and keeps audiences engaged with the trends shaping today's world.
            </p>
            <div className="flex gap-2">
              <Button variant="ghost" size="icon" data-testid="link-facebook">
                <Facebook className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" data-testid="link-twitter">
                <Twitter className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" data-testid="link-instagram">
                <Instagram className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" data-testid="link-linkedin">
                <Linkedin className="h-5 w-5" />
              </Button>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4">Categories</h3>
            <ul className="space-y-2">
              {categories.map((category) => (
                <li key={category}>
                  <Link
                    href={`/category/${category.toLowerCase().replace(" ", "-")}`}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    data-testid={`link-footer-category-${category.toLowerCase().replace(" ", "-")}`}
                  >
                    {category}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4">Newsletter</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Subscribe to get the latest articles delivered to your inbox weekly.
            </p>
            <form onSubmit={handleSubscribe} className="flex gap-2">
              <Input
                type="email"
                placeholder="Your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                data-testid="input-newsletter-email"
              />
              <Button type="submit" data-testid="button-subscribe">
                Subscribe
              </Button>
            </form>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <p>&copy; 2025 <span className="relative group cursor-pointer font-medium transition-transform duration-300 hover:scale-105">
            <span className="bg-gradient-to-r from-blue-600 to-blue-600 bg-clip-text text-transparent group-hover:from-blue-500 group-hover:to-blue-700 transition-all duration-300">Testcraft</span>
            <span className="bg-gradient-to-r from-orange-500 to-orange-500 bg-clip-text text-transparent group-hover:from-orange-400 group-hover:to-orange-600 transition-all duration-300"> World</span>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/30 via-orange-500/30 to-blue-500/30 opacity-0 group-hover:opacity-100 transition-all duration-500 rounded-lg blur-2xl scale-150 -z-10 animate-pulse group-hover:animate-none"></div>
          </span>. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/privacy" data-testid="link-privacy">Privacy Policy</Link>
            <Link href="/terms" data-testid="link-terms">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
