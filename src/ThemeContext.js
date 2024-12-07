// ThemeContext.js
import { createContext, useContext, useEffect, useState } from "react";
import greenTheme from "./Themes/Greenday";
import darkTheme from "./Themes/DarkMode";
import lightBlueTheme from "./Themes/SkyLander";
import purpleTheme from "./Themes/Purple";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ThemeContext = createContext();
export const useTheme = () => useContext(ThemeContext);

const themes = [greenTheme, lightBlueTheme, darkTheme, purpleTheme];

export default ThemeContextProvider = ({ children }) => {
  const [selectedTheme, setSelectedTheme] = useState(themes[1]);
  const [chatBackgroundPic, setChatBackgroundPic] = useState();

  const changeBackgroundPic = async (chatBackground) => {
    try {
      await AsyncStorage.setItem("backgroundPicture", chatBackground);
      setChatBackgroundPic(chatBackground);
      console.log("Background picture cached successfully");
    } catch (error) {
      console.error("Error saving background picture:", error);
      throw error; // Propagate error to handle in component
    }
  };

  useEffect(() => {
    const loadBackgroundImage = async () => {
      try {
        const backgroundPicture = await AsyncStorage.getItem("backgroundPicture");
        if (backgroundPicture) {
          setChatBackgroundPic(backgroundPicture);
          console.log("Background picture loaded successfully");
        }
      } catch (error) {
        console.error("Error loading background picture:", error);
      }
    };
    loadBackgroundImage();
  }, []);

  useEffect(() => {
    const loadTheme = async () => {
      // Moved async logic into a function
      try {
        const theme = await AsyncStorage.getItem("selectedTheme");
        if (theme) {
          setSelectedTheme(themes[JSON.parse(theme)]);
          console.log("Theme fetched and updated ", theme);
        } else {
          setSelectedTheme(themes[1]);
          console.log("No theme found, using default");
        }
      } catch (error) {
        console.error("Error loading theme from AsyncStorage:", error);
      }
    };
    loadTheme();
  }, []);

  const changeTheme = async (theme) => {
    setSelectedTheme(themes[theme]);
    await AsyncStorage.setItem("selectedTheme", JSON.stringify(theme));
    console.log("Theme cache successfully updated ", theme);
  };

  return (
    <ThemeContext.Provider
      value={{
        selectedTheme,
        changeTheme,
        chatBackgroundPic,
        changeBackgroundPic,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};
