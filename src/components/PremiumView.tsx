import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Check, X, Crown, Zap, Star, Shield, Sparkles } from "lucide-react";
import { motion } from "motion/react";

interface PremiumViewProps {
  onBack: () => void;
}

export function PremiumView({ onBack }: PremiumViewProps) {
  const features = [
    { name: "Practice Quizzes", free: "Limited (5/day)", premium: "Unlimited" },
    { name: "AI Explanations", free: "Basic", premium: "Detailed & Adaptive" },
    { name: "Mock Exams", free: "1 Full Exam", premium: "Unlimited Adaptive Exams" },
    { name: "Smart Review", free: <X className="w-4 h-4 text-muted-foreground" />, premium: <Check className="w-4 h-4 text-green-500" /> },
    { name: "Weakness Analysis", free: <X className="w-4 h-4 text-muted-foreground" />, premium: <Check className="w-4 h-4 text-green-500" /> },
    { name: "Flashcard Generator", free: <X className="w-4 h-4 text-muted-foreground" />, premium: <Check className="w-4 h-4 text-green-500" /> },
    { name: "No Ads", free: <X className="w-4 h-4 text-muted-foreground" />, premium: <Check className="w-4 h-4 text-green-500" /> },
  ];

  const plans = [
    {
      id: "monthly",
      name: "Monthly",
      price: "₱99",
      period: "/ month",
      description: "Perfect for short-term review",
      features: ["Full access for 30 days", "Cancel anytime"],
      popular: false,
      color: "bg-card",
      btnVariant: "outline" as const
    },
    {
      id: "quarterly",
      name: "Quarterly",
      price: "₱249",
      period: "/ 3 months",
      description: "Best for standard review period",
      features: ["Save 15%", "Full access for 90 days"],
      popular: true,
      color: "bg-primary/5 border-primary",
      btnVariant: "default" as const
    },
    {
      id: "lifetime",
      name: "Lifetime",
      price: "₱599",
      period: "one-time",
      description: "Pay once, own it forever",
      features: ["Best Value", "Future updates included", "Priority Support"],
      popular: false,
      color: "bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-200",
      btnVariant: "default" as const,
      isLifetime: true
    }
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-20">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 text-sm font-medium mb-2"
        >
          <Crown className="w-4 h-4 fill-current" />
          <span>Go Premium</span>
        </motion.div>
        <h1 className="text-4xl font-bold tracking-tight">Unlock Your Full Potential</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Get unlimited access to AI-powered tools, adaptive exams, and detailed analytics to guarantee your passing score.
        </p>
      </div>

      {/* Usage Alert */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-center justify-between max-w-2xl mx-auto"
      >
        <div className="flex items-center gap-4">
          <div className="p-2 bg-blue-100 rounded-full">
            <Zap className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="font-semibold text-blue-900">You've used 85% of your free AI explanations.</p>
            <p className="text-sm text-blue-700">Upgrade now to continue learning without limits.</p>
          </div>
        </div>
        <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">Upgrade</Button>
      </motion.div>

      {/* Pricing Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        {plans.map((plan, index) => (
          <motion.div
            key={plan.id}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 + (index * 0.1) }}
            className="relative"
          >
            {plan.popular && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-bold shadow-md z-10">
                Most Popular
              </div>
            )}
            {plan.isLifetime && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-md z-10 flex items-center gap-1">
                <Star className="w-3 h-3 fill-current" /> Best Value
              </div>
            )}
            <Card className={`h-full flex flex-col ${plan.color} ${plan.popular ? 'shadow-lg scale-105 border-primary' : ''} transition-all hover:shadow-xl`}>
              <CardHeader>
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 space-y-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>
                <ul className="space-y-3">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-green-500 shrink-0" />
                      {feature}
                    </li>
                  ))}
                  {/* Common features for all premium plans */}
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-green-500 shrink-0" />
                    Unlimited AI Smart Review
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-green-500 shrink-0" />
                    Adaptive Mock Exams
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button className="w-full" variant={plan.btnVariant} size="lg">
                  Choose {plan.name}
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Feature Comparison Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-center">Compare Plans</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-4 px-4 font-medium text-muted-foreground">Feature</th>
                  <th className="text-center py-4 px-4 font-medium text-muted-foreground w-1/4">Free</th>
                  <th className="text-center py-4 px-4 font-bold text-primary w-1/4 bg-primary/5 rounded-t-lg">Premium</th>
                </tr>
              </thead>
              <tbody>
                {features.map((feature, index) => (
                  <tr key={index} className="border-b last:border-0 hover:bg-muted/50">
                    <td className="py-4 px-4 font-medium">{feature.name}</td>
                    <td className="py-4 px-4 text-center text-muted-foreground">{feature.free}</td>
                    <td className="py-4 px-4 text-center font-medium bg-primary/5">{feature.premium}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Testimonial */}
      <div className="bg-muted/50 rounded-2xl p-8 text-center space-y-4">
        <div className="flex justify-center gap-1">
          {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-5 h-5 text-yellow-500 fill-current" />)}
        </div>
        <blockquote className="text-lg font-medium italic text-muted-foreground">
          "I failed the exam twice before using this app. The AI Smart Review really helped me focus on my weak points. I finally passed with an 88% rating!"
        </blockquote>
        <div>
          <div className="font-bold">Sarah M.</div>
          <div className="text-xs text-muted-foreground">Passed August 2024 Exam</div>
        </div>
      </div>

      {/* Trust Badges */}
      <div className="flex flex-wrap justify-center gap-8 text-muted-foreground grayscale opacity-70">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5" /> Secure Payment
        </div>
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5" /> AI Powered
        </div>
        <div className="flex items-center gap-2">
          <Crown className="w-5 h-5" /> Satisfaction Guarantee
        </div>
      </div>
    </div>
  );
}
