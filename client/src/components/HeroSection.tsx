import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowRight } from "lucide-react";
import heroImage from "@assets/generated_images/Blogging_workspace_hero_image_0071983a.png";

export default function HeroSection() {
  return (
    <section className="relative h-[500px] md:h-[600px] w-full overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroImage})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/40" />
      
      <div className="relative container mx-auto px-4 h-full flex items-center">
        <div className="max-w-2xl text-white">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight">
            Create Content That Ranks & Earns
          </h2>
          <p className="text-lg md:text-xl mb-8 text-white/90">
            Build your blogging empire with powerful SEO tools and seamless AdSense
            integration. Start writing, publishing, and monetizing today.
          </p>
          <div className="flex flex-wrap gap-4">
            <Button
              size="lg"
              className="bg-primary hover:bg-primary border-primary-border text-white"
              asChild
              data-testid="button-hero-start"
            >
              <Link href="/editor">
                Start Writing <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20"
              asChild
              data-testid="button-hero-explore"
            >
              <Link href="/category/business">Explore Articles</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
