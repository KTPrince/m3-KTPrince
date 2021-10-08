import { StatusBar } from 'expo-status-bar';
import React, {Form, useState, useEffect, useRef, Component} from 'react';
import { SafeAreaView, Image, Platform, StyleSheet, Animated, Text, TouchableOpacity} from 'react-native';
import { KeyboardAvoidingView, View, TextInput as NativeTextInput} from 'react-native'
import { Portal, TextInput} from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import * as Sharing from 'expo-sharing';
import uploadToAnonymousFilesAsync from 'anonymous-files';
import logo from'./assets/MesoSphere.png';
import AsyncStorage from '@react-native-async-storage/async-storage'
import store from './store/store';
import IOSinput from './components/IOSinput';

import {Provider} from 'react-redux'
import {atom, observe} from 'elementos'
import { useConstructor, useObservable } from "elementos-react"
import { createInterval } from './components/interval'
const Prompt = IOSinput();

const createClock$ = (defaultVal) => {
  return atom(defaultVal, {
      actions: (set) => ({
          update: () => set(new Date().toLocaleTimeString())
      })
  });
};

export default function App() {
  //TODO: Refractor.
  //TODO: Experiment with iOS capabilities (publish test app to app store?)
  const clockSelf = useConstructor(({ beforeUnmount }) => {
    const clock$ = createClock$(new Date().toLocaleTimeString());
    const interval = createInterval(() => {
        clock$.actions.update();
    }, 1000);

    beforeUnmount(interval.dispose);

    return {
        clock$,
        interval
    };
  });

const clock = useObservable(clockSelf.clock$);
  
  const pages = {
    LOGIN: 0,
    USERINFO: 1,
    ACCOUNTPAGE: 2,
  }

  const[currPage,setCurrPage] = useState(pages.LOGIN);

  function formatName(aCurrUser) {
    return aCurrUser.firstName + ' ' + aCurrUser.lastName;
  }

  class user {
    constructor(username, firstName, lastName, DOB, Bio) {
      this.username = username;
      this.firstName = firstName;
      this.lastName = lastName;
      this.DOB = DOB;
      this.Bio = Bio;
    }
  }

  //var clockelement;
  var reset = false;
  const[currUser,setCurrUser] = useState();

    //Hooks and stuff are weird. https://docs.expo.dev/tutorial/follow-up/

  async function checkForCurrentUser() {
    let value = await getData("User Name");
    if(currUser == null && value !== null) {
      let u = dataToUser(value);
      setCurrUser(u);
    }
  }

  function getGreeting() {
    if(currUser) {
      var textelem = 
      <View>
        <Text>{"\n"}</Text>
        <h1>Hello, {formatName(currUser)}.</h1>
        <Text>{"\n"}</Text>
        {dateProcess(currUser.DOB)}
        <Text>{"\n"}</Text>
        <h3>{currUser.Bio}</h3>
        <Text>{"\n"}</Text>
      </View>;
      return textelem;
    }
    return <h1>Hello, Stranger.</h1>;
  }

  function dateProcess(dateS) {
    var dString = dateS + 'T19:00:00.000Z';
    let d = new Date(dString);
    var today = new Date();
    //console.log(today.getMonth() == d.getMonth());
    if(today.getDate() == d.getDate() && today.getMonth() == d.getMonth()) {
      return (
        <View>
          <Text>{"\n"}</Text>
          <h2>
            HAPPY BIRTHDAY!!!! 🎉🎊🥳
          </h2>
        </View>
      )
    }
    return (
      <p>It's not your birthday. Same-age sandy.</p>
    )
  }

  function newUserPrompt() {
    return (
      <form action="#" id = "userForm" onSubmit={() => {dataToUser(document.getElementById('firstName').value,
      document.getElementById('lastName').value,
      document.getElementById('DOB').value,
      document.getElementById('Bio').value);
      return false}} >
      <View>
      <Text>{"\n"}</Text>
          <label id="prompt">Looks like we don't have any information on you yet.</label> <Text>{"\n"}</Text>
          <input id="firstName" type="name" placeholder="Enter your first name" required/> <Text>{"\n"}</Text>
          <input id="lastName" type="name" placeholder="Enter your last name" required/> <Text>{"\n"}</Text>
          <label>Birthday:   </label><Text>{"\n"}</Text>
          <input id="DOB" type="date" placeholder="Enter your DOB" required/> <Text>{"\n"}</Text>
          <textarea 
            id="Bio" 
            type="text" 
            placeholder="Enter a short biography!" 
            cols="15"
            rows="10"
            required>
          </textarea> <Text>{"\n"}</Text>
      </View>
      <Text>{"\n"}</Text>
      <View>
      <Text>{"\n"}</Text>
      <button
              type="submit"
            >
              <Text>Let's go!</Text>
            </button>
      </View>
      </form>
    )
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

  async function dataToUser(firstName, lastName, DOB, Bio) {
    let username = await getData("User Name");
    let u = new user(username, firstName, lastName, DOB, Bio);
    storeData(username,u);
    setCurrUser(u);
    setCurrPage(pages.ACCOUNTPAGE);
  }

  async function saveData(dataName,value) {
    if(value !== "REMOVE_DATA") {
      if(dataName === "User Name") {
        console.log("Running user name code...");
        console.log("Current page: " + currPage);
        if(await getData(value) != null) {
          reconstructUser(value);
          setCurrPage(pages.ACCOUNTPAGE);
        } else {
          storeData(dataName,value)
          setCurrPage(pages.USERINFO);
        }
      } else {
        storeData(dataName,value)
      }
    } else {
      removeValue(dataName);
    }
  }

  async function reconstructUser(username) {
    let temp = await getData(username);
    let u = new user(temp.username, temp.firstName, temp.lastName, temp.DOB, temp.Bio);
    setCurrUser(u);
  }

  function adminCheck() {
    if(currUser != null && currUser.username == 'admin') {
    return (
      <TouchableOpacity
      onPress={() => {deleteAll();setCurrPage(pages.LOGIN)}}
      style={styles.button}
    >
      <Text style={styles.buttonText}>Delete ALL Data</Text>
    </TouchableOpacity>
    )
    }
    return;
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
    //console.log("All data removed.");
    setCurrPage(pages.LOGIN);
  }
  
  const [sampleText, setSampleText] = React.useState('');
  const [value, onChangeText] = useState('');
  function PromptUser(dataName) {
      const dataNameF = dataName.charAt(0).toUpperCase() + dataName.slice(1);
      if(Platform.OS === 'web') {
        var textElement =
        <View>
          <Text>{"\n"}</Text>
          <Text>Please enter your {dataName}.</Text>
    
        <TextInput
          label={dataNameF}
          value={value}
          mode="outlined"
          returnKeyType="next"
          onSubmitEditing={() => {
            saveData(dataName,value);
            onChangeText('');
          }}
          numberOfLines={1}
          onChangeText={(text) => onChangeText(text)}
          style={{
            width: '80%',
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
                    height: 25,
                  },
                ]}
              />
            );
          }}
        />
      </View>;
    } else {
      var stextelement =
      <KeyboardAvoidingView
        behavior="padding"
      >
          <Text>Hi Johnny.</Text>
          <NativeTextInput
            style={styles.input}
            label="Email"
            value={sampleText}
            mode="outlined"
            multiline
            numberOfLines={1}
            onChangeText={(text) => setSampleText(text)}
            render={(innerProps) => {
              return (
                <NativeTextInput
                  {...innerProps}
                  style={[
                    innerProps.style,
                    {
                      paddingTop: 8,
                      paddingBottom: 8,
                      height: 90,
                    },
                  ]}
                />
                );
            }}
            />
        </KeyboardAvoidingView>;

        var textElement =   <IOSinput></IOSinput>;    
      
      
      }
    return textElement;
  }
