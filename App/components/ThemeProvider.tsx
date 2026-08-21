"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

type ThemeProviderProps = React.ComponentProps<typeof NextThemesProvider>;

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  React.useEffect(() => {
    // Read and apply primary color from local storage
    const primaryColor = localStorage.getItem('primaryColor');
    if (primaryColor) {
      document.documentElement.style.setProperty('--primary', primaryColor);
      document.documentElement.style.setProperty('--color-primary', primaryColor);
    }
  }, []);

  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
