import { useNavigation } from "@react-navigation/native";

const IntermediaryScreen = () => {
  const navigation = useNavigation();
  navigation.navigate("Home");
};

export default IntermediaryScreen;
