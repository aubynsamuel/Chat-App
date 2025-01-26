import { Timestamp } from "@react-native-firebase/firestore";

export interface User {
  userId: string;
  username: string;
}

export interface replyData {
  _id: string | number;
  text: string;
  user: {
    _id: string;
    name: string;
  };
  type: string | undefined;
  image: string | null;
  audio: string | null;
  location: {
    latitude?: number;
    longitude?: number;
  } | null;
}

export interface IMessage {
  _id: string | number;
  text: string;
  createdAt: Date;
  user: {
    _id: string;
    name: string;
  };
  image?: string;
  audio?: string;
  replyTo?: replyData | null;
  read?: boolean;
  delivered?: boolean;
  type?: string;
  location?: {
    latitude?: number;
    longitude?: number;
  };
  duration?: string | null;
}
export interface FirebaseMessage {
  roomId?: any;
  content: any;
  senderId: string | undefined;
  senderName: string | undefined;
  createdAt: Timestamp;
  replyTo?: replyData | null;
  read: boolean;
  delivered: boolean;
  type: any;
  image: any;
  audio: any;
  location?: {
    latitude?: number;
    longitude?: number;
  } | null;
  duration?: string | null;
}

export interface Theme {
  primary: string;
  secondary: string;
  text: {
    primary: string;
    secondary: string;
  };
  message: {
    user: {
      background: string;
      text: string;
      time: string;
    };
    other: {
      background: string;
      text: string;
      time: string;
    };
  };
  Statusbar: {
    style: string;
  };
}

export interface ChatScreenProps {
  userId: string;
  username: string;
  user: User;
  selectedTheme: Theme;
  chatBackgroundPic: string;
  profileUrl: string;
  imageModalVisibility: boolean;
  setImageModalVisibility: (visibility: boolean) => void;
  setAudioRecordingOverlay: (loading: boolean) => void;
}
