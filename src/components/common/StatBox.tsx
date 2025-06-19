import { View, Text } from "@tarojs/components";

interface StatBoxProps {
  value: number | string;
  label: string;
  variant?: "default" | "primary" | "secondary";
}

export const StatBox = ({
  value,
  label,
  variant = "default",
}: StatBoxProps) => {
  const variantStyles = {
    default: "from-gray-50 to-slate-50 border-gray-200",
    primary: "from-pink-50 to-rose-50 border-pink-200",
    secondary: "from-blue-50 to-indigo-50 border-blue-100",
  };

  return (
    <View
      className={`bg-gradient-to-br ${variantStyles[variant]} rounded-xl p-4 min-w-18 border`}
    >
      <Text className="text-xl font-bold text-pink-600">{value}</Text>
      <Text className="text-xs text-gray-800 font-medium">{label}</Text>
    </View>
  );
};
