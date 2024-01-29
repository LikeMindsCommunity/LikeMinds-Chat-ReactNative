/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';
import {KeyboardAvoidingView, Platform} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {navigationRef} from './RootNavigation';
import {
  CarouselScreen,
  ContextProvider,
  CreatePollScreen,
  FileUpload,
  ImageCropScreen,
  LMChatProvider,
  PollResult,
  VideoPlayer,
} from 'likeminds_chat_reactnative_integration';
import {myClient} from '.';
import ChatroomScreen from './screens/Chatroom';

const Stack = createNativeStackNavigator();

function App(): React.JSX.Element {
  const userName = 'Jai';
  const userUniqueId = 'Jai';
  const chatroomId = '4033778';

  // themeStyling
  {
    /* const themeStyles = {
    hue: 10,
    fontColor: 'black',
    primaryColor: 'green',
    secondaryColor: 'green',
    lightBackgroundColor: '#d7f7ed',
  }; */
  }

  // styling for reactionList
  {
    /* const reactionListStyles = {
    reactionSize: 0,
    reactionLeftItemStroke: 'pink',
    reactionRightItemStroke: 'yellow',
    reactionItemBorderRadius: 5,
    gap: 5,
  }; */
  }

  // styling for chatBubble
  {
    /* 
  const chatBubbleStyles = {
    borderRadius: 5,
    sentMessageBackgroundColor: 'yellow',
    receivedMessageBackgroundColor: 'pink',
    selectedBackgroundColor: 'grey',
    selectedMessageBackgroundColor: 'purple',
    textStyles: {
      fontSize: 10,
      fontStyle: 'italic',
      fontFamily: 'SofiaPro-SemiBold',
    },
    linkTextColor: 'red',
    taggingTextColor: 'yellow',
    stateMessagesBackgroundColor: 'pink',
    stateMessagesTextStyles: {
      fontSize: 10,
      fontStyle: 'italic',
      fontFamily: 'SofiaPro-SemiBold',
    },
  };
*/
  }

  // styling for inputBox
  {
    /* 
  const inputBoxStyles = {
    placeholderTextColor: '#aaa',
    selectionColor: '#aaa',
    plainTextStyle: {color: 'black'},
    partsTextStyle: {
      color: '#007AFF',
    },
    sendIconStyles: {
      width: 22,
      height: 22,
      resizeMode: 'contain',
      marginLeft: 5,
    },
    attachmentIconStyles: {
      width: 22,
      height: 22,
      resizeMode: 'contain',
    },
    micIconStyles: {
      width: 22,
      height: 22,
      resizeMode: 'contain',
    },
    cameraIconStyles: {
      width: 22,
      height: 22,
      resizeMode: 'contain',
    },
    galleryIconStyles: {
      width: 22,
      height: 22,
      resizeMode: 'contain',
    },
    documentIconStyles: {
      width: 22,
      height: 22,
      resizeMode: 'contain',
    },
    pollIconStyles: {
      width: 22,
      height: 22,
      resizeMode: 'contain',
    },
  };
  */
  }

  return (
    <ContextProvider>
      <LMChatProvider
        myClient={myClient}
        userName={userName}
        userUniqueId={userUniqueId}
        // chatBubbleStyles={chatBubbleStyles}
        // reactionListStyles={reactionListStyles}
        // inputBoxStyles={inputBoxStyles}
        // themeStyles={themeStyles}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{flex: 1}}>
          <NavigationContainer ref={navigationRef} independent={true}>
            <Stack.Navigator>
              <Stack.Screen
                name="ChatRoom"
                component={ChatroomScreen}
                initialParams={{
                  chatroomID: chatroomId,
                  isInvited: false,
                }}
              />
              <Stack.Screen
                options={{gestureEnabled: Platform.OS === 'ios' ? false : true}}
                name={'FileUpload'}
                component={FileUpload}
              />
              <Stack.Screen name={'VideoPlayer'} component={VideoPlayer} />
              <Stack.Screen
                options={{gestureEnabled: false}}
                name={'CarouselScreen'}
                component={CarouselScreen}
              />
              <Stack.Screen
                options={{gestureEnabled: false}}
                name={'PollResult'}
                component={PollResult}
              />
              <Stack.Screen
                name={'CreatePollScreen'}
                component={CreatePollScreen}
              />
              <Stack.Screen
                options={{headerShown: false}}
                name={'ImageCropScreen'}
                component={ImageCropScreen}
              />
            </Stack.Navigator>
          </NavigationContainer>
        </KeyboardAvoidingView>
      </LMChatProvider>
    </ContextProvider>
  );
}

export default App;
