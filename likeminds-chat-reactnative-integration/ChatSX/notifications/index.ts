import messaging from "@react-native-firebase/messaging";
import notifee, {
  AndroidImportance,
  EventType,
  AndroidGroupAlertBehavior,
  AndroidLaunchActivityFlag,
} from "@notifee/react-native";
import React from "react";
import { decodeForNotifications, generateGifString } from "../commonFuctions";
import { Platform } from "react-native";
import { Client } from "../client";
import { getRoute } from "./routes";
import { Credentials } from "../credentials";
import { ChatroomData } from "./models/chatroomData";

export async function requestUserPermission() {
  const authStatus = await messaging().requestPermission();
  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;
  return enabled;
}

export const fetchFCMToken = async () => {
  const fcmToken = await messaging().getToken();
  return fcmToken;
};

export default async function getNotification(remoteMessage: any) {
  const users = await Client.myClient.getUserSchema();
  Credentials.setCredentials(users?.userName, users?.userUniqueID);

  const isIOS = Platform.OS === "ios" ? true : false;
  const message = isIOS
    ? generateGifString(remoteMessage?.notification?.body)
    : generateGifString(remoteMessage?.data?.sub_title);
  const channelId = await notifee.createChannel({
    id: "important",
    name: "Important Notifications",
    importance: AndroidImportance.HIGH,
  });

  let decodedAndroidMsg;
  let decodedIOSMsg;
  if (isIOS) {
    decodedIOSMsg = decodeForNotifications(message);
  } else {
    decodedAndroidMsg = decodeForNotifications(message);
  }

  if (!remoteMessage?.data?.route) {
    return;
  }

  const route = await getRoute(remoteMessage?.data?.route);
  const navigationRoute = route?.params?.navigationRoute;

  if (navigationRoute === "collabcard" && navigationRoute) {
    const UUID = Credentials.userUniqueId;
    const userName = Credentials.username;

    const payload = {
      uuid: UUID, // uuid
      userName: userName, // user name
      isGuest: false,
    };

    if (isIOS) {
      await notifee.displayNotification({
        title: remoteMessage?.data?.title,
        body: isIOS ? decodedIOSMsg : decodedAndroidMsg,
        data: remoteMessage?.data,
        id: remoteMessage?.messageId,
        android: {
          channelId,
          // pressAction is needed if you want the notification to open the app when pressed
          pressAction: {
            id: "default",
            launchActivity: "default",
          },
          importance: AndroidImportance.HIGH,
        },
      });
    } else {
      const res = await Client.myClient.initiateUser(payload);
      if (res?.success === true) {
        const response =
          await Client.myClient?.getUnreadConversationNotification();
        if (response?.success === false) {
          await notifee.displayNotification({
            title: remoteMessage?.data?.title,
            body: decodedAndroidMsg,
            data: remoteMessage?.data,
            id: remoteMessage?.messageId,
            android: {
              channelId,
              // pressAction is needed if you want the notification to open the app when pressed
              pressAction: {
                id: "default",
                launchActivity: "default",
              },
              importance: AndroidImportance.HIGH,
            },
          });
        } else {
          const unreadConversation = response?.data?.unreadConversation;
          const sortedUnreadConversation = unreadConversation?.sort(
            (a: ChatroomData, b: ChatroomData) => {
              return (
                b?.chatroomLastConversationTimestamp -
                a?.chatroomLastConversationTimestamp
              );
            }
          );
          let totalCount = 0;
          for (const obj of sortedUnreadConversation) {
            if (obj.hasOwnProperty("chatroomUnreadConversationCount")) {
              totalCount += obj.chatroomUnreadConversationCount;
            }
          }

          // Create summary
          notifee.displayNotification({
            title: navigationRoute,
            subtitle: `${totalCount} messages from ${sortedUnreadConversation?.length} chatrooms`,
            android: {
              channelId,
              groupSummary: true,
              groupId: navigationRoute?.toString(16),
              groupAlertBehavior: AndroidGroupAlertBehavior.SUMMARY,
              pressAction: {
                id: "default",
                launchActivity: "default",
                launchActivityFlags: [AndroidLaunchActivityFlag.SINGLE_TOP],
              },
            },
            id: "group",
          });

          // Children
          for (let i = 0; i < sortedUnreadConversation?.length; i++) {
            notifee.displayNotification({
              title: sortedUnreadConversation[i]?.chatroomName,
              body: `<b>${sortedUnreadConversation[i]?.chatroomLastConversationUserName}</b>: ${sortedUnreadConversation[i]?.chatroomLastConversation}`,
              android: {
                channelId,
                groupId: navigationRoute?.toString(16),
                groupAlertBehavior: AndroidGroupAlertBehavior.SUMMARY,
                timestamp:
                  sortedUnreadConversation[i]
                    ?.chatroomLastConversationTimestamp * 1000 ?? Date.now(),
                showTimestamp: true,
                sortKey: i?.toString(),
                pressAction: {
                  id: "default",
                  launchActivity: "default",
                  launchActivityFlags: [AndroidLaunchActivityFlag.SINGLE_TOP],
                },
              },
              data: { route: sortedUnreadConversation[i]?.routeChild },
              id: sortedUnreadConversation[i]?.chatroomId?.toString(),
            });
          }
        }
      }
    }
  }
}
