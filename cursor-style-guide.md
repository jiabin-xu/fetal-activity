# 体重管理小程序 - Cursor 环境配置与样式指南

## 技术栈概览

- 框架: Taro v4 + React 18
- 语言: TypeScript
- 样式: TailwindCSS
- 目标平台: 微信小程序 (主要)

## 代码风格规范

### TypeScript/React 规范

- 使用函数式组件和 React Hooks
- 所有组件使用 `.tsx` 扩展名
- 使用 interface 而非 type 定义组件 Props
- 组件命名使用 PascalCase (如 `WeightTracker.tsx`)
- 非组件文件使用 camelCase (如 `weightService.ts`)
- 使用 ES6+ 特性，如箭头函数、解构赋值、可选链等

```typescript
// 组件示例
import { FC } from "react";
import { View, Text } from "@tarojs/components";

interface WeightInputProps {
  value: number;
  onChange: (value: number) => void;
  label?: string;
}

const WeightInput: FC<WeightInputProps> = ({
  value,
  onChange,
  label = "体重",
}) => {
  return (
    <View className="weight-input-container">
      <Text className="weight-input-label">{label}</Text>
      {/* 组件内容 */}
    </View>
  );
};

export default WeightInput;
```

### 目录结构规范

- `/src/components/` - 可复用组件
- `/src/pages/` - 页面组件
- `/src/services/` - API 请求和数据处理
- `/src/hooks/` - 自定义 Hooks
- `/src/utils/` - 工具函数
- `/src/constants/` - 常量定义
- `/src/types/` - TypeScript 类型定义
- `/src/assets/` - 静态资源

### 导入顺序规范

1. React/Taro 相关库
2. 第三方库
3. 自定义组件/hooks
4. 工具函数/常量
5. 类型导入
6. 样式文件

```typescript
// 导入顺序示例
import { useEffect, useState } from "react";
import { View, Button } from "@tarojs/components";
import Taro from "@tarojs/taro";

import { Chart } from "some-chart-library";

import WeightCard from "@/components/WeightCard";
import { useWeightData } from "@/hooks/useWeightData";

import { formatWeight } from "@/utils/formatters";
import { WEIGHT_UNITS } from "@/constants/units";

import type { WeightRecord } from "@/types/weight";

import "./index.css";
```

## 基础组件库

### 常用组件示例

```jsx
// 体重输入组件
const WeightInput = ({ value, onChange }) => (
  <View className="mb-4">
    <Text className="text-base font-semibold text-duolingo-gray-500 mb-2">
      当前体重
    </Text>
    <Input
      type="digit"
      className="w-full p-4 border-2 border-duolingo-gray-200 rounded-duolingo focus:border-duolingo-primary focus:outline-none text-lg"
      value={value}
      onInput={(e) => onChange(e.detail.value)}
      placeholder="请输入体重"
    />
  </View>
);

// 进度条组件
const ProgressBar = ({ percent }) => (
  <View className="w-full bg-duolingo-gray-100 rounded-full h-4 overflow-hidden">
    <View
      className="bg-duolingo-primary h-full rounded-full transition-all duration-300 ease-out"
      style={{ width: `${percent}%` }}
    />
  </View>
);

// 提示卡片组件
const TipCard = ({ tip, type = "info" }) => {
  const bgColors = {
    info: "bg-duolingo-secondary bg-opacity-10",
    success: "bg-duolingo-primary bg-opacity-10",
    warning: "bg-duolingo-warning bg-opacity-10",
    error: "bg-duolingo-error bg-opacity-10",
  };

  const textColors = {
    info: "text-duolingo-secondary",
    success: "text-duolingo-primary",
    warning: "text-duolingo-warning",
    error: "text-duolingo-error",
  };

  return (
    <View className={`p-4 rounded-lg ${bgColors[type]} mb-4`}>
      <Text className={`${textColors[type]} text-sm`}>{tip}</Text>
    </View>
  );
};
```

## 开发工具配置

### VS Code 推荐扩展

- ESLint
- Prettier
- Tailwind CSS IntelliSense
- React/TypeScript/JavaScript snippets

### 推荐配置

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "tailwindCSS.includeLanguages": {
    "typescript": "javascript",
    "typescriptreact": "javascript"
  }
}
```
