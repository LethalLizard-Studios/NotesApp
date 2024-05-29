import { useEffect, useLayoutEffect } from 'react';
import { TouchableOpacity, View, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import tw, { useDeviceContext } from 'twrnc';
import { Provider } from 'react-redux';
import { store } from './store';
import MasonryList from '@react-native-seoul/masonry-list'
import { useSearchNotesQuery, useAddNoteMutation, useDeleteNoteMutation, useUpdateNoteMutation } from './db';

function HomeScreen({ navigation }) {
  const { data: searchData, error, isLoading } = useSearchNotesQuery("");
  const [ addNote, { data: addNoteData, error: addNoteError }] = useAddNoteMutation();
  const [ editNote, { data: editNoteData, error: editNoteError }] = useUpdateNoteMutation();
  
  useEffect(() => {
    if (addNoteData != undefined) {
      console.log(addNoteData.title);
      navigation.navigate("Edit", {data: addNoteData});
    }
  }, [addNoteData]);

  useEffect(() => {
    if (editNoteData != undefined) {
      console.log(editNoteData.title);
      navigation.navigate("Edit", {data: editNoteData});
    }
  }, [editNoteData]);

  const renderItem = ({ item }) => (
    //<TouchableOpacity onPress={() => deleteNote(item) } style={tw`w-[98%] mb-1 mx-auto bg-amber-200 rounded-sm px-1`}>
    <TouchableOpacity onPress={() => editNote(item) } style={tw`w-[98%] mb-1 mx-auto bg-amber-200 rounded-sm px-1`}>  
      <Text style={tw`font-bold text-center mb-2.5`}>{item.id}</Text>
      <Text style={tw`text-center mb-2.5`}>{item.content}</Text>
    </TouchableOpacity>
  )

  return (
    <View style={tw`flex-1 items-center justify-center bg-slate-900`}>
      {searchData ? 
        <MasonryList
          style={tw`px-0.5 pt-0.5 pb-20`}
          data={searchData}
          numColumns={2}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
        />  
        : <></>
      }
      <TouchableOpacity onPress={() => { addNote({title: "test", content: "content"}); }} style={tw`bg-slate-600 rounded-full absolute bottom-[5%] mx-auto items-center flex-1 justify-center w-24 h-12`}>
        <Text style={tw`text-white text-center text-3xl mt--1`}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

function EditScreen({ route, navigation }) {
  const [ deleteNote, { data: deleteNoteData, error: deleteNoteError }] = useDeleteNoteMutation();

  useLayoutEffect(() => {
    navigation.setOptions({ title: route.params.data.id });
  }, []);

  useEffect(() => {
    if (deleteNoteData != undefined) {
      navigation.navigate("My Notes");
    }
  }, [deleteNoteData]);

  return (
    
    <View style={tw`flex-1 items-center justify-center bg-amber-200`}>
      <Text style={tw`text-lg text-black`}>{route.params.data.title}</Text>
      <Text style={tw`text-lg text-black`}>{route.params.data.content}</Text>

      <TouchableOpacity onPress={() => { deleteNote(route.params.data) }} style={tw`bg-red-900 rounded-full absolute bottom-[5%] mx-auto items-center flex-1 justify-center w-36 h-12`}>
        <Text style={tw`text-white text-center text-3xl mt--1`}>Delete</Text>
      </TouchableOpacity>
    </View>
  );
}

const Stack = createNativeStackNavigator();

export default function App() {
  useDeviceContext(tw);

  return (
    <Provider store={store}>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Notes">
          <Stack.Screen
            options={{
              headerStyle: tw`bg-slate-800 border-0`,
              headerTintColor: '#fff',
              headerTitleStyle: tw`font-bold`,
              headerShadowVisible: false, // gets rid of border on device
            }}
            name="My Notes"
            component={HomeScreen}
          />
          <Stack.Screen
            options={{
              headerStyle: tw`bg-slate-800 border-0`,
              headerTintColor: '#fff',
              headerTitleStyle: tw`font-bold`,
              headerShadowVisible: false, // gets rid of border on device
            }}
            name="Edit"
            component={EditScreen}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </Provider>
  );
}