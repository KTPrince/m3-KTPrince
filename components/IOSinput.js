import React from 'react'
import { KeyboardAvoidingView, Text} from 'react-native'
import { TextInput as NativeTextInput} from 'react-native'
function IOSinput() {
    //const [sampleText, setSampleText] = React.useState('');
    //const dataNameF = dataName.charAt(0).toUpperCase() + dataName.slice(1);
    return (
        <KeyboardAvoidingView
          behavior="padding"
        >
          <Text>Please enter your end.</Text>
          <NativeTextInput 
            //style={styles.input}
            placeholder="hi"
            onChangeText={text => setSampleText(text)}
            value={"hi"} 
            blurOnSubmit={false}
          
          />
        </KeyboardAvoidingView>
    );
}

export default IOSinput
