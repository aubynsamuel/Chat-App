import React from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme, HeaderBarHomeScreen } from "../../imports";

const CallsScreen = () => {
  const { selectedTheme } = useTheme();

  const callsData = [
    {
      id: "1",
      name: "Alice Johnson",
      avatar: "https://randomuser.me/api/portraits/women/1.jpg",
      type: "missed",
      timestamp: "10:45 AM",
    },
    {
      id: "2",
      name: "Bob Smith",
      avatar: "https://randomuser.me/api/portraits/men/2.jpg",
      type: "incoming",
      timestamp: "Yesterday",
    },
    {
      id: "3",
      name: "Charlie Adams",
      avatar: "https://randomuser.me/api/portraits/men/3.jpg",
      type: "outgoing",
      timestamp: "Monday",
    },
  ];

  const renderCallItem = ({ item }) => {
    const callIcon =
      item.type === "missed"
        ? "call-missed"
        : item.type === "incoming"
        ? "call-received"
        : "call-made";

    const callIconColor = item.type === "missed" ? "red" : "green";

    return (
      <TouchableOpacity style={styles.callItem} activeOpacity={0.8}>
        <Image source={{ uri: item.avatar }} style={styles.avatar} />
        <View style={styles.callDetails}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.timestamp}>{item.timestamp}</Text>
        </View>
        <MaterialIcons
          name={callIcon}
          size={24}
          color={callIconColor}
          style={styles.callIcon}
        />
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <HeaderBarHomeScreen
        title="Calls"
        backButtonShown={false}
        theme={selectedTheme}
        profilePicShown={false}
      />
      <FlatList
        data={callsData}
        keyExtractor={(item) => item.id}
        renderItem={renderCallItem}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  listContainer: {
    padding: 10,
  },
  callItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    marginVertical: 5,
    backgroundColor: "#fff",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  callDetails: {
    flex: 1,
    marginHorizontal: 10,
  },
  name: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  timestamp: {
    fontSize: 14,
    color: "#999",
  },
  callIcon: {
    marginLeft: 10,
  },
});

export default CallsScreen;
