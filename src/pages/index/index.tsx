import { View, Text } from "@tarojs/components";
import { Button, Card } from "@nutui/nutui-react-taro";
import Taro from "@tarojs/taro";
import "./index.scss";

export default function Index() {
  const navigateToFetalCount = () => {
    Taro.navigateTo({
      url: "/pages/fetal-count/index",
    });
  };

  return (
    <View className="index-page">
      <View className="header">
        <Text className="title">数胎动计宫缩</Text>
        <Text className="subtitle">科学记录，安心孕期</Text>
      </View>

      <View className="features">
        <Card className="feature-card" onClick={navigateToFetalCount}>
          <View className="card-content">
            <View className="icon">👶</View>
            <Text className="feature-title">数胎动</Text>
            <Text className="feature-desc">
              固定时间计数法，科学监测胎动频率
            </Text>
          </View>
        </Card>

        <Card className="feature-card coming-soon">
          <View className="card-content">
            <View className="icon">⏰</View>
            <Text className="feature-title">计宫缩</Text>
            <Text className="feature-desc">敬请期待...</Text>
          </View>
        </Card>
      </View>

      <View className="tips">
        <Text className="tips-title">温馨提示</Text>
        <Text className="tips-content">
          建议每天在相同时间进行胎动计数，如有异常请及时就医咨询
        </Text>
      </View>
    </View>
  );
}
