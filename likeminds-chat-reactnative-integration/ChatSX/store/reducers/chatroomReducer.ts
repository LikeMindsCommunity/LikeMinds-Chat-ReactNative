import { chatSchema } from "../../assets/chatSchema";
import {
  CLEAR_CHATROOM_CONVERSATION,
  CLEAR_CHATROOM_DETAILS,
  CLEAR_FILE_UPLOADING_MESSAGES,
  CLEAR_SELECTED_FILES_TO_UPLOAD,
  CLEAR_SELECTED_FILE_TO_VIEW,
  EDIT_CONVERSATION,
  FILE_SENT,
  FIREBASE_CONVERSATIONS_SUCCESS,
  GET_CHATROOM_SUCCESS,
  GET_CONVERSATIONS_SUCCESS,
  LONG_PRESSED,
  MESSAGE_SENT,
  ON_CONVERSATIONS_CREATE_SUCCESS,
  PAGINATED_CONVERSATIONS_END_SUCCESS,
  REACTION_SENT,
  SELECTED_FILES_TO_UPLOAD,
  SELECTED_FILES_TO_UPLOAD_THUMBNAILS,
  SELECTED_FILE_TO_VIEW,
  SELECTED_MESSAGES,
  SELECTED_MORE_FILES_TO_UPLOAD,
  SET_EDIT_MESSAGE,
  SET_IS_REPLY,
  SET_POSITION,
  SET_REPLY_MESSAGE,
  UPDATE_CHAT_REQUEST_STATE,
  UPDATE_CONVERSATIONS,
  EMPTY_BLOCK_DELETION,
  UPDATE_MULTIMEDIA_CONVERSATIONS,
  PAGINATED_CONVERSATIONS_START_SUCCESS,
  GET_CHATROOM_DB_SUCCESS,
  GET_CHATROOM_ACTIONS_SUCCESS,
  ADD_STATE_MESSAGE,
  SELECTED_VOICE_NOTE_FILES_TO_UPLOAD,
  CLEAR_SELECTED_VOICE_NOTE_FILES_TO_UPLOAD,
  SET_CHATROOM_CREATOR,
  SET_CHATROOM_TOPIC,
  CLEAR_SELECTED_MESSAGES,
  CLEAR_CHATROOM_TOPIC,
  SET_TEMP_STATE_MESSAGE,
  SET_MESSAGE_ID,
  SHOW_SHIMMER,
  HIDE_SHIMMER,
  ADD_SHIMMER_MESSAGE,
  REMOVE_SHIMMER_MESSAGE,
  SET_FAILED_MESSAGE_ID,
  CLEAR_FAILED_MESSAGE_ID,
} from "../types/types";

export interface ChatroomReducerState {
  conversations: any[];
  chatroomDetails: any;
  messageSent: any;
  isLongPress: boolean;
  selectedMessages: any[];
  stateArr: number[];
  position: { x: number; y: number };
  selectedFilesToUpload: any[];
  selectedFilesToUploadThumbnails: any[];
  selectedFileToView: any;
  isReply: boolean;
  replyMessage: string;
  editConversation: string;
  fileSent: number;
  chatroomDBDetails: any;
  selectedVoiceNoteFilesToUpload: any[];
  chatroomCreator: string;
  currentChatroomTopic: any;
  temporaryStateMessage: any;
  shimmerVisible: boolean;
  messageId: string;
  failedMessageId: string
}

export const initialState: ChatroomReducerState = {
  conversations: [],
  chatroomDetails: {} as any,
  messageSent: "" as any,
  isLongPress: false,
  selectedMessages: [],
  stateArr: [1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20], //states for person started, left, joined, added, removed messages, aceept DM, reject DM, turned to community manager.
  position: { x: 0, y: 0 } as any,
  selectedFilesToUpload: [],
  selectedFilesToUploadThumbnails: [],
  selectedFileToView: {} as any,
  isReply: false,
  replyMessage: "",
  editConversation: "",
  fileSent: 0,
  chatroomDBDetails: {},
  selectedVoiceNoteFilesToUpload: [],
  chatroomCreator: "",
  currentChatroomTopic: {},
  temporaryStateMessage: {},
  shimmerVisible: false,
  messageId: "",
  failedMessageId: ""
};

