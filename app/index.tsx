import { WebView, WebViewMessageEvent } from "react-native-webview"
import { StyleSheet } from "react-native"
import { Link, router } from "expo-router"
import React from "react"

export default function App() {
  const handleWebViewMessage = (event: WebViewMessageEvent) => {
    const data = event.nativeEvent.data
    router.push({ pathname: "/printer", params: { printData: data } })
  }
  return (
    <>
      <WebView
        style={styles.container}
        source={{ uri: "https://stepcar.com.br" }}
        onMessage={handleWebViewMessage}
        javaScriptEnabled
      />
      <Link href="/printer" style={{ color: "black", fontSize: 20, padding: 16 }}>
        Testar impressora (1)
      </Link>
      <Link href="/another" style={{ color: "black", fontSize: 20, padding: 16 }}>
        Testar impressora (2)
      </Link>
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
})
