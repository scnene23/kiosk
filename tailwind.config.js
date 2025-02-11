const { heroui } = require("@heroui/react");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {

      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  darkMode: "class",
  plugins: [heroui({
    //addCommonColors: true,
    themes: {
      light: {
        colors: {
          primaryBackground: "#FFFFFF",
          background: "#FAFAFA",
          foreground: "#001517",
          textPrimaryColor: "#000000",
          textLabelColor: "#404040",
          textSecondaryLabelColor: "#363636",
          cardColor: "#FFFFFF",
          primary: {
            50: '#f7e9dc',
            100: '#FAE7D6',
            DEFAULT: '#FC9D25',
            foreground: "#f5f5f5",
          },
          focus: "#0D9488",
          tableFooter: "#edebeb",
          tableFooterBorder: "#DADADA",
          lightBlue: "#E6EDF4",
          green: '#159F46',
          tableCol: '#F8F8F8',
          tableColWeekend: '#E3F1FC',
          lightBlueCol: '#F4F7FE',
          lightGray: '#ededed',
          mediumGray: '#dbd9d9'
        },
      },
      dark: {
        colors: {
          primaryBackground: "#141414",
          background: "#1a1a1a",
          textPrimaryColor: "#FAFAFA",
          textLabelColor: "#ebebeb",
          textSecondaryLabelColor: "#f5f5f5",
          cardColor: "#403f3f",
          primary: {
            50: '#debfa2',
            100: '#FAE7D6',
            DEFAULT: '#FC9D25',
            foreground: "#f5f5f5",
          },
          tableFooter: "#404040",
          tableFooterBorder: "#2e2d2d",
          lightGray: '#525252',
          mediumGray: '#383838'
        }
      }
    }
  })],
}
