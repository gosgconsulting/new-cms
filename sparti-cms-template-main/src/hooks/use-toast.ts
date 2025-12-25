import { toast } from "sonner";

interface ToastProps {
  title: string;
  description?: string;
  variant?: "default" | "destructive";
}

export const useToast = () => {
  const toastFn = ({ title, description, variant }: ToastProps) => {
    if (variant === "destructive") {
      toast.error(title, { description });
    } else {
      toast.success(title, { description });
    }
  };

  return { toast: toastFn };
};