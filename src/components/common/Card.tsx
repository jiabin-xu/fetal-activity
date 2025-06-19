import { View } from "@tarojs/components";
import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  variant?: "default" | "primary" | "secondary";
}

export const Card = ({
  children,
  className = "",
  variant = "default",
}: CardProps) => {
  const baseStyles = "backdrop-blur-sm rounded-3xl border";

  const variantStyles = {
    default: "bg-white/95 shadow-lg shadow-pink-200/30 border-pink-100/50",
    primary: "bg-white/95 shadow-xl shadow-pink-200/40 border-pink-100/50",
    secondary:
      "bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200/60",
  };

  return (
    <View className={`${baseStyles} ${variantStyles[variant]} ${className}`}>
      {children}
    </View>
  );
};
