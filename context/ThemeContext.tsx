import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import greenTheme from "../Themes/Greenday";
import darkTheme from "../Themes/DarkMode";
import lightBlueTheme from "../Themes/SkyLander";
import purpleTheme from "../Themes/Purple";
import storage from "../Functions/Storage";

// Define a type for the theme structure
export interface Theme {
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  readColor: string;
  screenHeaderBarColor: string;
  Statusbar: {
    style: string;
    backgroundColor: string;
  };
  text: {
    primary: string;
    secondary: string;
    inverse: string;
  };
  border: string;
  input: {
    background: string;
    border: string;
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
}

// Define the shape of the context value
export interface ThemeContextType {
  selectedTheme: Theme;
  changeTheme: (themeIndex: number) => void;
  chatBackgroundPic: string | undefined;
  changeBackgroundPic: (chatBackground: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeContextProvider");
  }
  return context;
};

const themes: Theme[] = [greenTheme, lightBlueTheme, darkTheme, purpleTheme];

interface ThemeContextProviderProps {
  children: ReactNode;
}

export const ThemeContextProvider: React.FC<ThemeContextProviderProps> = ({
  children,
}) => {
  const [selectedTheme, setSelectedTheme] = useState<Theme>(themes[1]);
  const [chatBackgroundPic, setChatBackgroundPic] = useState<
    string | undefined
  >(undefined);

  const changeBackgroundPic = (chatBackground: string) => {
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
      }
    } catch (error) {
      console.error("Error loading background picture:", error);
    }
  }, []);

  useEffect(() => {
    try {
      const themeIndex = storage.getString("selectedTheme");
      if (themeIndex !== undefined) {
        const parsedIndex = JSON.parse(themeIndex);
        setSelectedTheme(themes[parsedIndex]);
      } else {
        setSelectedTheme(themes[1]);
      }
    } catch (error) {
      console.error("Error loading theme from storage:", error);
      setSelectedTheme(themes[1]); // Default to second theme
    }
  }, []);

  const changeTheme = (themeIndex: number) => {
    try {
      // Ensure theme index is within bounds
      const safeIndex = themeIndex % themes.length;

      storage.set("selectedTheme", JSON.stringify(safeIndex));
      setSelectedTheme(themes[safeIndex]);
      console.log("Theme cache successfully updated", safeIndex);
    } catch (error) {
      console.error("Error saving theme to storage:", error);
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
