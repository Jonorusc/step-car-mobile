import React from 'react';
import {View, Text, Button} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import Printer from './Printer';
import {WebView} from 'react-native-webview';
import {SafeAreaProvider} from 'react-native-safe-area-context';

const Stack = createStackNavigator();

const HomeScreen = ({navigation}) => {
  const handleOnMessage = event => {
    const data = event.nativeEvent.data;
    // navigate to printer with the data as the param
    navigation.navigate('Printer', {data});
  };

  return (
    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
      <WebView
        source={{uri: 'https://stepcar.com.br/'}}
        style={{flex: 1, width: '100%', height: '100%'}}
        onMessage={handleOnMessage}
      />
      <Button
        title="Impressora de teste"
        onPress={() => navigation.navigate('Printer')}
      />
    </View>
  );
};

const App = () => {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Home">
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="Printer"
            component={Printer}
            options={{title: 'Imprimir Cupom'}}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
};

export default App;
