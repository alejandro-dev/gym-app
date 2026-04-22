import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Card, Text } from 'react-native-paper';

import { APP_COPY } from '@/theme';

export default function HomeScreen() {
  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-950">
      <View className="flex-1 px-6 py-8">
        <View className="flex-1 justify-between">
          <View className="gap-4">
            <Text variant="headlineMedium">{APP_COPY.title}</Text>
            <Text variant="bodyLarge" className="text-slate-600 dark:text-slate-300">
              {APP_COPY.subtitle}
            </Text>
          </View>

          <Card className="rounded-3xl bg-white dark:bg-slate-900">
            <Card.Content className="gap-4 p-6">
              <Text variant="titleMedium">Base lista para seguir construyendo</Text>
              <Text variant="bodyMedium" className="text-slate-600 dark:text-slate-300">
                Expo Router ya controla la navegacion, Paper aporta los componentes y
                NativeWind se queda con el layout y el spacing.
              </Text>
              <Button mode="contained" onPress={() => undefined}>
                Empezar con auth
              </Button>
            </Card.Content>
          </Card>
        </View>
      </View>
    </SafeAreaView>
  );
}