//currPage = pages.LOGIN;
//User login page
if(currPage == pages.LOGIN) {
return(
  <KeyboardAvoidingView 
    style={styles.container}
    behavior="padding"
  >
    <Text>{"\n"}</Text>
        <Image source={logo} style={styles.logo} />
          <Text style={styles.instructions}>
            {"\n"}
            {PromptUser("User Name")}
            <Prompt></Prompt>
          </Text>
      <View style ={{height:10}} />
  </KeyboardAvoidingView>
  );
}
//Enter additional info (if creating new account)
if(currPage == pages.USERINFO) {
  return (
    <View style={styles.container}>
      <Text>{"\n"}</Text>
        <Image source={logo} style={styles.logo} />
        <Provider store={store}>
        <Text style={styles.instructions}>
          {newUserPrompt()}
        </Text>
        </Provider>
    </View>
  );
}
//View Account info (if account found)
if(currPage == pages.ACCOUNTPAGE) {
  return (
    <View style={styles.container}>
      <Text>{"\n"}</Text>
          <Image source={logo} style={styles.logo} />
          <Provider store={store}>
          <Text style={styles.instructions}>
            {getGreeting()}
            <Text>{"\n"}</Text>
            <TouchableOpacity
              onPress={() => {removeValue(currUser.username);setCurrPage(pages.LOGIN)}}
              style={styles.button}
            >
              <Text style={styles.buttonText}>Delete my Data</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setCurrPage(pages.LOGIN)}
              style={styles.button}
            >
              <Text style={styles.buttonText}>Logout</Text>
            </TouchableOpacity>
            {adminCheck()}
          </Text>
          </Provider>
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
    marginLeft:20,
    marginTop: 20,
    backgroundColor: "blue",
    padding: 20,
    borderRadius: 5
  },
  thumbnail: {
    width: 300,
    height: 300,
    resizeMode: "contain",
  },
  input: {
    borderColor: "gray",
    width: "80%",
    height: 40,
    marginTop: 20,
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    alignContent: "center",
    alignItems: "center",
    alignSelf: "center",
  }
});
