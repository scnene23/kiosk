/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.module.rules.push({
      test: /\.html$/, // Regra para arquivos HTML
      use: ["html-loader"], // Usar o html-loader para processar arquivos HTML
    });

    return config;
  },
  i18n: {
    locales: ['english', 'portuguesPortugal', 'espanol'], // Idiomas suportados
    defaultLocale: 'english',        // Idioma padrão
  },
};

export default nextConfig;
