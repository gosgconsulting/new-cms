
import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const LandingPageTemplate = () => {
  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <Badge className="mb-4 bg-white text-purple-600">Limited Time Offer</Badge>
          <h1 className="text-5xl font-bold mb-6">Landing Page Headline</h1>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            Focused value proposition that addresses a specific pain point and presents your solution.
          </p>
          <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white">
            Convert Now
          </Button>
        </div>
      </section>

      {/* Key Benefits */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose Us?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {["Key Benefit 1", "Key Benefit 2", "Key Benefit 3"].map((benefit, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">💎</span>
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{benefit}</h3>
                  <p className="text-gray-600">
                    Explanation of {benefit.toLowerCase()} and how it specifically helps solve your target audience's problem.
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Product Features</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {["Feature 1", "Feature 2", "Feature 3", "Feature 4"].map((feature, index) => (
              <div key={index} className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-xl">🚀</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">{feature}</h3>
                  <p className="text-gray-600">
                    Detailed description of {feature.toLowerCase()} and its specific benefits for users.
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">What Our Customers Say</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {[1, 2].map((testimonial) => (
              <Card key={testimonial} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <p className="text-gray-600 mb-4 italic">
                    "This is a sample testimonial that highlights the positive experience and results achieved by using your product or service."
                  </p>
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gray-200 rounded-full mr-4"></div>
                    <div>
                      <p className="font-semibold">Customer Name</p>
                      <p className="text-sm text-gray-500">Job Title, Company</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-purple-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Don't miss out on this opportunity. Take action now and start seeing results today.
          </p>
          <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white">
            Start Your Journey Now
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LandingPageTemplate;
