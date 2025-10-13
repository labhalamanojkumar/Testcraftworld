import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Target, Users, Zap, Globe, Award } from "lucide-react";

export default function About() {
  const features = [
    {
      icon: CheckCircle,
      title: "SEO Optimized",
      description: "Built-in SEO tools to help your content rank higher in search results"
    },
    {
      icon: Target,
      title: "Content Focus",
      description: "Clean, distraction-free writing environment for maximum productivity"
    },
    {
      icon: Users,
      title: "Community Driven",
      description: "Connect with like-minded creators and build your audience"
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Optimized performance for the best user experience"
    },
    {
      icon: Globe,
      title: "Global Reach",
      description: "Share your content with audiences worldwide"
    },
    {
      icon: Award,
      title: "Professional Quality",
      description: "Enterprise-grade platform for serious content creators"
    }
  ];

  const stats = [
    { label: "Articles Published", value: "10,000+" },
    { label: "Active Writers", value: "2,500+" },
    { label: "Countries Reached", value: "120+" },
    { label: "Monthly Visitors", value: "500K+" }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-br from-blue-50 via-white to-orange-50">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-4xl mx-auto">
              <Badge variant="secondary" className="mb-4">
                About Testcraft World
              </Badge>
              <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-orange-500 bg-clip-text text-transparent">
                Empowering Content Creators Worldwide
              </h1>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Testcraft World is a modern blogging platform designed for serious content creators who want to focus on what matters most - creating exceptional content that resonates with their audience.
              </p>
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
              <p className="text-lg text-muted-foreground mb-8">
                To democratize content creation by providing creators with powerful, intuitive tools that amplify their voice and help them build meaningful connections with their audience. We believe that great content should be accessible to everyone, regardless of technical expertise.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
                <Card className="p-6 text-left">
                  <h3 className="text-xl font-semibold mb-4">For Writers</h3>
                  <p className="text-muted-foreground">
                    A distraction-free writing environment with powerful editing tools, SEO optimization, and analytics to help you create and publish content that performs.
                  </p>
                </Card>
                <Card className="p-6 text-left">
                  <h3 className="text-xl font-semibold mb-4">For Readers</h3>
                  <p className="text-muted-foreground">
                    A seamless reading experience with beautiful typography, fast loading times, and content that's optimized for engagement and shareability.
                  </p>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Why Choose Testcraft World?</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Built by creators, for creators. Every feature is designed to enhance your content creation workflow.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <Card key={index} className="p-6 text-center hover:shadow-lg transition-shadow">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-orange-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Growing Community</h2>
              <p className="text-lg text-muted-foreground">
                Join thousands of creators who trust Testcraft World for their content needs.
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-orange-500 bg-clip-text text-transparent mb-2">
                    {stat.value}
                  </div>
                  <div className="text-sm text-muted-foreground uppercase tracking-wide">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-gradient-to-r from-blue-600 to-orange-500">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-3xl font-bold text-white mb-4">
                Ready to Start Creating?
              </h2>
              <p className="text-orange-100 mb-8 text-lg">
                Join our community of content creators and start building your audience today.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="/editor"
                  className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                >
                  Start Writing
                </a>
                <a
                  href="/admin"
                  className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-orange-500 transition-colors"
                >
                  Admin Login
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}