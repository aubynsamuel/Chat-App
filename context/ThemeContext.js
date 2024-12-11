import { createContext, useContext, useEffect, useState } from "react";
import greenTheme from "../Themes/Greenday";
import darkTheme from "../Themes/DarkMode";
import lightBlueTheme from "../Themes/SkyLander";
import purpleTheme from "../Themes/Purple";
import storage from "@/Functions/Storage";

const ThemeContext = createContext();
export const useTheme = () => useContext(ThemeContext);

const themes = [greenTheme, lightBlueTheme, darkTheme, purpleTheme];

export const ThemeContextProvider = ({ children }) => {
  const [selectedTheme, setSelectedTheme] = useState(themes[1]);
  const [chatBackgroundPic, setChatBackgroundPic] = useState();

  const changeBackgroundPic = (chatBackground) => {
    try {
      storage.set("backgroundPicture", chatBackground);
      setChatBackgroundPic(chatBackground);
      console.log("Background picture cached successfully");
    } catch (error) {
      console.error("Error saving background picture:", error);
      throw error; // Propagate error to handle in component
    }
  };

  useEffect(() => {
    try {
      const backgroundPicture = storage.getString("backgroundPicture");
      if (backgroundPicture) {
        setChatBackgroundPic(backgroundPicture);
        console.log("Background picture loaded successfully");
      }
    } catch (error) {
      console.error("Error loading background picture:", error);
    }
  }, []);

  useEffect(() => {
    try {
      const themeIndex = storage.getString("selectedTheme");
      if (themeIndex !== undefined) {
        setSelectedTheme(themes[JSON.parse(themeIndex)]);
        console.log("Theme fetched and updated", themeIndex);
      } else {
        setSelectedTheme(themes[1]);
        console.log("No theme found, using default");
      }
    } catch (error) {
      console.error("Error loading theme from MMKV:", error);
    }
  }, []);

  const changeTheme = (theme) => {
    try {
      storage.set("selectedTheme", JSON.stringify(theme));
      setSelectedTheme(themes[theme]);
      console.log("Theme cache successfully updated", theme);
    } catch (error) {
      console.error("Error saving theme to MMKV:", error);
    }
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
