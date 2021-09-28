import { StatusBar } from 'expo-status-bar';
import React, {useState, useEffect, useRef, Component} from 'react';
import { Image, Platform, StyleSheet, Animated, Text, TouchableOpacity} from 'react-native';
import { View, TextInput as NativeTextInput} from 'react-native'
import { TextInput} from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import * as Sharing from 'expo-sharing';
import uploadToAnonymousFilesAsync from 'anonymous-files';
import logo from'./assets/MesoSphere.png';
import AsyncStorage from '@react-native-async-storage/async-storage'

export default function App() {
  function formatName(aCurrUser) {
    return aCurrUser.firstName + ' ' + aCurrUser.lastName;
  }

  class user {
    constructor(name) {
      this.name = name;
    }
  }
  //TODO: Use input to store data.
  //TODO: Change JSON storage to String storage.

  var clockelement;
  var reset = false;
  const[currUser,setCurrUser] = useState();

  function tick() {
    //A react 'hook'
    const [time, setTime] = useState(new Date().toLocaleTimeString());
    useEffect(() => {
      if(!reset) {
        document.title = 'It is ' + time;
      } else {
        reset = true;
        console.log("Skipping a frame...");
      }
    }, [time]); //Only re-run the effect if time changes

    //Return statements on useEffect run as cleanup, and will run
    //After _every_ rerender.  eg return () => { console.log(hi!);};

    //Hooks and stuff are weird. https://docs.expo.dev/tutorial/follow-up/

    var clockTimeout = setTimeout(() => {
      setTime(new Date().toLocaleTimeString());
    }, 1000);
    checkForCurrentUser();
    clockelement = 
    <div>
        {getGreeting()}
      <h2>
        It is {time}.
      </h2>
    </div>
    return clockelement;
  }

  async function checkForCurrentUser() {
    let value = await getData("User Name");
    if(currUser == null && value !== null) {
      let u = dataToUser(value);
      setCurrUser(u);
    }
  }

  function getGreeting() {
    if(currUser) {
      return <h1>Hello, {currUser.name}.</h1>;
    }
    return <h1>Hello, Stranger.</h1>;
  }

  function example() {
    const [count, setCount] = useState(0);

    clockelement =
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>
        Click me
      </button>
    </div>;
    return clockelement;
  }

  const storeData = async (key,value) => {
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem(key,jsonValue);
    } catch(e) {
      //Saving error
    }
  }

  const getData = async (key) => {
    try {
      const jsonValue = await AsyncStorage.getItem(key);
      if(jsonValue !== null) {
        return JSON.parse(jsonValue);
      }
      console.log("Data pertaining to " + key + " not found.");
      return null;
    } catch(e) {
      //error reading value
    }
  }

  async function removeValue(key) {
    try {
      await AsyncStorage.removeItem(key);
    } catch(e) {
      //removal error
    }
  }

  function dataToUser(name) {
    return new user(name);
  }

  async function saveData(dataName,value) {
    if(await getData(dataName) === null && value !== "REMOVE_DATA") {
      storeData(dataName,value);
      if(dataName == "User Name") {
        let u = dataToUser(value);
        setCurrUser(u);
      }
    } else if(value !== "REMOVE_DATA") {
      console.log("You've input: "+ value);
      console.log("We already have a user stored! " + getData(dataName));
    } else {
      removeValue(dataName);
    }
  }

  async function deleteAll() {
    let keys = []
    try {
      keys = await AsyncStorage.getAllKeys();
    } catch (e) {
      //read key error
    }
    await AsyncStorage.multiRemove(keys);
    setCurrUser(null);
    reset = true;
    console.log("All data removed.");
  }
  const [value, onChangeText] = useState('');
  function PromptUser(dataName) {
    if (currUser == null) {
     
      const dataNameF = dataName.charAt(0).toUpperCase() + dataName.slice(1);
      var textElement =
      <div>
        <p>
          It looks like we don't have any data on your {dataName}.
        </p>
    
        <TextInput
          label={dataNameF}
          value={value}
          mode="outlined"
          returnKeyType="next"
          onSubmitEditing={() => {
            saveData(dataName,value);
          }}
          numberOfLines={1}
          onChangeText={(text) => onChangeText(text)}
          style={{
            width: '50%',
            alignSelf: 'center',
            marginTop: 2,
            marginBottom: 2,
            height: 25,
          }}
          theme={{ roundness: 20, colors: { primary: '#636363' } }}
          render={(innerProps) => {
            return (
              <NativeTextInput
                {...innerProps}
                style={[
                  innerProps.style,
                  {
                    paddingTop: 3,
                    paddingBottom: 3,
                    height: 20,
                  },
                ]}
              />
            );
          }}
        />
      </div>;
    } else {
      textElement = <p>Good to see you again.</p>
    }
    return textElement;
  }

if(currUser == null) {
return(
  <View style={styles.container}>
        <Image source={logo} style={styles.logo} />
        <Text style={styles.instructions}>
          {tick()}
          {PromptUser("User Name")}
        </Text>
  </View>
  );
} else {
  return (
  <View style={styles.container}>
        <Image source={logo} style={styles.logo} />
        <Text style={styles.instructions}>
          {tick()}
          {PromptUser("User Name")}
          <TouchableOpacity
            onPress={() => deleteAll()}
            style={styles.button}
          >
            <Text style={styles.buttonText}>Delete my Data</Text>
          </TouchableOpacity>
        </Text>
  </View>
  );
}
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 200,
    height: 200,
    resizeMode: 'contain',
    marginBottom: 10,
  },
  instructions: {
    color: '#888',
    fontSize: 18,
    marginHorizontal: 15,
    textAlign: 'center',
  },
  buttonText: {
    fontSize: 20,
    color: '#fff',
  },
  button: {
    marginTop: 20,
    backgroundColor: "blue",
    padding: 20,
    borderRadius: 5
  },
  thumbnail: {
    width: 300,
    height: 300,
    resizeMode: "contain",
  }
});
