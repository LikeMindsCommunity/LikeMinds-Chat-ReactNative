import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
} from "react";
import { BackHandler, LogBox } from "react-native";
import { useAppDispatch, useAppSelector } from "../store";
import AWS, { CognitoIdentityCredentials, S3 } from "aws-sdk";
import {
  CLEAR_SELECTED_FILES_TO_UPLOAD,
  CLEAR_SELECTED_FILE_TO_VIEW,
  CLEAR_FILE_UPLOADING_MESSAGES,
  SET_FILE_UPLOADING_MESSAGES,
  STATUS_BAR_STYLE,
} from "../store/types/types";
import {
  AUDIO_TEXT,
  FAILED,
  GIF_TEXT,
  IMAGE_TEXT,
  PDF_TEXT,
  VIDEO_TEXT,
} from "../constants/Strings";
import { LMChatAnalytics } from "../analytics/LMChatAnalytics";
import { Events, Keys } from "../enums";
import { BUCKET, POOL_ID, REGION } from "../awsExports";
import { fetchResourceFromURI, generateGifName } from "../commonFuctions";
import STYLES from "../constants/Styles";
import { Client } from "../client";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Image as CompressedImage } from "react-native-compressor";
import { StackNavigationProp } from "@react-navigation/stack";

interface FileUploadContextProps {
  children: ReactNode;
}

interface UploadResource {
  selectedImages: any[];
  conversationID: string;
  chatroomID: string;
  selectedFilesToUpload: any[];
  uploadingFilesMessages: any;
  isRetry: boolean;
}

interface FileUploadContextValues {
  handleFileUpload: (conversationID: string, isRetry: boolean) => Promise<any> | null;
  selectedFilesToUpload: any[];
  selectedFileToView: any;
  len: any;
  backIconPath: any;
  itemType: any;
  imageCropIcon: any;
  video: any;
  docItemType: any;
  isGif: any;
  selectedImageBorderColor: any;
  selectedFilesToUploadThumbnails: any;
  chatroomID: any;
  previousMessage: any;
  chatroomDBDetails: any;
}

const FileUploadContext = createContext<FileUploadContextValues | undefined>(
  undefined
);

export const useFileUploadContext = () => {
  const context = useContext(FileUploadContext);
  if (!context) {
    throw new Error(
      "useFileUploadContext must be used within a FileUploadContextProvider"
    );
  }
  return context;
};

