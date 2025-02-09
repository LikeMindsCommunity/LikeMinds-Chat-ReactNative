import { View, TouchableOpacity } from "react-native";
import React from "react";
import { LMChatIcon } from "../../uiComponents";
import { useInputBoxContext } from "../../context/InputBoxContext";
import { ChatroomType } from "../../enums";

interface AddMoreFilesViewProps {
  handleGalleryProp?: () => void;
  handleDocumentProp?: () => void;
}

const AddMoreFilesView = ({
  handleGalleryProp,
  handleDocumentProp,
}: AddMoreFilesViewProps) => {
  const {
    isUploadScreen,
    isDoc,
    isGif,
    selectGallery,
    selectDoc,
    isUserChatbot,
    chatroomType,
    inputBoxStyles,
  } = useInputBoxContext();

  const isDMChatroom = chatroomType === ChatroomType.DMCHATROOM && isUserChatbot;
  const addMoreFilesViewStyles = inputBoxStyles?.addMoreFilesViewStyles;

  return (
    <>
      {!!isUploadScreen && !isDoc && !isGif && !isDMChatroom ? (
        <TouchableOpacity
          style={addMoreFilesViewStyles?.addMoreButton}
          onPress={() => {
            if (handleGalleryProp) {
              handleGalleryProp();
            } else {
              selectGallery();
            }
          }}
        >
          <LMChatIcon
            assetPath={
              addMoreFilesViewStyles?.addMoreButton?.assetPath ??
              require("../../assets/images/addImages3x.png")
            }
            iconStyle={addMoreFilesViewStyles?.emoji}
          />
        </TouchableOpacity>
      ) : !!isUploadScreen && !isDoc && !isGif && !isDMChatroom ? (
        <TouchableOpacity
          style={addMoreFilesViewStyles?.addMoreButton}
          onPress={() => {
            if (handleDocumentProp) {
              handleDocumentProp();
            } else {
              selectDoc();
            }
          }}
        >
          <LMChatIcon
              assetPath={inputBoxStyles?.addMoreFilesViewStyles?.addMoreButton?.assetPath ?? require("../../assets/images/addImages3x.png")}

            iconStyle={addMoreFilesViewStyles?.emoji}
          />
        </TouchableOpacity>
      ) : isUploadScreen ? (
        <View style={addMoreFilesViewStyles?.paddingHorizontal} />
      ) : null}
    </>
  );
};

export default AddMoreFilesView;
