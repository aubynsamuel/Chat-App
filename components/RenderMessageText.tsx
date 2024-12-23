import { TouchableOpacity, Text, View } from "react-native";
import { MessageText } from "react-native-gifted-chat";

const RenderMessageText = ({
  props,
  scrollToMessage,
  selectedTheme,
  user,
}: any) => {
  const { currentMessage } = props;

  return (
    <View>
      {/* Display replied-to message if available */}
      {currentMessage.replyTo && (
        <TouchableOpacity
          activeOpacity={0.5}
          onPress={() => scrollToMessage(currentMessage.replyTo._id)}
          style={
            {
              backgroundColor:
                currentMessage.user._id === user?.userId
                  ? selectedTheme.background
                  : selectedTheme.background,
              borderTopRightRadius:
                currentMessage.user._id === user?.userId ? null : 10,
              borderTopLeftRadius:
                currentMessage.user._id === user?.userId ? 10 : null,
              borderRadius: 8,
              margin: 4,
              paddingHorizontal: 5,
              paddingVertical: 3,
              borderRightWidth:
                currentMessage.user._id === user?.userId ? 4 : 0,
              borderLeftWidth: currentMessage.user._id === user?.userId ? 0 : 4,
              borderColor:
                currentMessage.user._id === user?.userId
                  ? selectedTheme.secondary
                  : selectedTheme.secondary,
            } as any
          }
        >
          {/* Name of the replier */}
          <Text
            style={{
              fontSize: 11,
              color: selectedTheme.secondary,
              fontWeight: "bold",
              // fontStyle: "italic",
            }}
            numberOfLines={1}
          >
            {currentMessage.replyTo.user?.name === user?.username
              ? "You"
              : currentMessage.replyTo.user.name}
          </Text>

          {/* Message Replied To */}
          <Text
            numberOfLines={2}
            style={{
              fontSize: 14,
              color: selectedTheme.reply?.text,
            }}
          >
            {currentMessage.replyTo.type === "text"
              ? currentMessage.replyTo.text
              : currentMessage.replyTo.type === "image"
              ? "📷 Image"
              : currentMessage.replyTo.type === "audio"
              ? "🔊 Audio"
              : "Unknown Content"}
          </Text>
        </TouchableOpacity>
      )}

      {/* Original message */}
      <MessageText
        {...props}
        textStyle={{
          left: { color: selectedTheme.message.other.text },
          right: { color: selectedTheme.message.user.text },
        }}
      />
    </View>
  );
};

export default RenderMessageText;
