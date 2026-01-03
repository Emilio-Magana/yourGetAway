import { createContext, useContext, useEffect } from "react";
import { useLocalStorageState } from "./../hooks/useLocalStorageState";

type DarkModeContextType = {
  isDarkModeEnabled: boolean;
  toggleDarkMode: (bool: boolean) => void;
};

const DarkModeContext = createContext<DarkModeContextType | undefined>(
  undefined
);
function DarkModeProvider({ children }: { children: React.ReactNode }) {
  const [isDarkModeEnabled, setIsDarkModeEnabled] = useLocalStorageState(
    false,
    "isDarkModeEnabled"
  );

  useEffect(() => {
    const classList = document.documentElement.classList;
    if (isDarkModeEnabled) {
      classList.add("dark-mode");
      classList.remove("light-mode");
    } else {
      classList.add("light-mode");
      classList.remove("dark-mode");
    }
  }, [isDarkModeEnabled]);

  const toggleDarkMode = () => setIsDarkModeEnabled((enabled) => !enabled);

  return (
    <DarkModeContext.Provider value={{ isDarkModeEnabled, toggleDarkMode }}>
      {children}
    </DarkModeContext.Provider>
  );
}

function useDarkMode() {
  const context = useContext(DarkModeContext);
  if (context === undefined)
    throw new Error("DarkModeContext was used outside of DarkModeProvider");
  return context;
}

export { DarkModeProvider, useDarkMode };
