import { View } from "react-native";
import React from "react";
import SendDMRequestModal from "../../customModals/SendDMRequest";

import VoiceNoteRecordToast from "../VoiceNoteRecordToast";
import SelectFilesModal from "../../customModals/SelectFilesModal";
import UserTaggingList from "../UserTaggingList";
import ReplyBoxView from "../ReplyBoxView";
import LinkPreviewInputView from "../LinkPreviewInputView";
import EditBox from "../EditBox";
import AddMoreFilesView from "../AddMoreFilesView";
import InputBoxView from "../InputBoxView";
import AddFilesView from "../AddFilesView";
import RecordSendInputFabView from "../RecordSendInputFabView";
import { useInputBoxContext } from "../../context/InputBoxContext";
import TextInputWrapper from "../TextInputWrapper";
import InputWrapperLeftSection from "../InputWrapperLeftSection";
import InputWrapper from "../InputWrapper";

const MessageInputBox = () => {
  const { hideDMSentAlert, message, DMSentAlertModalVisible, onSend } =
    useInputBoxContext();

  return (
    <View>
      <VoiceNoteRecordToast />

      <InputWrapper>
        <InputWrapperLeftSection>
          <UserTaggingList />
          <ReplyBoxView />
          <LinkPreviewInputView />
          <EditBox />

          <TextInputWrapper>
            <AddMoreFilesView />
            <InputBoxView />
            <AddFilesView />
          </TextInputWrapper>
        </InputWrapperLeftSection>

        {/* Send message and send voice notes UI */}
        <RecordSendInputFabView />
      </InputWrapper>

      {/* More features modal like select Images, Docs etc. */}
      <SelectFilesModal />
      {/* SEND DM request Modal */}
      <SendDMRequestModal
        hideDMSentAlert={hideDMSentAlert}
        DMSentAlertModalVisible={DMSentAlertModalVisible}
        onSend={onSend}
        message={message}
      />
    </View>
  );
};

export default MessageInputBox;
