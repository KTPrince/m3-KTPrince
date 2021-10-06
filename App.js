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
import store from './store/store';

import {Provider} from 'react-redux'
import {atom, observe} from 'elementos'
import { useConstructor, useObservable } from "elementos-react"
import { createInterval } from './components/interval'

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
      <div>
        <h1>Hello, {formatName(currUser)}.</h1>
        <h2>I don't think it's your birthday.</h2>   //TODO: Impliment functionality
        <h3>{currUser.Bio}</h3>
      </div>;
      return textelem;
    }
    return <h1>Hello, Stranger.</h1>;
  }

  function newUserPrompt() {
    return (
      <form action="#" id = "userForm" onSubmit={() => {dataToUser(document.getElementById('firstName').value,
      document.getElementById('lastName').value,
      document.getElementById('DOB').value,
      document.getElementById('Bio').value);
      return false}} >
      <div>
          <label id="prompt">Looks like we don't have any information on you yet.</label> <br />
          <input id="firstName" type="name" placeholder="Enter your first name" required/> <br />
          <input id="lastName" type="name" placeholder="Enter your last name" required/> <br />
          <label>Birthday:   </label><br />
          <input id="DOB" type="date" placeholder="Enter your DOB" required/> <br />
          <textarea 
            id="Bio" 
            type="text" 
            placeholder="Enter a short biography!" 
            cols="15"
            rows="10"
            required>
          </textarea> <br />
      </div>
      <div>
      <button
              type="submit"
            >
              <Text>Let's go!</Text>
            </button>
      </div>
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
    setCurrPage(pages.LOGIN);
  }
  const [value, onChangeText] = useState('');
  function PromptUser(dataName) {
      const dataNameF = dataName.charAt(0).toUpperCase() + dataName.slice(1);
      var textElement =
      <div>
          Please enter your {dataName}.
    
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
                    height: 25,
                  },
                ]}
              />
            );
          }}
        />
      </div>;
    return textElement;
  }

//currPage = pages.LOGIN;
//User login page
if(currPage == pages.LOGIN) {
return(
  <View style={styles.container}>
        <Image source={logo} style={styles.logo} />
        <Provider store={store}>
          <Text style={styles.instructions}>
            {clock}
            {PromptUser("User Name")}
          </Text>
        </Provider>
  </View>
  );
}
//Enter additional info (if creating new account)
if(currPage == pages.USERINFO) {
  return (
    <View style={styles.container}>
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
          <Image source={logo} style={styles.logo} />
          <Provider store={store}>
          <Text style={styles.instructions}>
            {getGreeting()}
            <TouchableOpacity
              onPress={() => deleteAll()}
              style={styles.button}
            >
              <Text style={styles.buttonText}>Delete my Data</Text>
            </TouchableOpacity>
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
