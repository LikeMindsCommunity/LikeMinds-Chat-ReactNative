import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Pressable,
  ActivityIndicator,
} from "react-native";
import React from "react";
import STYLES from "../../constants/Styles";
import {
  LONG_PRESSED,
  SELECTED_MESSAGES,
  SET_POSITION,
  STATUS_BAR_STYLE,
} from "../../store/types/types";
import { useAppDispatch, useAppSelector } from "../../store";
import { CAROUSEL_SCREEN } from "../../constants/Screens";
import {
  FAILED,
  IMAGE_TEXT,
  SUCCESS,
  VIDEO_TEXT,
} from "../../constants/Strings";
import { useMessageContext } from "../../context/MessageContext";
import { useChatroomContext } from "../../context/ChatroomContext";
import Layout from "../../constants/Layout";
import { styles } from "../AttachmentConversations/styles";

export const ImageVideoConversationView = () => {
  const { isIncluded, item, handleLongPress } = useMessageContext();
  const { navigation, handleFileUpload } = useChatroomContext();

  const chatBubbleStyles = STYLES.$CHAT_BUBBLE_STYLE;
  const imageVideoBorderRadius =
    chatBubbleStyles?.imageVideoAttachmentsBorderRadius;

  const firstAttachment = item?.attachments[0];
  const secondAttachment = item?.attachments[1];
  const thirdAttachment = item?.attachments[2];
  const fourthAttachment = item?.attachments[3];
  const dispatch = useAppDispatch();
  const { selectedMessages, stateArr, isLongPress }: any = useAppSelector(
    (state) => state.chatroom
  );

  //styling props
  const selectedMessageBackgroundColor =
    chatBubbleStyles?.selectedMessageBackgroundColor;

  const SELECTED_BACKGROUND_COLOR = selectedMessageBackgroundColor
    ? selectedMessageBackgroundColor
    : STYLES.$COLORS.SELECTED_BLUE;

  const delayLongPress = 200;

  // handle on press on attachment
  const handleOnPress = (event: any, url: string, index: number) => {
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
      navigation.navigate(CAROUSEL_SCREEN, {
        dataObject: item,
        index,
      });
      dispatch({
        type: STATUS_BAR_STYLE,
        body: { color: STYLES.$STATUS_BAR_STYLE["light-content"] },
      });
    }
  };

  let firstImageSource: any;

  if (firstAttachment) {
    if (
      (firstAttachment.type === VIDEO_TEXT &&
        firstAttachment.thumbnailUrl === null) ||
      (firstAttachment.type === IMAGE_TEXT && firstAttachment.url === null)
    ) {
      // Use require for video or image
      firstImageSource = require("../../assets/images/imagePlaceholder.jpeg");
    } else {
      // Use the uri
      firstImageSource = {
        uri:
          firstAttachment?.type === VIDEO_TEXT
            ? firstAttachment?.thumbnailUrl
            : firstAttachment?.url,
      };
    }
  }

  let secondImageSource: any;

  if (secondAttachment) {
    if (
      (secondAttachment.type === VIDEO_TEXT &&
        secondAttachment.thumbnailUrl === null) ||
      (secondAttachment.type === IMAGE_TEXT && secondAttachment.url === null)
    ) {
      // Use require for video or image
      secondImageSource = require("../../assets/images/imagePlaceholder.jpeg");
    } else {
      // Use the uri
      secondImageSource = {
        uri:
          secondAttachment?.type === VIDEO_TEXT
            ? secondAttachment?.thumbnailUrl
            : secondAttachment?.url,
      };
    }
  }

  let thirdImageSource: any;

  if (thirdAttachment) {
    if (
      (thirdAttachment.type === VIDEO_TEXT &&
        thirdAttachment.thumbnailUrl === null) ||
      (thirdAttachment.type === IMAGE_TEXT && thirdAttachment.url === null)
    ) {
      // Use require for video or image
      thirdImageSource = require("../../assets/images/imagePlaceholder.jpeg");
    } else {
      // Use the uri
      thirdImageSource = {
        uri:
          thirdAttachment?.type === VIDEO_TEXT
            ? thirdAttachment?.thumbnailUrl
            : thirdAttachment?.url,
      };
    }
  }

  let fourthImageSource: any;

  if (fourthAttachment) {
    if (
      (fourthAttachment.type === VIDEO_TEXT &&
        fourthAttachment.thumbnailUrl === null) ||
      (fourthAttachment.type === IMAGE_TEXT && fourthAttachment.url === null)
    ) {
      // Use require for video or image
      fourthImageSource = require("../../assets/images/imagePlaceholder.jpeg");
    } else {
      // Use the uri
      fourthImageSource = {
        uri:
          fourthAttachment?.type === VIDEO_TEXT
            ? fourthAttachment?.thumbnailUrl
            : fourthAttachment?.url,
      };
    }
  }

  return (
    <View>
      {item?.attachmentCount === 1 ? (
        <TouchableOpacity
          onLongPress={handleLongPress}
          delayLongPress={delayLongPress}
          onPress={(event) => {
            handleOnPress(event, firstAttachment?.url, 0);
          }}
        >
          <Image
            style={[
              styles.singleImg,
              imageVideoBorderRadius
                ? { borderRadius: imageVideoBorderRadius }
                : null,
            ]}
            source={firstImageSource}
          />
          {firstAttachment?.type === VIDEO_TEXT ? (
            <View
              style={{
                position: "absolute",
                bottom: 0,
                left: Layout.normalize(5),
              }}
            >
              <Image
                source={require("../../assets/images/video_icon3x.png")}
                style={styles.videoIcon}
              />
            </View>
          ) : null}
        </TouchableOpacity>
      ) : item?.attachmentCount === 2 ? (
        <View style={styles.doubleImgParent}>
          <TouchableOpacity
            style={styles.touchableImg}
            onLongPress={handleLongPress}
            delayLongPress={delayLongPress}
            onPress={(event) => {
              handleOnPress(event, firstAttachment?.url, 0);
            }}
          >
            <Image
              source={firstImageSource}
              style={[
                styles.doubleImg,
                imageVideoBorderRadius
                  ? { borderRadius: imageVideoBorderRadius }
                  : null,
              ]}
            />
            {firstAttachment?.type === VIDEO_TEXT ? (
              <View
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: Layout.normalize(5),
                }}
              >
                <Image
                  source={require("../../assets/images/video_icon3x.png")}
                  style={styles.videoIcon}
                />
              </View>
            ) : null}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.touchableImg}
            onLongPress={handleLongPress}
            delayLongPress={delayLongPress}
            onPress={(event) => {
              handleOnPress(event, secondAttachment?.url, 1);
            }}
          >
            <Image
              source={secondImageSource}
              style={[
                styles.doubleImg,
                imageVideoBorderRadius
                  ? { borderRadius: imageVideoBorderRadius }
                  : null,
              ]}
            />
            {secondAttachment?.type === VIDEO_TEXT ? (
              <View
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: Layout.normalize(5),
                }}
              >
                <Image
                  source={require("../../assets/images/video_icon3x.png")}
                  style={styles.videoIcon}
                />
              </View>
            ) : null}
          </TouchableOpacity>
        </View>
      ) : item?.attachmentCount === 3 ? (
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
              navigation.navigate(CAROUSEL_SCREEN, {
                dataObject: item,
                index: 0,
              });
              dispatch({
                type: STATUS_BAR_STYLE,
                body: { color: STYLES.$STATUS_BAR_STYLE["light-content"] },
              });
            }
          }}
          style={styles.doubleImgParent}
        >
          <View
            style={[
              styles.imgParent,
              imageVideoBorderRadius
                ? { borderRadius: imageVideoBorderRadius }
                : null,
            ]}
          >
            <Image source={firstImageSource} style={styles.multipleImg} />
            {firstAttachment?.type === VIDEO_TEXT ? (
              <View
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: Layout.normalize(5),
                }}
              >
                <Image
                  source={require("../../assets/images/video_icon3x.png")}
                  style={styles.videoIcon}
                />
              </View>
            ) : null}
          </View>
          <View
            style={[
              styles.imgParent,
              imageVideoBorderRadius
                ? { borderRadius: imageVideoBorderRadius }
                : null,
            ]}
          >
            <Image style={styles.multipleImg} source={secondImageSource} />
            {firstAttachment?.type === VIDEO_TEXT ? (
              <View
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: Layout.normalize(5),
                }}
              >
                <Image
                  source={require("../../assets/images/video_icon3x.png")}
                  style={styles.videoIcon}
                />
              </View>
            ) : null}
          </View>
          <View
            style={[
              styles.tripleImgOverlay,
              imageVideoBorderRadius
                ? { borderRadius: imageVideoBorderRadius }
                : null,
            ]}
          >
            <Text style={styles.tripleImgText}>+2</Text>
          </View>
        </TouchableOpacity>
      ) : item?.attachmentCount === 4 ? (
        <View style={{ gap: Layout.normalize(5) }}>
          <View style={styles.doubleImgParent}>
            <TouchableOpacity
              style={styles.touchableImg}
              onLongPress={handleLongPress}
              delayLongPress={delayLongPress}
              onPress={(event) => {
                handleOnPress(event, firstAttachment?.url, 0);
              }}
            >
              <Image
                source={firstImageSource}
                style={[
                  styles.doubleImg,
                  imageVideoBorderRadius
                    ? { borderRadius: imageVideoBorderRadius }
                    : null,
                ]}
              />
              {firstAttachment?.type === VIDEO_TEXT ? (
                <View
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: Layout.normalize(5),
                  }}
                >
                  <Image
                    source={require("../../assets/images/video_icon3x.png")}
                    style={styles.videoIcon}
                  />
                </View>
              ) : null}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.touchableImg}
              onLongPress={handleLongPress}
              delayLongPress={delayLongPress}
              onPress={(event) => {
                handleOnPress(event, secondAttachment?.url, 1);
              }}
            >
              <Image
                source={secondImageSource}
                style={[
                  styles.doubleImg,
                  imageVideoBorderRadius
                    ? { borderRadius: imageVideoBorderRadius }
                    : null,
                ]}
              />
              {secondAttachment?.type === VIDEO_TEXT ? (
                <View
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: Layout.normalize(5),
                  }}
                >
                  <Image
                    source={require("../../assets/images/video_icon3x.png")}
                    style={styles.videoIcon}
                  />
                </View>
              ) : null}
            </TouchableOpacity>
          </View>
          <View style={styles.doubleImgParent}>
            <TouchableOpacity
              style={styles.touchableImg}
              onLongPress={handleLongPress}
              delayLongPress={delayLongPress}
              onPress={(event) => {
                handleOnPress(event, thirdAttachment?.url, 2);
              }}
            >
              <Image
                source={thirdImageSource}
                style={[
                  styles.doubleImg,
                  imageVideoBorderRadius
                    ? { borderRadius: imageVideoBorderRadius }
                    : null,
                ]}
              />
              {thirdAttachment?.type === VIDEO_TEXT ? (
                <View
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: Layout.normalize(5),
                  }}
                >
                  <Image
                    source={require("../../assets/images/video_icon3x.png")}
                    style={styles.videoIcon}
                  />
                </View>
              ) : null}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.touchableImg}
              onLongPress={handleLongPress}
              delayLongPress={delayLongPress}
              onPress={(event) => {
                handleOnPress(event, fourthAttachment?.url, 3);
              }}
            >
              <Image
                source={fourthImageSource}
                style={[
                  styles.doubleImg,
                  imageVideoBorderRadius
                    ? { borderRadius: imageVideoBorderRadius }
                    : null,
                ]}
              />
              {fourthAttachment?.type === VIDEO_TEXT ? (
                <View
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: Layout.normalize(5),
                  }}
                >
                  <Image
                    source={require("../../assets/images/video_icon3x.png")}
                    style={styles.videoIcon}
                  />
                </View>
              ) : null}
            </TouchableOpacity>
          </View>
        </View>
      ) : item?.attachmentCount > 4 ? (
        <TouchableOpacity
          style={{ gap: Layout.normalize(5) }}
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
              navigation.navigate(CAROUSEL_SCREEN, {
                dataObject: item,
                index: 0,
              });
              dispatch({
                type: STATUS_BAR_STYLE,
                body: { color: STYLES.$STATUS_BAR_STYLE["light-content"] },
              });
            }
          }}
        >
          <View style={styles.doubleImgParent}>
            <View
              style={[
                styles.imgParent,
                imageVideoBorderRadius
                  ? { borderRadius: imageVideoBorderRadius }
                  : null,
              ]}
            >
              <Image source={firstImageSource} style={styles.multipleImg} />
              {firstAttachment?.type === VIDEO_TEXT ? (
                <View
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: Layout.normalize(5),
                  }}
                >
                  <Image
                    source={require("../../assets/images/video_icon3x.png")}
                    style={styles.videoIcon}
                  />
                </View>
              ) : null}
            </View>
            <View
              style={[
                styles.imgParent,
                imageVideoBorderRadius
                  ? { borderRadius: imageVideoBorderRadius }
                  : null,
              ]}
            >
              <Image style={styles.multipleImg} source={secondImageSource} />
              {secondAttachment?.type === VIDEO_TEXT ? (
                <View
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: Layout.normalize(5),
                  }}
                >
                  <Image
                    source={require("../../assets/images/video_icon3x.png")}
                    style={styles.videoIcon}
                  />
                </View>
              ) : null}
            </View>
          </View>
          <View style={styles.doubleImgParent}>
            <View
              style={[
                styles.imgParent,
                imageVideoBorderRadius
                  ? { borderRadius: imageVideoBorderRadius }
                  : null,
              ]}
            >
              <Image source={thirdImageSource} style={styles.multipleImg} />
              {thirdAttachment?.type === VIDEO_TEXT ? (
                <View
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: Layout.normalize(5),
                  }}
                >
                  <Image
                    source={require("../../assets/images/video_icon3x.png")}
                    style={styles.videoIcon}
                  />
                </View>
              ) : null}
            </View>
            <View
              style={[
                styles.imgParent,
                imageVideoBorderRadius
                  ? { borderRadius: imageVideoBorderRadius }
                  : null,
              ]}
            >
              <Image style={styles.multipleImg} source={fourthImageSource} />
              {fourthAttachment?.type === VIDEO_TEXT ? (
                <View
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: Layout.normalize(5),
                  }}
                >
                  <Image
                    source={require("../../assets/images/video_icon3x.png")}
                    style={styles.videoIcon}
                  />
                </View>
              ) : null}
            </View>
            <View
              style={[
                styles.tripleImgOverlay,
                imageVideoBorderRadius
                  ? { borderRadius: imageVideoBorderRadius }
                  : null,
              ]}
            >
              <Text style={styles.tripleImgText}>{`+${
                item?.attachmentCount - 3
              }`}</Text>
            </View>
          </View>
        </TouchableOpacity>
      ) : null}
      {isIncluded && item?.attachmentCount <= 3 ? (
        <View
          style={{
            position: "absolute",
            height: Layout.normalize(150),
            width: "100%",
            backgroundColor: SELECTED_BACKGROUND_COLOR,
            opacity: 0.5,
          }}
        />
      ) : isIncluded && item?.attachmentCount > 3 ? (
        <View
          style={{
            position: "absolute",
            height: Layout.normalize(310),
            width: "100%",
            backgroundColor: SELECTED_BACKGROUND_COLOR,
            opacity: 0.5,
          }}
        />
      ) : null}

      {item?.isInProgress === SUCCESS ? (
        <View style={styles.uploadingIndicator}>
          <ActivityIndicator size="large" color={STYLES.$COLORS.SECONDARY} />
        </View>
      ) : item?.isInProgress === FAILED ? (
        <View style={styles.uploadingIndicator}>
          <Pressable
            onPress={() => {
              handleFileUpload(item?.id, true);
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