export const FileUploadContextProvider = ({
  children,
}: FileUploadContextProps) => {
  const navigation = useNavigation<StackNavigationProp<any>>();
  const route = useRoute();

  const myClient = Client.myClient;
  const video = useRef<any>(null);

  const selectedImageBorderColor =
    STYLES.$FILE_UPLOAD_STYLE?.selectedImageBorderColor;

  const { chatroomID, previousMessage = "" }: any = route?.params;
  const { backIconPath, imageCropIcon }: any = route.params;
  const {
    selectedFilesToUpload = [],
    selectedFileToView = {},
    selectedFilesToUploadThumbnails = [],
  }: any = useAppSelector((state) => state.chatroom);
  const { uploadingFilesMessages }: any = useAppSelector(
    (state) => state.upload
  );

  const itemType = !!selectedFileToView?.data?.type
    ? selectedFileToView?.data?.type
    : selectedFileToView?.type?.split("/")[0];

  const docItemType = selectedFileToView?.type?.split("/")[1];

  const isGif = itemType === GIF_TEXT ? true : false;
  const len = selectedFilesToUpload.length;
  const dispatch = useAppDispatch();
  const { chatroomDBDetails }: any = useAppSelector((state) => state.chatroom);

  // Selected header of chatroom screen
  const setInitialHeader = () => {
    navigation.setOptions({
      headerShown: false,
    });
  };

  // this useLayoutEffect sets Headers before other printing UI Layout
  useLayoutEffect(() => {
    setInitialHeader();
  }, [navigation]);

  useEffect(() => {
    function backActionCall() {
      dispatch({
        type: CLEAR_SELECTED_FILES_TO_UPLOAD,
      });
      dispatch({
        type: CLEAR_SELECTED_FILE_TO_VIEW,
      });
      dispatch({
        type: STATUS_BAR_STYLE,
        body: { color: STYLES.$STATUS_BAR_STYLE.default },
      });
      navigation.goBack();
      return true;
    }

    const backHandlerAndroid = BackHandler.addEventListener(
      "hardwareBackPress",
      backActionCall
    );

    return () => backHandlerAndroid.remove();
  }, [selectedFileToView, selectedFilesToUpload]);

  AWS.config.update({
    region: REGION, // Replace with your AWS region, e.g., 'us-east-1'
    credentials: new CognitoIdentityCredentials({
      IdentityPoolId: POOL_ID, // Replace with your Identity Pool ID
    }),
  });

  const uploadResource = async ({
    selectedImages,
    conversationID,
    chatroomID,
    selectedFilesToUpload,
    uploadingFilesMessages,
    isRetry,
  }: UploadResource) => {
    LogBox.ignoreLogs(["new NativeEventEmitter"]);
    const s3 = new S3();
    let attachments: any = [];
    for (let i = 0; i < selectedImages?.length; i++) {
      const item = selectedImages[i];
      const attachmentType = isRetry ? item?.type : item?.type?.split("/")[0];
      const gifAttachmentType = item?.data?.type;
      const docAttachmentType = isRetry
        ? item?.type
        : item?.type?.split("/")[1];
      const thumbnailURL = item?.thumbnailUrl;
      const gifHeight = item?.data?.images?.fixed_width?.height;
      const gifWidth = item?.data?.images?.fixed_width?.width;
      const name =
        attachmentType === IMAGE_TEXT
          ? item.fileName
          : attachmentType === VIDEO_TEXT
            ? item.fileName
            : gifAttachmentType === GIF_TEXT
              ? generateGifName()
              : docAttachmentType === PDF_TEXT
                ? item.name
                : null;

      const path = `files/collabcard/${chatroomID}/conversation/${conversationID}/${name}`;
      const thumbnailUrlPath = `files/collabcard/${chatroomID}/conversation/${conversationID}/${thumbnailURL}`;
      let uriFinal: any;
      try {

        if (attachmentType === IMAGE_TEXT) {
          const compressedImgURI = await CompressedImage.compress(item.uri, {
            compressionMethod: "auto",
          });
          const compressedImg = await fetchResourceFromURI(compressedImgURI);
          uriFinal = compressedImg;
        } else {
          const img = await fetchResourceFromURI(item.uri ? item.uri : item.url);
          uriFinal = img;
        }

        //for video thumbnail
        let thumbnailUrlImg: any;
        if (
          thumbnailURL &&
          (attachmentType === VIDEO_TEXT || gifAttachmentType === GIF_TEXT)
        ) {
          thumbnailUrlImg = await fetchResourceFromURI(thumbnailURL);
        }

        const params = {
          Bucket: BUCKET,
          Key: path,
          Body: uriFinal,
          ACL: "public-read-write",
          ContentType: item?.type, // Replace with the appropriate content type for your file
        };

        //for video thumbnail
        const thumnnailUrlParams: any = {
          Bucket: BUCKET,
          Key: thumbnailUrlPath,
          Body: thumbnailUrlImg,
          ACL: "public-read-write",
          ContentType: "image/jpeg", // Replace with the appropriate content type for your file
        };

        let getVideoThumbnailData: any = null;
        if (
          thumbnailURL &&
          (attachmentType === VIDEO_TEXT || gifAttachmentType === GIF_TEXT)
        ) {
          getVideoThumbnailData = await s3.upload(thumnnailUrlParams).promise();
        }

        const data = await s3.upload(params).promise();

        const awsResponse = data.Location;

        if (awsResponse) {
          let fileType = "";
          if (docAttachmentType === PDF_TEXT) {
            fileType = PDF_TEXT;
          } else if (attachmentType === AUDIO_TEXT) {
            fileType = AUDIO_TEXT;
          } else if (attachmentType === VIDEO_TEXT) {
            fileType = VIDEO_TEXT;
          } else if (attachmentType === IMAGE_TEXT) {
            fileType = IMAGE_TEXT;
          } else if (gifAttachmentType === GIF_TEXT) {
            fileType = GIF_TEXT;
          }

          const payload = {
            conversationId: conversationID,
            filesCount: selectedImages?.length,
            index: i + 1,
            meta:
              fileType === VIDEO_TEXT
                ? {
                  size: selectedFilesToUpload[i]?.fileSize,
                  duration: selectedFilesToUpload[i]?.duration,
                }
                : {
                  size:
                    docAttachmentType === PDF_TEXT
                      ? selectedFilesToUpload[i]?.size
                      : selectedFilesToUpload[i]?.fileSize,
                },
            name:
              docAttachmentType === PDF_TEXT
                ? selectedFilesToUpload[i]?.name
                : gifAttachmentType === GIF_TEXT
                  ? name
                  : selectedFilesToUpload[i]?.fileName,
            type: fileType,
            url: awsResponse,
            thumbnailUrl:
              fileType === VIDEO_TEXT || fileType === GIF_TEXT
                ? getVideoThumbnailData?.Location
                : null,
            height: gifHeight ? gifHeight : null,
            width: gifWidth ? gifWidth : null,
          };

          attachments.push(payload)

          LMChatAnalytics.track(
            Events.ATTACHMENT_UPLOADED,
            new Map<string, string>([
              [Keys.CHATROOM_ID, chatroomID?.toString()],
              [Keys.CHATROOM_TYPE, chatroomDBDetails?.type?.toString()],
              [Keys.MESSAGE_ID, conversationID?.toString()],
              [Keys.TYPE, attachmentType],
            ])
          );
        }
      } catch (error) {
        dispatch({
          type: SET_FILE_UPLOADING_MESSAGES,
          body: {
            message: {
              ...uploadingFilesMessages[conversationID?.toString()],
              isInProgress: FAILED,
            },
            ID: conversationID,
          },
        });
        const id = conversationID;
        const message = {
          ...uploadingFilesMessages[conversationID?.toString()],
          isInProgress: FAILED,
        };

        await myClient?.saveAttachmentUploadConversation(
          id?.toString(),
          JSON.stringify(message)
        );
        return error;
      }
      dispatch({
        type: CLEAR_SELECTED_FILES_TO_UPLOAD,
      });
      dispatch({
        type: CLEAR_SELECTED_FILE_TO_VIEW,
      });
    }
    dispatch({
      type: CLEAR_FILE_UPLOADING_MESSAGES,
      body: {
        ID: conversationID,
      },
    });
    await myClient?.removeAttactmentUploadConversationByKey(
      conversationID?.toString()
    );
    return attachments;
  };

  const handleFileUpload = async (conversationID: any, isRetry: any) => {
    try {
      const res = await uploadResource({
        selectedImages: selectedFilesToUpload,
        conversationID: conversationID,
        chatroomID: chatroomID,
        selectedFilesToUpload,
        uploadingFilesMessages,
        isRetry: isRetry,
      });
      if (Array.isArray(res)) {
        return res;
      }
      return null;
    } catch (error) {
      console.log(error)
      return null
    }
  };

  const contextValues: FileUploadContextValues = {
    handleFileUpload,
    selectedFilesToUpload,
    selectedFileToView,
    len,
    backIconPath,
    itemType,
    imageCropIcon,
    video,
    docItemType,
    isGif,
    selectedImageBorderColor,
    selectedFilesToUploadThumbnails,
    chatroomID,
    previousMessage,
    chatroomDBDetails
  };

  return (
    <FileUploadContext.Provider value={contextValues}>
      {children}
    </FileUploadContext.Provider>
  );
};
