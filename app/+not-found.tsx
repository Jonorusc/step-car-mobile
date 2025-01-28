import { Stack } from "expo-router"
import { StyleSheet } from "react-native"

export default function NotFoundScreen() {
  // redirec to home
  return (
    <Stack>
      <Stack.Screen name="index" />
    </Stack>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
})
