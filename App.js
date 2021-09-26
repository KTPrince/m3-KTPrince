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
  function formatName(user) {
    return user.firstName + ' ' + user.lastName;
  }

  //TODO: Use input to store data.

  const fadeAnim = useRef(new Animated.Value(0)).current;

  const fadeIn = () => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 3000,
    }).start();
  };

  var clockelement;
  var user;

  function tick() {
    //A react 'hook'
    const [time, setTime] = useState(new Date().toLocaleTimeString());
    useEffect(() => {
        document.title = 'It is ' + time;
    }, [time]); //Only re-run the effect if time changes

    //Return statements on useEffect run as cleanup, and will run
    //After _every_ rerender.  eg return () => { console.log(hi!);};

    //Hooks and stuff are weird. https://docs.expo.dev/tutorial/follow-up/

    var clockTimeout = setTimeout(() => {
      setTime(new Date().toLocaleTimeString());
    }, 1000);
    clockelement = 
    <div>
        {getGreeting(user)}
      <h2>
        It is {time}.
      </h2>
    </div>
    return clockelement;
  }

  function getGreeting(user) {
    if(user) {
      return <h1>Hello, {formatName(user)}.</h1>;
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



  function PromptUser(dataName) {
    const handleKeyDown = (event) => {
      if (event.key === 'Enter') {
        console.log('do something idk');
      }
    }
    const [value, onChangeText] = useState('');
    const dataNameF = dataName.charAt(0).toUpperCase() + dataName.slice(1);
    var textElement =
    <div>
      <p>
        It looks like we don't have any data on {dataName}.
      </p>
    
      <TextInput
        label={dataNameF}
        value={value}
        mode="outlined"
        returnKeyType="next"
        onSubmitEditing={() => {
          
        }}
        onKeyDown={handleKeyDown}
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
    return textElement;
  }

return(
  <View style={styles.container}>
        <Image source={logo} style={styles.logo} />
        <Text style={styles.instructions}>
          {tick()}
          {PromptUser('your first name')}
        </Text>
  </View>
  );
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
