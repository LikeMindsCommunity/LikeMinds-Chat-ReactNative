import Styles from 'likeminds_chat_reactnative_ui/components/constants/Styles';
import React, {Alert, Text, Linking} from 'react-native';
import {PDF_TEXT, VIDEO_TEXT} from '../constants/Strings';
import {createThumbnail} from 'react-native-create-thumbnail';
import PdfThumbnail from 'react-native-pdf-thumbnail';

interface VideoThumbnail {
  selectedImages: any;
  selectedFilesToUpload?: any;
  selectedFilesToUploadThumbnails?: any;
  initial: boolean; // true when selecting Videos for first time, else false.
}

const REGEX_USER_SPLITTING = /(<<.+?\|route:\/\/[^>]+>>)/gu;
export const REGEX_USER_TAGGING =
  /<<(?<name>[^<>|]+)\|route:\/\/(?<route>[^?]+(\?.+)?)>>/g;

export const SHOW_LIST_REGEX = /[?&]show_list=([^&]+)/;

export const EXTRACT_PATH_FROM_ROUTE_QUERY = /\/([^/].*)/;

function detectLinks(message: string, isLongPress?: boolean) {
  const regex =
    /((?:https?:\/\/)?(?:www\.)?(?:\w+\.)+\w+(?:\/\S*)?|\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b)/i;

  let parts = message.split(regex);
  let i = 0;
  if (parts?.length > 0) {
    return (
      <Text>
        {parts?.map((val: any, index: any) => (
          <Text key={val + index}>
            {/* key should be unique so we are passing `val(abc) + index(number) = abc2` to make it unique */}
            {regex.test(val) ? (
              <Text
                onPress={async () => {
                  if (!!!isLongPress) {
                    const urlRegex = /(https?:\/\/[^\s]+)/gi;
                    const emailRegex =
                      /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g;
                    let isURL = urlRegex.test(val);
                    let isEmail = emailRegex.test(val);

                    if (isEmail) {
                      await Linking.openURL(`mailto:${val}`);
                    } else if (isURL) {
                      await Linking.openURL(val);
                    } else {
                      await Linking.openURL(`https://${val}`);
                    }
                  }
                }}>
                <Text
                  style={{
                    color: Styles.$COLORS.LIGHT_BLUE,
                    fontSize: Styles.$FONT_SIZES.MEDIUM,
                    fontFamily: Styles.$FONT_TYPES.LIGHT,
                  }}>
                  {val}
                </Text>
              </Text>
            ) : (
              <Text>{val}</Text>
            )}
          </Text>
        ))}
      </Text>
    );
  } else {
    return message;
  }
}

// naruto: naruto|route://member_profile/88226?member_id=__id__&community_id=__community__>>
// test string = '<<Sanjay kumar 🤖|route://member/1260>> <<Ishaan Jain|route://member/1003>> Hey google.com';
// This decode function helps us to decode tagged messages like the above test string in to readable format.
// This function has two responses: one for Homefeed screen and other is for chat screen(Pressable ones are for chat screen).
// The REGEX_USER_SPLITTING is used to split the text into different parts based on the regex specified and then using a for loop tags are shown differently along with name and route
export const decode = (
  text: string | undefined,
  enableClick: boolean,
  chatroomName?: string,
  communityId?: string,
  isLongPress?: boolean,
  memberUuid?: string,
  chatroomWithUserUuid?: string,
  chatroomWithUserMemberId?: string,
) => {
  if (!text) {
    return;
  }
  let arr: any[] = [];
  let parts = text?.split(REGEX_USER_SPLITTING);

  if (!!parts) {
    for (const matchResult of parts) {
      if (!!matchResult.match(REGEX_USER_TAGGING)) {
        let match = REGEX_USER_TAGGING.exec(matchResult);
        if (match !== null) {
          let {name, route} = match?.groups!;

          const startingIndex = route.indexOf('/');
          const taggedUserId = route.substring(startingIndex + 1);

          // LMChatAnalytics.track(
          //   Events.USER_TAGS_SOMEONE,
          //   new Map<string, string>([
          //     [Keys.COMMUNITY_ID, communityId?.toString()],
          //     [Keys.CHATROOM_NAME, chatroomName?.toString()],
          //     [Keys.TAGGED_USER_ID, taggedUserId?.toString()],
          //     [Keys.TAGGED_USER_NAME, name?.toString()],
          //   ]),
          // );

          if (memberUuid && chatroomWithUserUuid && chatroomWithUserMemberId) {
            const startingIndex = route.indexOf('/');

            const currentMemberId = route.substring(startingIndex + 1);

            if (currentMemberId == chatroomWithUserMemberId) {
              route = `user_profile/${chatroomWithUserUuid}`;
            } else {
              route = `user_profile/${memberUuid}`;
            }
          }

          arr.push({key: name, route: route});
        }
      } else {
        arr.push({key: matchResult, route: null});
      }
    }

    return enableClick ? (
      <Text>
        {arr.map((val, index) => (
          <Text
            style={{
              color: Styles.$COLORS.PRIMARY,
              fontFamily: Styles.$FONT_TYPES.LIGHT,
            }}
            key={val.key + index}>
            {/* key should be unique so we are passing `val(abc) + index(number) = abc2` to make it unique */}

            {!!val.route ? (
              <Text
                onPress={() => {
                  if (!!!isLongPress) {
                    Alert.alert(`navigate to the route ${val?.route}`);
                  }
                }}
                style={{
                  color: Styles.$COLORS.LIGHT_BLUE,
                  fontSize: Styles.$FONT_SIZES.MEDIUM,
                  fontFamily: Styles.$FONT_TYPES.LIGHT,
                }}>
                {val.key}
              </Text>
            ) : (
              detectLinks(val.key, isLongPress)
            )}
          </Text>
        ))}
      </Text>
    ) : (
      <Text>
        {arr.map((val, index) => (
          <Text
            style={{
              color: Styles.$COLORS.PRIMARY,
              fontFamily: Styles.$FONT_TYPES.LIGHT,
            }}
            key={val.key + index}>
            {!!val.route ? (
              <Text
                style={{
                  color: Styles.$COLORS.PRIMARY,
                  fontFamily: Styles.$FONT_TYPES.BOLD,
                }}>
                {val.key}
              </Text>
            ) : (
              val.key
            )}
          </Text>
        ))}
      </Text>
    );
  } else {
    return text;
  }
};

