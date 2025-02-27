import React, { useState, useEffect } from "react";
import { StyleSheet, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useAppDispatch } from "../store";
import { Credentials } from "../credentials";
import { UPDATE_FILE_UPLOADING_OBJECT } from "../store/types/types";
import { setupPlayer } from "../audio";
import { GIPHY_SDK_API_KEY } from "../awsExports";
import { Client } from "../client";
import { FAILED } from "../constants/Strings";
import { LMChatBotProviderProps, LMChatProviderProps } from "./type";
import { CallBack } from "../callBacks/callBackClass";
import GIFPicker from "../optionalDependecies/Gif";
import { Token } from "../tokens";
import { InitUserWithUuid, ValidateUser } from "@likeminds.community/chat-rn";
import {
  getMemberState,
  initAPI,
  validateUser,
} from "../store/actions/homefeed";
import { pushAPI, token } from "../notifications/index"

export const LMChatBotProvider = ({
  myClient,
  children,
  lmChatInterface
}: LMChatBotProviderProps) => {

  const dispatch = useAppDispatch();

  // to initialise track player
  useEffect(() => {
    async function setup() {
      await setupPlayer();
    }
    setup();
  }, []);

  // to configure gifphy sdk
  useEffect(() => {
    if (GIFPicker) {
      const { GiphySDK } = GIFPicker;
      GiphySDK?.configure({ apiKey: GIPHY_SDK_API_KEY });
    }
  }, []);


  useEffect(() => {
    //setting client in Client class
    Client.setMyClient(myClient);

    // setting lmChatInterface in CallBack class
    CallBack.setLMChatInterface(lmChatInterface);
  }, [myClient, lmChatInterface])

  return (
    <View style={styles.flexStyling}>{children}</View>
  )
}

export const LMChatProvider = ({
  myClient,
  children,
  userName,
  userUniqueId,
  apiKey,
  accessToken,
  refreshToken,
  profileImageUrl,
  lmChatInterface,
  imageUrl,
}: LMChatProviderProps) => {
  const [isInitiated, setIsInitiated] = useState(false);

  // to initialise track player
  useEffect(() => {
    async function setup() {
      await setupPlayer();
    }
    setup();
  }, []);

  // to configure gifphy sdk
  useEffect(() => {
    if (GIFPicker) {
      const { GiphySDK } = GIFPicker;
      GiphySDK?.configure({ apiKey: GIPHY_SDK_API_KEY });
    }
  }, []);



  // to get dispatch
  const dispatch = useAppDispatch();

  useEffect(() => {
    //setting client in Client class
    Client.setMyClient(myClient);

    // setting lmChatInterface in CallBack class
    CallBack.setLMChatInterface(lmChatInterface);

    const callValidateApi = async (accessToken, refreshToken) => {
      const payload: ValidateUser = {
        accessToken: accessToken,
        refreshToken: refreshToken,
      };
      const validateResponse = await dispatch(validateUser(payload, true));

      if (validateResponse !== undefined && validateResponse !== null) {
        // calling getMemberState API

        token().then((res) => {
          if (!!res) {
            pushAPI(res, accessToken)
          }
        })

        await dispatch(getMemberState());
      }
      setIsInitiated(true);
    };

    // storing myClient followed by community details
    async function callInitiateAPI() {
      const { accessToken, refreshToken } = await myClient?.getTokens();
      if (accessToken && refreshToken) {
        callValidateApi(accessToken, refreshToken);
        return;
      }
      const payload: InitUserWithUuid = {
        userName: userName,
        apiKey: apiKey ? apiKey : "",
        uuid: userUniqueId ? userUniqueId : "",
        isGuest: false,
        imageUrl: imageUrl ? imageUrl : "",
      };
      const initiateResponse: any = await dispatch(initAPI(payload));
      if (initiateResponse !== undefined && initiateResponse !== null) {
        // calling getMemberState API
        await dispatch(getMemberState());
        token().then((res) => {
          if (!!res) {
            pushAPI(res, accessToken)
          }
        })
        setIsInitiated(true);
      }
    }
    if (accessToken && refreshToken) {
      callValidateApi(accessToken, refreshToken);
    } else if (apiKey && userName && userUniqueId) {
      callInitiateAPI();
    }
  }, [accessToken, refreshToken]);

  return isInitiated ? (
    <View style={styles.flexStyling}>{children}</View>
  ) : (
    <></>
  );
};

const styles = StyleSheet.create({
  flexStyling: {
    flex: 1,
  },
});
