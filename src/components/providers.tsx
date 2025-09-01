import {ClerkProvider} from "@clerk/nextjs";
import {ThemeProvider as NextThemesProvider} from "next-themes";

const Providers = ({children}: {children: React.ReactNode}) => {
  return (
    <>
      <NextThemesProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <ClerkProvider>{children}</ClerkProvider>
      </NextThemesProvider>
    </>
  );
};

export default Providers;
