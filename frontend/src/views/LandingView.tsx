import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Target,
  Calendar,
  TrendingUp,
  Dumbbell,
  BarChart3,
  Zap,
  CheckCircle2,
  Trophy,
  Grid3x3,
  Sparkles,
  Shield,
  Clock,
  ArrowRight,
  Star
} from 'lucide-react';
import { useEffect, useState } from 'react';

export default function LandingView() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);
  const features = [
    {
      icon: Calendar,
      title: 'Daily Tracking',
      description: 'Track your habits every day with an intuitive interface designed for consistency.'
    },
    {
      icon: Grid3x3,
      title: 'Visual Grid View',
      description: 'See your progress at a glance with beautiful grid visualizations and heat maps.'
    },
    {
      icon: Dumbbell,
      title: 'Gym & Fitness',
      description: 'Complete workout tracking system with programs, exercises, and progress metrics.'
    },
    {
      icon: TrendingUp,
      title: 'Advanced Analytics',
      description: 'Deep insights into your habits with charts, streaks, and correlation analysis.'
    },
    {
      icon: BarChart3,
      title: 'Interactive Charts',
      description: 'Visualize your progress with beautiful charts and comprehensive dashboards.'
    },
    {
      icon: Target,
      title: 'Focus Mode',
      description: 'Concentrate on your most important habits with our distraction-free focus view.'
    },
    {
      icon: Clock,
      title: 'Smart Reminders',
      description: 'Never miss a habit with intelligent notifications and weekly reviews.'
    },
    {
      icon: Trophy,
      title: 'Achievement System',
      description: 'Celebrate milestones and stay motivated with our comprehensive streak tracking.'
    }
  ];

  return (
    <div className="min-h-screen bg-background overflow-hidden relative">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-blob" />
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-blob animation-delay-4000" />
      </div>

      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.8s ease-out forwards;
        }
        .animate-fade-in {
          animation: fadeIn 0.8s ease-out forwards;
        }
        .animate-scale-in {
          animation: scaleIn 0.8s ease-out forwards;
        }
      `}</style>
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 shadow-sm">
        <div className="container flex h-16 sm:h-18 items-center justify-between px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="flex items-center space-x-2 sm:space-x-3 group cursor-pointer">
            <div className="relative">
              <Target className="h-7 w-7 sm:h-8 sm:w-8 text-primary group-hover:rotate-180 transition-transform duration-500" />
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl group-hover:bg-primary/30 transition-all" />
            </div>
            <span className="font-bold text-xl sm:text-2xl bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
              HabitAlgo
            </span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link to="/login">
              <Button variant="ghost" size="sm" className="text-sm sm:text-base hover:bg-primary/10 transition-all">
                Login
              </Button>
            </Link>
            <Link to="/register">
              <Button size="sm" className="text-sm sm:text-base gap-2 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:scale-105 transition-all">
                <Sparkles className="h-4 w-4" />
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative container px-4 sm:px-6 lg:px-8 pt-16 sm:pt-20 lg:pt-32 pb-16 sm:pb-20 lg:pb-32 max-w-7xl mx-auto">
        <div className="flex flex-col items-center text-center space-y-8 sm:space-y-10 relative z-10">
          <div
            className={`inline-flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 rounded-full border border-primary/20 shadow-lg ${isVisible ? 'animate-fade-in' : 'opacity-0'}`}
            style={{ animationDelay: '0.1s' }}
          >
            <Star className="h-4 w-4 text-primary animate-pulse" />
            <span className="text-xs sm:text-sm font-semibold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
              Transform Your Life, One Habit at a Time
            </span>
          </div>

          <h1
            className={`text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-extrabold tracking-tight max-w-5xl leading-[1.1] ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}
            style={{ animationDelay: '0.2s' }}
          >
            Build Better Habits,
            <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-primary to-blue-600 animate-gradient-x">
              Achieve Your Goals
            </span>
          </h1>

          <style>{`
            @keyframes gradient-x {
              0%, 100% { background-position: 0% 50%; }
              50% { background-position: 100% 50%; }
            }
            .animate-gradient-x {
              background-size: 200% auto;
              animation: gradient-x 3s ease infinite;
            }
          `}</style>

          <p
            className={`text-lg sm:text-xl lg:text-2xl text-muted-foreground max-w-3xl leading-relaxed px-4 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}
            style={{ animationDelay: '0.3s' }}
          >
            The most powerful habit tracking system designed to help you build consistency,
            track progress, and achieve lasting change with data-driven insights.
          </p>

          <div
            className={`flex flex-col sm:flex-row items-center gap-4 sm:gap-5 pt-4 ${isVisible ? 'animate-scale-in' : 'opacity-0'}`}
            style={{ animationDelay: '0.4s' }}
          >
            <Link to="/register" className="w-full sm:w-auto">
              <Button
                size="lg"
                className="text-base sm:text-lg h-12 sm:h-14 px-8 sm:px-10 w-full sm:w-auto gap-2 shadow-2xl shadow-primary/30 hover:shadow-primary/50 hover:scale-105 transition-all duration-300 group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-primary to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                <Zap className="h-5 w-5 group-hover:rotate-12 transition-transform relative z-10" />
                <span className="relative z-10">Start Free Today</span>
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform relative z-10" />
              </Button>
            </Link>
            <Link to="/login" className="w-full sm:w-auto">
              <Button
                variant="outline"
                size="lg"
                className="text-base sm:text-lg h-12 sm:h-14 px-8 sm:px-10 w-full sm:w-auto hover:bg-primary/5 hover:border-primary/50 transition-all duration-300 hover:scale-105"
              >
                Sign In
              </Button>
            </Link>
          </div>

          <div
            className={`flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-sm sm:text-base text-muted-foreground pt-4 ${isVisible ? 'animate-fade-in' : 'opacity-0'}`}
            style={{ animationDelay: '0.5s' }}
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <span>Free forever</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <span>Setup in 30 seconds</span>
            </div>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-1/4 left-10 opacity-20 animate-bounce" style={{ animationDuration: '3s' }}>
          <Trophy className="h-12 w-12 text-primary" />
        </div>
        <div className="absolute top-1/3 right-10 opacity-20 animate-bounce" style={{ animationDuration: '4s', animationDelay: '1s' }}>
          <Target className="h-16 w-16 text-blue-500" />
        </div>
        <div className="absolute bottom-1/4 left-1/4 opacity-20 animate-bounce" style={{ animationDuration: '5s', animationDelay: '0.5s' }}>
          <Sparkles className="h-10 w-10 text-purple-500" />
        </div>
      </section>

      {/* Features Section */}
      <section className="relative container px-4 sm:px-6 lg:px-8 pb-16 sm:pb-20 lg:pb-32 max-w-7xl mx-auto">
        <div className="text-center space-y-4 sm:space-y-5 mb-12 sm:mb-16 lg:mb-20">
          <div className="inline-block">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-foreground via-foreground to-foreground/70">
              Everything You Need to Succeed
            </h2>
            <div className="h-1 bg-gradient-to-r from-transparent via-primary to-transparent rounded-full" />
          </div>
          <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto px-4 leading-relaxed">
            Powerful features designed to help you build and maintain habits that stick
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 lg:gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative p-6 sm:p-7 bg-card/50 backdrop-blur-sm rounded-2xl border border-border/50 hover:border-primary/50 shadow-lg hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 hover:-translate-y-2 cursor-pointer overflow-hidden"
              style={{
                animation: isVisible ? `fadeInUp 0.6s ease-out ${index * 0.1}s forwards` : 'none',
                opacity: isVisible ? 1 : 0
              }}
            >
              {/* Gradient overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <div className="relative z-10">
                <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-5 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500 shadow-lg">
                  <feature.icon className="h-6 w-6 sm:h-7 sm:w-7 text-primary" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold mb-3 group-hover:text-primary transition-colors">
                  {feature.title}
                </h3>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>

              {/* Animated border effect */}
              <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="absolute inset-0 rounded-2xl border-2 border-primary/20 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container px-4 sm:px-6 lg:px-8 pb-16 sm:pb-20 lg:pb-32 max-w-7xl mx-auto">
        <div className="relative max-w-5xl mx-auto bg-gradient-to-br from-primary/10 via-primary/5 to-blue-500/10 rounded-3xl border border-primary/20 p-10 sm:p-14 lg:p-20 text-center overflow-hidden shadow-2xl">
          {/* Animated background gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-blue-500/5 animate-gradient-x" />

          <div className="relative z-10">
            <div className="inline-flex items-center justify-center h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-primary/20 mb-6 sm:mb-8 animate-pulse shadow-lg shadow-primary/50">
              <Shield className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-extrabold mb-4 sm:mb-6 bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
              Ready to Transform Your Life?
            </h2>

            <p className="text-base sm:text-lg lg:text-xl text-muted-foreground mb-8 sm:mb-10 max-w-2xl mx-auto leading-relaxed">
              Start building better habits today and join the journey towards becoming the best version of yourself
            </p>

            <Link to="/register">
              <Button
                size="lg"
                className="text-lg sm:text-xl h-14 sm:h-16 px-10 sm:px-14 gap-3 shadow-2xl shadow-primary/40 hover:shadow-primary/60 hover:scale-105 transition-all duration-300 group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-primary to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                <Sparkles className="h-6 w-6 group-hover:rotate-180 transition-transform duration-500 relative z-10" />
                <span className="relative z-10 font-bold">Start Your Journey</span>
                <ArrowRight className="h-6 w-6 group-hover:translate-x-2 transition-transform relative z-10" />
              </Button>
            </Link>

            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 mt-6 sm:mt-8 text-sm sm:text-base text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <span>No credit card required</span>
              </div>
              <span className="hidden sm:inline">•</span>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <span>Start tracking in 30 seconds</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative border-t bg-gradient-to-b from-muted/30 to-muted/50 backdrop-blur-sm">
        <div className="container px-4 sm:px-6 lg:px-8 py-10 sm:py-12 lg:py-16 max-w-7xl mx-auto">
          <div className="flex flex-col items-center space-y-6">
            <div className="flex items-center space-x-3 group cursor-pointer">
              <div className="relative">
                <Target className="h-7 w-7 sm:h-8 sm:w-8 text-primary group-hover:rotate-180 transition-transform duration-500" />
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl group-hover:bg-primary/40 transition-all" />
              </div>
              <span className="font-bold text-xl sm:text-2xl bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                HabitAlgo
              </span>
            </div>
            <p className="text-sm sm:text-base text-muted-foreground text-center max-w-md">
              Build better habits, one day at a time. Your journey to a better you starts here.
            </p>
            <div className="h-px w-32 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
            <p className="text-xs sm:text-sm text-muted-foreground flex items-center gap-2">
              © 2026 HabitAlgo
              <span>•</span>
              <span>All rights reserved</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
