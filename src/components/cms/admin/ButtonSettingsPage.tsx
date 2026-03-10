import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { ArrowRight, Check, Copy } from "lucide-react";
import { VariantProps } from "class-variance-authority";
import { buttonVariants } from "@/components/ui/button";

// Define the type for button variants
type ButtonVariant = NonNullable<VariantProps<typeof buttonVariants>["variant"]>;

const ButtonSettingsPage: React.FC = () => {
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopyCode = (code: string, variant: string) => {
    navigator.clipboard.writeText(code);
    setCopied(variant);
    setTimeout(() => setCopied(null), 2000);
  };

  const buttonVariants = [
    {
      title: "Primary Button",
      variant: "default" as ButtonVariant,
      description: "The main call-to-action button",
      bgColor: "#3b82f6",
      hoverColor: "#2563eb",
      textColor: "#ffffff",
      code: '<Button variant="default" size="default">Primary Button</Button>'
    },
    {
      title: "Secondary Button",
      variant: "secondary" as ButtonVariant,
      description: "Used for secondary actions",
      bgColor: "#e5e7eb",
      hoverColor: "#d1d5db",
      textColor: "#111827",
      code: '<Button variant="secondary" size="default">Secondary Button</Button>'
    },
    {
      title: "Coral Button",
      variant: "coral" as ButtonVariant,
      description: "Vibrant call-to-action button",
      bgColor: "#F94E40",
      hoverColor: "#e03a2e",
      textColor: "#ffffff",
      code: '<Button variant="coral" size="default">Coral Button</Button>'
    },
    {
      title: "Branded Button",
      variant: "branded" as ButtonVariant,
      description: "Button using brand purple color",
      bgColor: "#9b87f5",
      hoverColor: "#8a74e8",
      textColor: "#ffffff",
      code: '<Button variant="branded" size="default">Branded Button</Button>'
    },
    {
      title: "Gradient Button",
      variant: "cta-gradient" as ButtonVariant,
      description: "Eye-catching gradient button",
      gradient: "from-[#9b87f5] via-[#7E69AB] to-[#0EA5E9]",
      textColor: "#ffffff",
      code: '<Button variant="cta-gradient" size="default">Gradient Button</Button>'
    },
    {
      title: "Outline Button",
      variant: "cta-outline" as ButtonVariant,
      description: "Bordered button with hover effect",
      borderColor: "#9b87f5",
      textColor: "#9b87f5",
      hoverBg: "#9b87f5",
      hoverText: "#ffffff",
      code: '<Button variant="cta-outline" size="default">Outline Button</Button>'
    },
    {
      title: "Destructive Button",
      variant: "destructive" as ButtonVariant,
      description: "Used for destructive actions",
      bgColor: "#ef4444",
      hoverColor: "#dc2626",
      textColor: "#ffffff",
      code: '<Button variant="destructive" size="default">Destructive Button</Button>'
    }
  ];

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-xl font-semibold text-foreground mb-2">Button Settings</h3>
        <p className="text-muted-foreground">
          Customize the appearance of buttons across your site
        </p>
      </div>

      {/* Button Variants */}
      <div className="space-y-8">
        <h4 className="text-lg font-medium text-foreground border-b border-border pb-2">Button Variants</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {buttonVariants.map((button) => (
            <div key={button.variant} className="bg-secondary/20 rounded-lg p-6 border border-border">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h5 className="font-medium text-foreground">{button.title}</h5>
                  <p className="text-sm text-muted-foreground">{button.description}</p>
                </div>
                <button
                  onClick={() => handleCopyCode(button.code, button.variant)}
                  className="text-muted-foreground hover:text-foreground p-1 rounded-md transition-colors"
                  title="Copy code"
                >
                  {copied === button.variant ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
                </button>
              </div>
              
              <div className="flex flex-col space-y-4">
                <div className="flex flex-wrap gap-4">
                  <Button variant={button.variant} size="default">
                    {button.title}
                  </Button>
                  <Button variant={button.variant} size="sm">
                    Small
                  </Button>
                  <Button variant={button.variant} size="lg">
                    Large
                  </Button>
                </div>
                
                <div className="flex flex-wrap gap-4">
                  <Button variant={button.variant} size="default" disabled>
                    Disabled
                  </Button>
                  <Button variant={button.variant} size="default">
                    <span className="flex items-center">
                      With Icon
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </span>
                  </Button>
                </div>
                
                <div className="mt-4 pt-4 border-t border-border">
                  <div className="flex flex-col space-y-2">
                    <div className="text-xs text-muted-foreground font-mono bg-secondary/30 p-2 rounded-md overflow-x-auto">
                      {button.code}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Button Sizes */}
      <div className="space-y-4">
        <h4 className="text-lg font-medium text-foreground border-b border-border pb-2">Button Sizes</h4>
        
        <div className="bg-secondary/20 rounded-lg p-6 border border-border">
          <div className="flex flex-col space-y-6">
            <div>
              <h5 className="font-medium text-foreground mb-2">Default Size</h5>
              <Button variant="default" size="default">Default Button</Button>
            </div>
            
            <div>
              <h5 className="font-medium text-foreground mb-2">Small Size</h5>
              <Button variant="default" size="sm">Small Button</Button>
            </div>
            
            <div>
              <h5 className="font-medium text-foreground mb-2">Large Size</h5>
              <Button variant="default" size="lg">Large Button</Button>
            </div>
            
            <div>
              <h5 className="font-medium text-foreground mb-2">Extra Large Size</h5>
              <Button variant="default" size="xl">Extra Large Button</Button>
            </div>
            
            <div>
              <h5 className="font-medium text-foreground mb-2">Icon Button</h5>
              <Button variant="default" size="icon"><ArrowRight className="h-4 w-4" /></Button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex justify-end">
        <Button variant="default">Save Button Settings</Button>
      </div>
    </div>
  );
};

export default ButtonSettingsPage;