export const removeKey = (key: any, {[key]: _, ...rest}) => rest;

// this function is used to extract path from from route query, i.e routeQuery: `user_profile/skjdnc-lskdnjcs-lkdnsm`, path: `skjdnc-lskdnjcs-lkdnsm`
export function extractPathfromRouteQuery(inputString: string): string | null {
  const match = inputString.match(EXTRACT_PATH_FROM_ROUTE_QUERY);
  if (match && match[1]) {
    return match[1];
  } else {
    return null;
  }
}

// function to get thumbnails from videos
export const getVideoThumbnail = async ({
  selectedImages,
  selectedFilesToUpload,
  selectedFilesToUploadThumbnails,
  initial,
}: VideoThumbnail) => {
  let arr: any = [];
  const dummyArrSelectedFiles: any = selectedImages;
  for (let i = 0; i < selectedImages?.length; i++) {
    const item = selectedImages[i];
    if (item?.type?.split('/')[0] === VIDEO_TEXT) {
      await createThumbnail({
        url: item.uri,
        timeStamp: 10000,
      })
        .then(response => {
          arr = [...arr, {uri: response.path}];
          dummyArrSelectedFiles[i] = {
            ...dummyArrSelectedFiles[i],
            thumbnailUrl: response.path,
          };
        })
        .catch(() => {});
    } else {
      arr = [...arr, {uri: item.uri}];
    }
  }
  return {
    selectedFilesToUploadThumbnails: initial
      ? arr
      : [...selectedFilesToUploadThumbnails, ...arr],
    selectedFilesToUpload: initial
      ? dummyArrSelectedFiles
      : [...selectedFilesToUpload, ...dummyArrSelectedFiles],
  };
};

// function to get thumbnails of all pdf
export const getAllPdfThumbnail = async (selectedImages: any) => {
  let arr: any = [];
  for (let i = 0; i < selectedImages?.length; i++) {
    const item = selectedImages[i];
    const filePath = item.uri;
    const page = 0;
    if (item?.type?.split('/')[1] === PDF_TEXT) {
      const res = await PdfThumbnail.generate(filePath, page);
      if (res) {
        arr = [...arr, {uri: res?.uri}];
      }
    } else {
      arr = [...arr, {uri: item.uri}];
    }
  }
  return arr;
};

// function to get thumbnails of pdf
export const getPdfThumbnail = async (selectedFile: any) => {
  let arr: any = [];
  const filePath = selectedFile.uri;
  const page = 0;
  if (selectedFile?.type?.split('/')[1] === PDF_TEXT) {
    const res = await PdfThumbnail.generate(filePath, page);
    if (res) {
      arr = [...arr, {uri: res?.uri}];
    }
  } else {
    arr = [...arr, {uri: selectedFile.uri}];
  }
  return arr;
};

export const decodeForNotifications = (text: string | undefined) => {
  if (!text) {
    return;
  }
  const arr: any[] = [];
  const parts = text?.split(/(?:<<)?([\w\s🤖@]+\|route:\/\/\S+>>)/g);
  const TEMP_REGEX_USER_TAGGING =
    /(?:<<)?((?<name>[^<>|]+)\|route:\/\/(?<route>[^?]+(\?.+)?)>>)/g;

  if (parts) {
    for (const matchResult of parts) {
      if (matchResult.match(TEMP_REGEX_USER_TAGGING)) {
        const match = TEMP_REGEX_USER_TAGGING.exec(matchResult);
        if (match !== null) {
          const {name, route} = match?.groups!;
          arr.push({key: name, route: route});
        }
      } else {
        arr.push({key: matchResult, route: null});
      }
    }
    let decodedText = '';
    for (let i = 0; i < arr.length; i++) {
      decodedText = decodedText + arr[i].key;
    }
    return decodedText;
  } else {
    return text;
  }
};

// replace gif string message
export const generateGifString = (message: string) => {
  if (!message) {
    return '';
  }
  let originalString: string = message;
  let searchString: string =
    '* This is a gif message. Please update your app *';
  let replacementString: string = '';

  let resultString: string = originalString.replace(
    searchString,
    replacementString,
  );

  return resultString?.trim();
};
