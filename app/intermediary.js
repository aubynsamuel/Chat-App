import { useNavigation } from "@react-navigation/native";
import { router } from "expo-router";

const IntermediaryScreen = () => {
  const navigation = useNavigation();
  router.navigate("/home");
};

export default IntermediaryScreen;
