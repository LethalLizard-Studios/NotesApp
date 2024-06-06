import { useEffect, useLayoutEffect, useState } from 'react';
import { TouchableOpacity, View, Text, TextInput, StyleSheet, Button } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import tw, { useDeviceContext } from 'twrnc';
import { Provider } from 'react-redux';
import { store } from './store';
import MasonryList from '@react-native-seoul/masonry-list'
import { useSearchNotesQuery, useAddNoteMutation, useDeleteNoteMutation, useUpdateNoteMutation } from './db';

/*Main Screen containing the masonrylist of notes*/
function HomeScreen({ navigation }) {
  const [actualSearch, onActualSearch] = useState("");
  const [searchText, onChangeSearch] = useState("");

  const { data: searchData, error, isLoading } = useSearchNotesQuery(actualSearch);

  /*Count used for index of what note color is used*/
  const [count, setCount] = useState(0); 

  /*Array of colors used on notes*/
  const noteColors = [
    'rgb(253, 230, 138)', 'rgb(239, 68, 68)', '#6495ed',
    '#8fbc8f', '#adff2f',
  ]

  /*Submits search which updates query automatically*/
  const handleSearch = () => {
    console.log("search:",searchText);
    onActualSearch(searchText);
  }

  const handleColorSwap = () => {
    /*Set current color index to next color in bounds*/
    setCount((count + 1) % noteColors.length);
  }

  /*Changes title and adds note color button to header*/
  useLayoutEffect(() => {
    navigation.setOptions({ title: "My Notes" });
    navigation.setOptions({
      headerRight: () => (
        <View style={{flexDirection:"row"}}>
          <Button onPress={handleColorSwap} title="Note Color" />
        </View>
      ),
    });
  }, [navigation, searchText, actualSearch, count]);

  /*Used to render each individual note item*/
  const renderItem = ({ item }) => (
    <TouchableOpacity onPress={() => navigation.navigate("Edit", {data: item}) } style={{ backgroundColor:noteColors[count] }}>  
      <Text style={tw`font-bold text-center mb-2.5`}>{item.title}</Text>
      <Text style={tw`text-center mb-2.5`}>{item.content}</Text>
    </TouchableOpacity>
  )

  return (
    /*Searchbar, masonrylist of all notes and add button*/
    <View style={tw`flex-1 items-center justify-center bg-slate-900`}>
      <TextInput
        style={styles.search}
        onChangeText={search => onChangeSearch(search)}
        onSubmitEditing={handleSearch}
        placeholder="Search"
      />
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
      <TouchableOpacity onPress={() => { navigation.navigate("Add", {data: ""}); }} style={tw`bg-slate-600 rounded-full absolute bottom-[5%] mx-auto items-center flex-1 justify-center w-24 h-12`}>
        <Text style={tw`text-white text-center text-3xl mt--1`}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

/*Edit screen used to edit existing notes*/
function EditScreen({ route, navigation }) {
  const [ deleteNote, { data: deleteNoteData, error: deleteNoteError }] = useDeleteNoteMutation();
  const [ editNote, { data: editNoteData, error: editNoteError }] = useUpdateNoteMutation();

  const [titleText, onChangeTitle] = useState(route.params.data.title);
  const [contentText, onChangeContent] = useState(route.params.data.content);

  /*Changes title and adds delete button to header*/
  useLayoutEffect(() => {
    navigation.setOptions({ title: "Edit" });
    navigation.setOptions({
      headerRight: () => (
          <Button onPress={() => {deleteNote(route.params.data)}} title="Delete" />
      ),
    });
  }, [navigation, contentText]);

  /*Once deleteNoteData is set go back to my notes since the note is deleted*/
  useEffect(() => {
    if (deleteNoteData != undefined) {
      navigation.navigate("My Notes");
    }
  }, [deleteNoteData]);

  /*Updates the notes data using the input texts*/
  useEffect(() => {
    return () => {
      editNote({ id: route.params.data.id, content: contentText, title: titleText });
    };
  }, [contentText, titleText]);

  /*Two text inputs for the title and content*/
  return (
    <View style={tw`flex-1 items-center bg-amber-200`}>
      <TextInput
        style={styles.input}
        onChangeText={title => onChangeTitle(title)}
        value={titleText}
        placeholder="Title"
      />
      <TextInput
        style={styles.inputcontent}
        onChangeText={content => onChangeContent(content)}
        value={contentText}
        placeholder="Content"
        multiline={true}
      />
    </View>
  );
}

/*Used to add new notes by inputing title and content*/
function AddScreen({ route, navigation }) {
  const [ addNote, { data: addNoteData, error: addNoteError }] = useAddNoteMutation();

  const [titleText, onChangeTitle] = useState('');
  const [contentText, onChangeContent] = useState('');

  /*Add new note using the users title and content input*/
  const handleAddNote = () => {
    console.log("title:",titleText);
    addNote({title: titleText, content: contentText})
  }

  /*Changes title and adds add button to header*/
  useLayoutEffect(() => {
    navigation.setOptions({ title: "New Note" });
    navigation.setOptions({
      headerRight: () => (
        <Button onPress={handleAddNote} title="Add" />
      ),
    });
  }, [navigation, titleText, contentText]);

  /*When note is added navigate back to my notes*/
  useEffect(() => {
    if (addNoteData != undefined) {
      console.log(addNoteData.title);
      navigation.navigate("My Notes");
    }
  }, [addNoteData]);

  /*Two text inputs for the title and content*/
  return (
    <View style={tw`flex-1 items-center bg-amber-200`}>
      <TextInput
        style={styles.input}
        onChangeText={title => onChangeTitle(title)}
        value={titleText}
        placeholder="Title"
      />
      <TextInput
        style={styles.inputcontent}
        onChangeText={content => onChangeContent(content)}
        value={contentText}
        placeholder="Content"
        multiline={true}
      />
    </View>
  );
}

const Stack = createNativeStackNavigator();

export default function App() {
  useDeviceContext(tw);

  /*Adds all navigation screens and header settings*/
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
          <Stack.Screen
            options={{
              headerStyle: tw`bg-slate-800 border-0`,
              headerTintColor: '#fff',
              headerTitleStyle: tw`font-bold`,
              headerShadowVisible: false, // gets rid of border on device
            }}
            name="Add"
            component={AddScreen}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </Provider>
  );
}

/*Styles used for textinputs*/
const styles = StyleSheet.create({
  input: {
    height: 60,
    margin: 10,
    padding: 10,
    fontSize: 24,
  },
  inputcontent: {
    flexGrow: 1,
    margin: 10,
    padding: 10,
    fontSize: 24,
  },
  search: {
    width: 'auto',
    margin: 10,
    padding: 6,
    paddingHorizontal: 50,
    fontSize: 24,
    backgroundColor: '#ffffff',
    color: '#000',
    borderRadius: 32,
  },
});