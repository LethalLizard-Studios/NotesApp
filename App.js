import { SafeAreaView, Text } from 'react-native';
import tw, { useDeviceContext } from 'twrnc';
import { Provider } from 'react-redux';
import { store } from './store';
import 'react-native-reanimated'; 
import MasonryList from '@react-native-seoul/masonry-list';

function App() {
  useDeviceContext(tw);

  return (
    <Provider store={store}>
      <SafeAreaView>
        <Text style={tw`w-screen mt-16 text-center text-xl`}>
          Your app code goes here.
        </Text>
      </SafeAreaView>
    </Provider>
  )
}

export default App;
