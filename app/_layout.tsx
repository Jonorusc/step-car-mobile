import { Stack } from "expo-router"
import React from "react"
import { StatusBar } from "react-native"
import { Colors } from "@/constants/Colors"
import { BLEDevicesProvider } from "@/hooks/context/useBLE"
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context"

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <BLEDevicesProvider>
        <StatusBar barStyle="dark-content" backgroundColor={Colors.light.background} translucent animated={false} />
        <SafeAreaView style={{ flex: 1, backgroundColor: Colors.light.background }}>
          <Stack>
            <Stack.Screen
              name="index"
              options={{
                headerShown: false,
                contentStyle: { flex: 1 },
              }}
            />
            <Stack.Screen
              name="printer"
              options={{
                headerShown: false,
                contentStyle: { flex: 1 },
              }}
            />
            <Stack.Screen
              name="another"
              options={{
                headerShown: false,
                contentStyle: { flex: 1 },
              }}
            />
          </Stack>
        </SafeAreaView>
      </BLEDevicesProvider>
    </SafeAreaProvider>
  )
}
