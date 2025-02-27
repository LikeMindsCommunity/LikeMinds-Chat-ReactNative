import React, { createContext, ReactNode, useContext } from "react";

export interface CustomComponentsContextProps {
  children?: ReactNode;
  customReplyBox?: (item: any, chatroomName: string) => JSX.Element;
  customMessageHeader?: ReactNode;
  customMessageFooter?: ReactNode;
  customVideoImageAttachmentConversation?: ReactNode;
  customPdfAttachmentConversation?: ReactNode;
  customVoiceNoteAttachmentConversation?: ReactNode;
  customGifAttachmentConversation?: ReactNode;
  customMessageNotSupportedConversation?: ReactNode;
  customDeletedMessage?: ReactNode;
  customReplyConversations?: ReactNode;
  customPollConversationView?: ReactNode;
  customLinkPreview?: ReactNode;
  customStateMessage?: ReactNode;
  customReactionList?: React.ReactNode;
  customRetryButton?: React.ReactNode;
}

export interface CustomComponentsContext {
  customReplyBox?: (item: any, chatroomName: string) => JSX.Element;
  customMessageHeader?: ReactNode;
  customMessageFooter?: ReactNode;
  customVideoImageAttachmentConversation?: ReactNode;
  customPdfAttachmentConversation?: ReactNode;
  customVoiceNoteAttachmentConversation?: ReactNode;
  customGifAttachmentConversation?: ReactNode;
  customMessageNotSupportedConversation?: ReactNode;
  customDeletedMessage?: ReactNode;
  customReplyConversations?: ReactNode;
  customPollConversationView?: ReactNode;
  customLinkPreview?: ReactNode;
  customStateMessage?: ReactNode;
  customReactionList?: ReactNode;
  customRetryButton?: React.ReactNode;
}

const CustomComponentsContext = createContext<
  CustomComponentsContext | undefined
>(undefined);

export const useCustomComponentsContext = () => {
  const context = useContext(CustomComponentsContext);
  if (!context) {
    throw new Error(
      "useCustomComponentsContext must be used within an CustomComponentsContextProvider"
    );
  }
  return context;
};

export const CustomComponentContextProvider = ({
  children,
  customReplyBox,
  customMessageHeader,
  customMessageFooter,
  customVideoImageAttachmentConversation,
  customPdfAttachmentConversation,
  customVoiceNoteAttachmentConversation,
  customGifAttachmentConversation,
  customMessageNotSupportedConversation,
  customDeletedMessage,
  customReplyConversations,
  customPollConversationView,
  customLinkPreview,
  customStateMessage,
  customReactionList,
  customRetryButton
}: CustomComponentsContextProps) => {
  const contextValues: CustomComponentsContext = {
    customReplyBox,
    customMessageHeader,
    customMessageFooter,
    customVideoImageAttachmentConversation,
    customPdfAttachmentConversation,
    customVoiceNoteAttachmentConversation,
    customGifAttachmentConversation,
    customMessageNotSupportedConversation,
    customDeletedMessage,
    customReplyConversations,
    customPollConversationView,
    customLinkPreview,
    customStateMessage,
    customReactionList,
    customRetryButton
  };

  return (
    <CustomComponentsContext.Provider value={contextValues}>
      {children}
    </CustomComponentsContext.Provider>
  );
};
