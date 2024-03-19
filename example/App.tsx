/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';
import {Platform} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {navigationRef} from './RootNavigation';
import {
  CarouselScreen,
  CreatePollScreen,
  FileUpload,
  ImageCropScreen,
  PollResult,
  VideoPlayer,
  ExploreFeed,
  HomeFeed,
  LMOverlayProvider,
  LMChatCallbacks,
  LMChatroomCallbacks,
  NavigateToProfileParams,
  NavigateToGroupDetailsParams,
  STYLES,
} from '@likeminds.community/chat-rn-core';
import {myClient} from '.';
import ChatroomScreenWrapper from './screens/Chatroom/ChatroomScreenWrapper';

const Stack = createNativeStackNavigator();

// Override callBacks with custom logic
class CustomCallbacks implements LMChatCallbacks, LMChatroomCallbacks {
  navigateToProfile(params: NavigateToProfileParams) {
    // Override navigateToProfile with custom logic
  }

  navigateToHomePage() {
    // Override navigateToHomePage with custom logic
  }

  onEventTriggered(eventName: string, eventProperties?: Map<string, string>) {
    // Override onEventTriggered with custom logic
  }

  navigateToGroupDetails(params: NavigateToGroupDetailsParams) {
    // Override navigateToGroupDetails with custom logic
  }
}

const lmChatInterface = new CustomCallbacks();

function App(): React.JSX.Element {
  const userName = '';
  const userUniqueId = '';
  const chatroomId = '';
  const profileImageUrl = '';

  // themeStyling
  {
    /*
  const themeStyles = {
    hue: 10,
    fontColor: 'black',
    primaryColor: 'green',
    secondaryColor: 'green',
    lightBackgroundColor: '#d7f7ed',
  };
  */
  }

  // styling for reactionList
  {
    /*
  const reactionListStyles = {
    reactionSize: 0,
    reactionLeftItemStroke: 'pink',
    reactionRightItemStroke: 'yellow',
    reactionItemBorderRadius: 5,
    gap: 5,
  };
  */
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

  // styling for chatroom topic
  {
    /* 
      const chatroomTopicStyles = {
    topicHeader: {
      color: 'blue',
    },
    topicDescription: {
      color: 'yellow',
    },
    topicPlaceholder: 'Topic set by your CM',
  };
    */
  }

  // styling for file upload screen
  {
    /* 
    const fileUploadStyles = {
      selectedImageBorderColor: 'blue',
    };
    */
  }

  // styling for file upload screen
  {
    /*
   const memberDirectoryStyles = {
    userNameStyles: {
      color: 'red',
    },
    userTitleStyles: {
      color: 'blue',
    },
    searchPlaceholderText: 'Khojo',
  };
  */
  }

  // styling for carousel screen
  {
    /*
  const carouselScreenStyles = {
    headerTitle: {
      color: 'red',
    },
    headerSubtitle: {
      color: 'blue',
    },
  };
  */
  }

  // styling for explore chatroom screen
  {
    /* 
      const exploreChatroomStyles = {
    header: {
      color: 'green',
      placeHolderText: 'Look for new chatrooms',
    },
  };
    */
  }

  // styling for home feed screen
  {
    /* 
  const homeFeedStyles = {
    unreadCount: {
      color: 'blue',
    },
  };
  */
  }

  // if (homeFeedStyles) {
  //   STYLES.setHomeFeedStyle(homeFeedStyles);
  // }

  // if (exploreChatroomStyles) {
  //   STYLES.setExploreChatroomStyle(exploreChatroomStyles);
  // }

  // if (carouselScreenStyles) {
  //   STYLES.setCarouselScreenStyle(carouselScreenStyles);
  // }

  // if (memberDirectoryStyles) {
  //   STYLES.setMemberDirectoryStyle(memberDirectoryStyles);
  // }

  // if (chatBubbleStyles) {
  //   STYLES.setChatBubbleStyle(chatBubbleStyles);
  // }

  // if (themeStyles) {
  //   STYLES.setTheme(themeStyles);
  // }

  // if (reactionListStyles) {
  //   STYLES.setReactionListStyle(reactionListStyles);
  // }

  // if (inputBoxStyles) {
  //   STYLES.setInputBoxStyle(inputBoxStyles);
  // }

  // if (chatroomTopicStyles) {
  //   STYLES.setChatroomTopicStyle(chatroomTopicStyles);
  // }

  // if (fileUploadStyles) {
  //   STYLES.setFileUploadStyle(fileUploadStyles);
  // }

  return (
    <LMOverlayProvider
      myClient={myClient}
      userName={userName}
      userUniqueId={userUniqueId}
      profileImageUrl={profileImageUrl}
      lmChatInterface={lmChatInterface}>
      <NavigationContainer ref={navigationRef} independent={true}>
        <Stack.Navigator initialRouteName={'Homefeed'}>
          <Stack.Screen name={'Homefeed'} component={HomeFeed} />
          <Stack.Screen
            name="ChatRoom"
            component={ChatroomScreenWrapper}
            initialParams={{
              chatroomID: chatroomId,
              isInvited: false,
            }}
          />
          <Stack.Screen
            options={{gestureEnabled: Platform.OS === 'ios' ? false : true}}
            name={'FileUpload'}
            component={FileUpload}
            initialParams={{
              backIconPath: '', // add your back icon path here
              imageCropIcon: '', // add your image crop icon path here
            }}
          />
          <Stack.Screen name={'VideoPlayer'} component={VideoPlayer} />
          <Stack.Screen
            options={{gestureEnabled: false}}
            name={'CarouselScreen'}
            component={CarouselScreen}
            initialParams={{
              backIconPath: '', // add your back icon path here
            }}
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
    </LMOverlayProvider>
  );
}

export default App;
