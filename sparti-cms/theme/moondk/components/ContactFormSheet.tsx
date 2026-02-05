import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X } from "lucide-react";

interface ContactFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ContactFormSheet({
  open,
  onOpenChange,
}: ContactFormSheetProps) {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    countryCode: "SG",
    phone: "",
    message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // TODO: Implement form submission logic
    // This could send to an API endpoint or email service
    console.log("Form submitted:", formData);

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      // Reset form
      setFormData({
        fullName: "",
        email: "",
        countryCode: "SG",
        phone: "",
        message: "",
      });
      // Close sheet after successful submission
      onOpenChange(false);
      // You could add a toast notification here
    }, 1000);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent 
        side="right" 
        className="w-full sm:max-w-lg overflow-y-auto bg-[#FAF9F6] p-0 border-0 [&>button]:hidden"
      >
        {/* Premium Card Container */}
        <div className="h-full flex flex-col">
          {/* Card with rounded corners and soft shadow */}
          <div className="flex-1 m-4 sm:m-6 bg-white rounded-[20px] shadow-[0_4px_24px_rgba(0,0,0,0.08)] overflow-hidden flex flex-col relative">
            {/* Custom Close Button */}
            <button
              onClick={() => onOpenChange(false)}
              className="absolute top-6 right-6 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-white/90 hover:bg-white border border-[#E0DDD5] text-[#5A5A5A] hover:text-[#2F5C3E] transition-all duration-200 hover:scale-105 shadow-sm"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Header Section with more padding */}
            <SheetHeader className="px-8 pt-10 pb-6 border-b border-[#E8E6E0]">
              <SheetTitle className="text-3xl font-heading tracking-tight text-[#2F5C3E] mb-3">
                Request Reservation
              </SheetTitle>
              <SheetDescription className="text-sm font-body text-[#6B6B6B] leading-relaxed">
                We'd love to welcome you. Share your details and we'll be in touch to confirm your private dining experience.
              </SheetDescription>
            </SheetHeader>

            {/* Form Section with increased padding */}
            <form onSubmit={handleSubmit} className="flex-1 flex flex-col px-8 py-8 space-y-6">
              <div className="space-y-3">
                <Label 
                  htmlFor="fullName" 
                  className="text-[12px] font-body font-medium text-[#6B7A6B] tracking-[0.05em] uppercase block"
                >
                  Full name
                </Label>
                <Input
                  id="fullName"
                  name="fullName"
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={handleChange}
                  className="h-11 bg-[#FAF9F6] border-[#E0DDD5] rounded-lg text-[#1A1A1A] placeholder:text-[#9A9A9A] focus-visible:ring-2 focus-visible:ring-[#2F5C3E]/20 focus-visible:border-[#4A7A5E] transition-all duration-200"
                  placeholder="Your full name"
                />
              </div>

              <div className="space-y-3">
                <Label 
                  htmlFor="email" 
                  className="text-[12px] font-body font-medium text-[#6B7A6B] tracking-[0.05em] uppercase block"
                >
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="h-11 bg-[#FAF9F6] border-[#E0DDD5] rounded-lg text-[#1A1A1A] placeholder:text-[#9A9A9A] focus-visible:ring-2 focus-visible:ring-[#2F5C3E]/20 focus-visible:border-[#4A7A5E] transition-all duration-200"
                  placeholder="your.email@example.com"
                />
              </div>

              <div className="space-y-3">
                <Label 
                  htmlFor="phone" 
                  className="text-[12px] font-body font-medium text-[#6B7A6B] tracking-[0.05em] uppercase block"
                >
                  Phone number
                </Label>
                {/* Unified phone field with seamless connection */}
                <div className="flex gap-0 bg-[#FAF9F6] border border-[#E0DDD5] rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-[#2F5C3E]/20 focus-within:border-[#4A7A5E] transition-all duration-200">
                  <Select
                    value={formData.countryCode}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, countryCode: value }))
                    }
                  >
                    <SelectTrigger className="w-20 h-11 border-0 border-r border-[#E0DDD5] rounded-none bg-transparent focus:ring-0 focus:ring-offset-0 text-[#1A1A1A]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-[#E0DDD5]">
                      <SelectItem value="SG" className="focus:bg-[#F5F5F0]">SG</SelectItem>
                      <SelectItem value="US" className="focus:bg-[#F5F5F0]">US</SelectItem>
                      <SelectItem value="UK" className="focus:bg-[#F5F5F0]">UK</SelectItem>
                      <SelectItem value="KR" className="focus:bg-[#F5F5F0]">KR</SelectItem>
                      <SelectItem value="MY" className="focus:bg-[#F5F5F0]">MY</SelectItem>
                      <SelectItem value="ID" className="focus:bg-[#F5F5F0]">ID</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    className="flex-1 h-11 border-0 rounded-none bg-transparent text-[#1A1A1A] placeholder:text-[#9A9A9A] focus-visible:ring-0 focus-visible:ring-offset-0"
                    placeholder="1234 5678"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label 
                  htmlFor="message" 
                  className="text-[12px] font-body font-medium text-[#6B7A6B] tracking-[0.05em] uppercase block"
                >
                  Message
                </Label>
                <Textarea
                  id="message"
                  name="message"
                  required
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full min-h-[140px] resize-none bg-[#FAF9F6] border-[#E0DDD5] rounded-lg text-[#1A1A1A] placeholder:text-[#9A9A9A] focus-visible:ring-2 focus-visible:ring-[#2F5C3E]/20 focus-visible:border-[#4A7A5E] transition-all duration-200"
                  placeholder="Preferred date, number of guests, dietary requirements, or any special requests..."
                />
              </div>

              {/* Green CTA Button with pill shape */}
              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-12 rounded-full bg-[#2F5C3E] hover:bg-[#1F3D2A] text-white font-medium text-sm tracking-wide transition-all duration-300 hover:shadow-md hover:shadow-[#2F5C3E]/20 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Sending..." : "Request Reservation"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
