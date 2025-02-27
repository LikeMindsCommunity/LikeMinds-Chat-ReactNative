import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Linking,
  Pressable,
  ActivityIndicator,
} from "react-native";
import React, { useState } from "react";
import STYLES from "../../constants/Styles";
import {
  LONG_PRESSED,
  SELECTED_MESSAGES,
  SET_POSITION,
} from "../../store/types/types";
import { useAppDispatch, useAppSelector } from "../../store";
import { FAILED, SUCCESS } from "../../constants/Strings";
import { useMessageContext } from "../../context/MessageContext";
import { useChatroomContext } from "../../context/ChatroomContext";
import Layout from "../../constants/Layout";
import { styles } from "../AttachmentConversations/styles";

export const PDFConversationView = () => {
  const { 
    isIncluded, item, handleLongPress,
    setShowRetry,
    showRetry,
    setRetryUploadInProgress,
    retryUploadInProgress,
  } = useMessageContext();
  const { handleFileUpload, onRetryButtonClicked } = useChatroomContext();
  const firstAttachment = item?.attachments[0];
  const secondAttachment = item?.attachments[1];
  const dispatch = useAppDispatch();
  const { selectedMessages, stateArr, isLongPress }: any = useAppSelector(
    (state) => state.chatroom
  );
  const [isFullList, setIsFullList] = useState(false);
  const delayLongPress = 200;

  const handleOnPress = (event: any, url: string) => {
    const { pageX, pageY } = event.nativeEvent;
    dispatch({
      type: SET_POSITION,
      body: { pageX: pageX, pageY: pageY },
    });
    const isStateIncluded = stateArr.includes(item?.state);
    if (isLongPress) {
      if (isIncluded) {
        const filterdMessages = selectedMessages.filter(
          (val: any) => val?.id !== item?.id && !stateArr.includes(val?.state)
        );
        if (filterdMessages.length > 0) {
          dispatch({
            type: SELECTED_MESSAGES,
            body: [...filterdMessages],
          });
        } else {
          dispatch({
            type: SELECTED_MESSAGES,
            body: [...filterdMessages],
          });
          dispatch({ type: LONG_PRESSED, body: false });
        }
      } else {
        if (!isStateIncluded) {
          dispatch({
            type: SELECTED_MESSAGES,
            body: [...selectedMessages, item],
          });
        }
      }
    } else {
      Linking.openURL(url);
    }
  };
  return (
    <View>
      {item?.attachmentCount > 1 ? (
        <View style={{ gap: Layout.normalize(2) }}>
          {!isFullList ? (
            <View>
              <TouchableOpacity
                onLongPress={handleLongPress}
                delayLongPress={delayLongPress}
                onPress={(event) => {
                  handleOnPress(event, firstAttachment?.url);
                }}
                style={styles.alignRow}
              >
                <Image
                  source={require("../../assets/images/pdf_icon3x.png")}
                  style={styles.icon}
                />
                <Text numberOfLines={2} style={styles.docName}>
                  {firstAttachment?.name}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onLongPress={handleLongPress}
                delayLongPress={delayLongPress}
                onPress={(event) => {
                  handleOnPress(event, secondAttachment?.url);
                }}
                style={styles.alignRow}
              >
                <Image
                  source={require("../../assets/images/pdf_icon3x.png")}
                  style={styles.icon}
                />
                <Text numberOfLines={2} style={styles.docName}>
                  {secondAttachment?.name}
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            item?.attachments.map((val: any, index: number) => (
              <TouchableOpacity
                onLongPress={handleLongPress}
                delayLongPress={delayLongPress}
                onPress={(event) => {
                  handleOnPress(event, val?.url);
                }}
                key={val + index}
                style={styles.alignRow}
              >
                <Image
                  source={require("../../assets/images/pdf_icon3x.png")}
                  style={styles.icon}
                />
                <Text numberOfLines={2} style={styles.docName}>
                  {val?.name}
                </Text>
              </TouchableOpacity>
            ))
          )}
        </View>
      ) : (
        <TouchableOpacity
          onLongPress={handleLongPress}
          delayLongPress={delayLongPress}
          onPress={(event) => {
            handleOnPress(event, firstAttachment?.url);
          }}
          style={styles.alignRow}
        >
          <Image
            source={require("../../assets/images/pdf_icon3x.png")}
            style={styles.icon}
          />
          <Text numberOfLines={2} style={styles.docName}>
            {firstAttachment?.name}
          </Text>
        </TouchableOpacity>
      )}
      {item.attachmentCount > 2 && !isFullList && (
        <TouchableOpacity
          onLongPress={handleLongPress}
          delayLongPress={delayLongPress}
          onPress={(event) => {
            const { pageX, pageY } = event.nativeEvent;
            dispatch({
              type: SET_POSITION,
              body: { pageX: pageX, pageY: pageY },
            });
            const isStateIncluded = stateArr.includes(item?.state);
            if (isLongPress) {
              if (isIncluded) {
                const filterdMessages = selectedMessages.filter(
                  (val: any) =>
                    val?.id !== item?.id && !stateArr.includes(val?.state)
                );
                if (filterdMessages.length > 0) {
                  dispatch({
                    type: SELECTED_MESSAGES,
                    body: [...filterdMessages],
                  });
                } else {
                  dispatch({
                    type: SELECTED_MESSAGES,
                    body: [...filterdMessages],
                  });
                  dispatch({ type: LONG_PRESSED, body: false });
                }
              } else {
                if (!isStateIncluded) {
                  dispatch({
                    type: SELECTED_MESSAGES,
                    body: [...selectedMessages, item],
                  });
                }
              }
            } else {
              setIsFullList(true);
            }
          }}
        >
          <Text style={styles.fullListCount}>{`+${
            item.attachmentCount - 2
          } more`}</Text>
        </TouchableOpacity>
      )}
      {(item?.isInProgress === SUCCESS && !showRetry) || retryUploadInProgress ? (
        <View style={styles.uploadingIndicator}>
          <ActivityIndicator size="large" color={STYLES.$COLORS.SECONDARY} />
        </View>
      ) : showRetry ? (
        <View style={styles.uploadingIndicator}>
          <Pressable
            onPress={() => {
              onRetryButtonClicked(item, setShowRetry, setRetryUploadInProgress, retryUploadInProgress);
            }}
            style={({ pressed }) => [
              {
                opacity: pressed ? 0.5 : 1,
              },
              styles.retryButton,
            ]}
          >
            <Image
              style={styles.retryIcon}
              source={require("../../assets/images/retry_file_upload3x.png")}
            />
            <Text style={styles.retryText}>RETRY</Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
};