export function chatroomReducer(state = initialState, action: any) {
  switch (action.type) {
    case SET_CHATROOM_CREATOR: {
      const { chatroomCreator = {} } = action.body;
      return {
        ...state,
        chatroomCreator: chatroomCreator,
      };
    }
    case SET_CHATROOM_TOPIC: {
      const { currentChatroomTopic = {} } = action.body;
      return {
        ...state,
        currentChatroomTopic: currentChatroomTopic,
      };
    }
    case SET_TEMP_STATE_MESSAGE: {
      const { temporaryStateMessage = {} } = action.body;
      return {
        ...state,
        temporaryStateMessage: temporaryStateMessage,
      };
    }
    case CLEAR_CHATROOM_TOPIC: {
      return {
        ...state,
        currentChatroomTopic: {},
      };
    }
    case EMPTY_BLOCK_DELETION: {
      const newArr = [...state.conversations].splice(1);
      return {
        ...state,
        conversations: newArr,
      };
    }
    case SET_FAILED_MESSAGE_ID: {
      const { id } = action?.body;
      return (
        {
          ...state,
          failedMessageId: id
        }
      )
    }
    case CLEAR_FAILED_MESSAGE_ID: {
      return (
        {
          ...state,
          failedMessageId: ""
        }
      )
    }
    case ADD_SHIMMER_MESSAGE: {
      let isShimmerPresent = state?.conversations?.findIndex(
        message => message?.isShimmer == true
      )
      if (isShimmerPresent == -1) {
        return {...state, conversations: [ { id: Date.now(), isShimmer: true }, ...state.conversations ]}
      }
      return { ...state }
    }
    case REMOVE_SHIMMER_MESSAGE: {
      const filterConversation = state.conversations?.filter(
        message => message?.isShimmer == undefined
      )
      return {...state, conversation: filterConversation }
    }
    case ADD_STATE_MESSAGE: {
      const { conversation = {} } = action.body;
      return {
        ...state,
        conversations: [conversation, ...state.conversations],
      };
    }
    case LONG_PRESSED: {
      const isLongPressed = action.body;
      return {
        ...state,
        isLongPress: isLongPressed,
      };
    }
    case CLEAR_SELECTED_MESSAGES: {
      return {
        ...state,
        selectedMessages: [],
      };
    }
    case SELECTED_MESSAGES: {
      const selectedMessages = action.body;
      return {
        ...state,
        selectedMessages: selectedMessages,
      };
    }
    case GET_CHATROOM_DB_SUCCESS: {
      const { chatroomDBDetails = {} } = action.body;
      return { ...state, chatroomDBDetails: chatroomDBDetails };
    }
    case GET_CONVERSATIONS_SUCCESS: {
      let { conversations = [], shimmer } = action.body;
      // Append the shimmer message again after DB calls if conditions are true
      if (state.shimmerVisible || shimmer) {
        conversations = [ {id: Date.now(), isShimmer: true} , ...conversations]
      }
      return { ...state, conversations: conversations };
    }
    case PAGINATED_CONVERSATIONS_END_SUCCESS: {
      const { conversations = [] } = action.body;
      const arr = conversations.reverse();
      return { ...state, conversations: [...state.conversations, ...arr] };
    }
    case PAGINATED_CONVERSATIONS_START_SUCCESS: {
      const { conversations = [] } = action.body;
      const arr = conversations.reverse();
      return {
        ...state,
        conversations: [...arr, ...state.conversations],
      };
    }
    case FIREBASE_CONVERSATIONS_SUCCESS: {
      const data = action.body;
      const { conversations = [] } = data;
      const ID = conversations[0]?.id;
      const temporaryID = conversations[0]?.temporaryId;

      const conversationsList = [...state.conversations];
      const conversationArr: any = [...conversationsList];

      // index would be -1 if conversationsList is empty else it would have index of the element that needs to replaced
      const index = conversationsList.findIndex((element: any) => {
        return (
          element?.id?.toString() === ID?.toString() || // to check locally handled item id with ID
          element?.id?.toString() === temporaryID?.toString() // to replace the messsage if message is already there by verifying message's ID with conversationMeta ID;
        );
      });

      //replacing the value from the index that matches ID
      if (conversations.length > 0 && index !== -1) {
        conversationArr[index] = conversations[0];
      }

      return {
        ...state,
        conversations:
          index === -1 && conversationsList.length > 0 // no such element present already && conversationsList length > 0
            ? [conversations[0], ...conversationArr]
            : conversationArr,
      };
    }
    case ON_CONVERSATIONS_CREATE_SUCCESS: {
      const data = action.body;
      const { conversation = [], widgets } = data;

      if (
        conversation?.hasFiles ||
        !!conversation?.replyConversation ||
        conversation == undefined ||
        (Array.isArray(conversation) && conversation.length == 0)
      ) {
        return { ...state };
      }

      const temporaryID = conversation?.temporaryId;
      const conversationsList = [...state.conversations];
      const conversationArr: any = [...conversationsList];

      // index would be -1 if conversationsList is empty else it would have index of the element that needs to replaced
      const index = conversationsList.findIndex((element: any) => {
        return (
          element?.id?.toString() === temporaryID || // to check locally handled item id with temporaryID
          element?.temporaryId?.toString() === temporaryID // to replace the messsage if message is already there by verifying message's temporaryID with conversationMeta temporaryID;
        );
      });

      //replacing the value from the index that matches temporaryID
      if (index !== -1) {
        if (conversation.widgetId) {
          conversationArr[index] = {
            ...conversation,
            widget: widgets[conversation.widgetId],
          };
        } else {
          conversationArr[index] = conversation;
        }
      }
      return {
        ...state,
        conversations:
          index === -1 && conversationsList.length > 0 // no such element present already && conversationsList length > 0
            ? [conversation, ...conversationArr]
            : conversationArr,
      };
    }
    case UPDATE_CONVERSATIONS: {
      const { obj } = action.body;
      return { ...state, conversations: [obj, ...state.conversations] };
    }
    case UPDATE_MULTIMEDIA_CONVERSATIONS: {
      const id = action.body;
      // return null;
    }
    case CLEAR_CHATROOM_CONVERSATION: {
      const { conversations = [] } = action.body;
      return { ...state, conversations: conversations };
    }
    case GET_CHATROOM_ACTIONS_SUCCESS: {
      const chatroomDetails = action.body;
      return { ...state, chatroomDetails: chatroomDetails };
    }
    case GET_CHATROOM_SUCCESS: {
      const chatroomDBDetails = action.body;
      return { ...state, chatroomDBDetails: chatroomDBDetails };
    }
    case CLEAR_CHATROOM_DETAILS: {
      const { chatroomDBDetails } = action.body;
      return { ...state, chatroomDBDetails: chatroomDBDetails };
    }
    case UPDATE_CHAT_REQUEST_STATE: {
      const { chatRequestState } = action.body;
      return {
        ...state,
        chatroomDBDetails: {
          ...state.chatroomDBDetails,
          chatRequestState: chatRequestState,
        },
      };
    }
    case MESSAGE_SENT: {
      const { id: messageObj } = action.body;
      return { ...state, messageSent: messageObj };
    }
    case REACTION_SENT: {
      const { previousMsg, changedMsg } = action.body;
      const index = state?.conversations.findIndex(
        (element: any) => element?.id === changedMsg?.id
      );

      const arr = [...(state?.conversations as any)];
      if (index !== undefined || index !== -1) {
        arr[index] = changedMsg;
      }
      return { ...state, conversations: [...arr] };
    }
    case EDIT_CONVERSATION: {
      const { previousConversation, changedConversation } = action.body;
      const index = state?.conversations.findIndex(
        (element: any) => element?.id === changedConversation?.id
      );

      const arr = [...(state?.conversations as any)];
      if (index !== undefined || index !== -1) {
        arr[index] = changedConversation;
      }
      return { ...state, conversations: [...arr] };
    }
    case SET_POSITION: {
      const { pageX, pageY } = action.body;
      return { ...state, position: { x: pageX, y: pageY } };
    }
    case SELECTED_FILES_TO_UPLOAD: {
      const { images } = action.body;
      return { ...state, selectedFilesToUpload: [...images] };
    }
    case SELECTED_VOICE_NOTE_FILES_TO_UPLOAD: {
      const { audio } = action.body;
      return { ...state, selectedVoiceNoteFilesToUpload: [...audio] };
    }
    case SELECTED_FILES_TO_UPLOAD_THUMBNAILS: {
      const { images } = action.body;
      return { ...state, selectedFilesToUploadThumbnails: [...images] };
    }
    case SELECTED_FILE_TO_VIEW: {
      const { image } = action.body;
      return { ...state, selectedFileToView: image };
    }
    case SELECTED_MORE_FILES_TO_UPLOAD: {
      const { images } = action.body;
      return {
        ...state,
        selectedFilesToUpload: [...state.selectedFilesToUpload, ...images],
      };
    }
    case CLEAR_SELECTED_FILES_TO_UPLOAD: {
      return { ...state, selectedFilesToUpload: [] };
    }
    case CLEAR_SELECTED_VOICE_NOTE_FILES_TO_UPLOAD: {
      return { ...state, selectedVoiceNoteFilesToUpload: [] };
    }
    case CLEAR_SELECTED_FILE_TO_VIEW: {
      return { ...state, selectedFileToView: {} };
    }
    case SET_IS_REPLY: {
      const { isReply = false } = action.body;
      return { ...state, isReply: isReply };
    }
    case SET_REPLY_MESSAGE: {
      const { replyMessage = "" } = action.body;
      return { ...state, replyMessage: replyMessage };
    }
    case SET_EDIT_MESSAGE: {
      const { editConversation = "" } = action.body;
      return { ...state, editConversation: editConversation };
    }
    case FILE_SENT: {
      const { status = "" } = action.body;
      return { ...state, fileSent: status };
    }
    case SET_MESSAGE_ID: {
      const { id } = action.body;
      return { ...state, messageId: id };
    }
    case SHOW_SHIMMER: {
      return { ...state, shimmerVisible: true}
    }
    case HIDE_SHIMMER: {
      return { ...state, shimmerVisible: false}
    }
    default:
      return state;
  }
}
