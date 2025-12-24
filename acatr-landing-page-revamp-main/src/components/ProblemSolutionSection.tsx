import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, CheckCircle, Users, Calculator, FileText } from "lucide-react";
import { Component } from "@/types/schema";
import { getHeading, getText, getArrayTextItems, getArrayObjectItems } from "@/lib/schema-utils";

interface ProblemSolutionSectionProps {
  data?: Component;
}

// Icon mapping based on solution title keywords
const getSolutionIcon = (title: string, index: number) => {
  const lowerTitle = title.toLowerCase();
  if (lowerTitle.includes("incorporation") || lowerTitle.includes("company")) return Users;
  if (lowerTitle.includes("accounting") || lowerTitle.includes("tax")) return Calculator;
  if (lowerTitle.includes("secretary") || lowerTitle.includes("compliance")) return FileText;
  // Default icons based on index
  const icons = [Users, Calculator, FileText];
  return icons[index % icons.length];
};

const ProblemSolutionSection = ({ data }: ProblemSolutionSectionProps = {}) => {
  // Extract data from schema or use defaults
  const title = data ? getHeading(data.items, 2) : "Stop Losing Money on Compliance Mistakes";
  const description = data ? getText(data.items, "description") : "Every day without proper setup costs you money, opportunities, and peace of mind. ACRA penalties and compliance issues can destroy your business before it starts.";
  const problems = data ? getArrayTextItems(data.items, "problems") : ["Struggling with complex ACRA registration requirements", "Worried about IRAS compliance and GST filing deadlines", "Spending valuable time on paperwork instead of business growth", "Facing potential penalties from missed regulatory deadlines"];
  const solutionObjects = data ? getArrayObjectItems(data.items, "solutions") : [];
  
  // Default solutions if no data
  const defaultSolutions = [{
    icon: Users,
    title: "Singapore Company Incorporation in 24 Hours",
    description: "ACRA-registered filing agents handling complete business setup from name reservation to bank account opening with 100% compliance guarantee.",
    features: ["ACRA company registration", "Business bank account setup", "Registered office address", "Company name reservation"]
  }, {
    icon: Calculator,
    title: "Professional Singapore Accounting Services",
    description: "Qualified chartered accountants providing comprehensive bookkeeping, corporate tax filing, and GST compliance with IRAS requirements.",
    features: ["Monthly bookkeeping & financial statements", "Singapore corporate tax filing", "GST registration & filing", "ACRA annual return filing"]
  }, {
    icon: FileText,
    title: "Singapore Corporate Secretary Services",
    description: "Professional company secretaries ensuring 100% ACRA compliance with all statutory requirements and regulatory deadlines.",
    features: ["ACRA annual return submissions", "Statutory compliance monitoring", "Board meeting documentation", "99% compliance success rate"]
  }];

  // Map solution objects to solution format with icons
  const solutions = solutionObjects.length > 0
    ? solutionObjects.map((obj, index) => ({
        icon: getSolutionIcon(obj.props.title || "", index),
        title: obj.props.title || "",
        description: obj.props.description || "",
        features: Array.isArray(obj.props.features) ? obj.props.features : []
      }))
    : defaultSolutions;
  return <section className="py-20 bg-background">
      <div className="container mx-auto px-6">
        {/* Problem Statement */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-destructive/10 text-destructive px-4 py-2 rounded-full mb-6">
            <AlertTriangle className="h-4 w-4" />
            <span className="text-sm font-medium">The Challenge</span>
          </div>
          
          <h2 className="text-3xl lg:text-4xl font-bold mb-6">
            {title}
          </h2>
          
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            {description}
          </p>

          <div className="grid md:grid-cols-2 gap-4 max-w-4xl mx-auto">
            {problems.map((problem, index) => <div key={index} className="flex items-start gap-3 text-left p-4 bg-muted/50 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-destructive mt-1 flex-shrink-0" />
                <span className="text-muted-foreground">{problem}</span>
              </div>)}
          </div>
        </div>

        {/* Solutions */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-6">
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm font-medium">Our Solution</span>
          </div>
          
          <h2 className="text-3xl lg:text-4xl font-bold mb-6">
            ACRA-Registered Experts Guarantee Your{" "}
            <span className="bg-gradient-primary bg-clip-text text-transparent">Success</span>
          </h2>
          
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            As official ACRA-registered filing agents, we provide the fastest, most reliable Singapore business setup with guaranteed compliance and zero penalties.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {solutions.map((solution, index) => <Card key={index} className="relative group hover:shadow-medium transition-all duration-300 border-2 hover:border-primary/20">
              <CardContent className="p-8">
                <div className="mb-6">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-primary rounded-xl mb-4">
                    <solution.icon className="h-6 w-6 text-primary-foreground" />
                  </div>
                  
                  <h3 className="text-xl font-bold mb-3">{solution.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{solution.description}</p>
                </div>

                <div className="space-y-3">
                  {solution.features.map((feature, featureIndex) => <div key={featureIndex} className="flex items-center gap-3">
                      <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                      <span className="text-sm text-foreground">{feature}</span>
                    </div>)}
                </div>

                {/* Hover effect gradient */}
                <div className="absolute inset-0 bg-gradient-primary opacity-0 group-hover:opacity-5 transition-opacity duration-300 rounded-lg" />
              </CardContent>
            </Card>)}
        </div>

        {/* Bottom CTA */}
        
      </div>
    </section>;
};
export default ProblemSolutionSection;