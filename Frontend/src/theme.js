// src/theme.js
import { extendTheme } from "@chakra-ui/react";

const config = {
  initialColorMode: "light",
  useSystemColorMode: false,
};

const colors = {
  brand: {
    50: "#F5F3FF",
    100: "#EDE9FE",
    200: "#DDD6FE",
    300: "#C4B5FD",
    400: "#A78BFA",
    500: "#8B5CF6",
    600: "#7C3AED",
    700: "#6D28D9",
    800: "#5B21B6",
    900: "#4C1D95",
  },
};

const theme = extendTheme({
  config,
  colors,
  styles: {
    global: {
      body: {
        bg: "#F5F3FF",
        color: "#1F1F1F",
      },
    },
  },
  components: {
    Button: {
      baseStyle: {
        borderRadius: "18px",
        fontWeight: "700",
        transition: "all 0.3s ease",
        boxShadow: "0 4px 20px rgba(109,40,217,0.2)",
      },
      defaultProps: {
        colorScheme: "purple",
      },
    },
    Heading: {
      baseStyle: {
        color: "#4C1D95",
      },
    },
  },
});

export default theme;
