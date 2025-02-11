"use client";
import React from "react";
import Backdrop from '@mui/material/Backdrop';
import { useState, useEffect } from "react";
import en from "../../../public/locales/english/common.json";
import pt from "../../../public/locales/portuguesPortugal/common.json";
import es from "../../../public/locales/espanol/common.json";

const translations = { en, pt, es };

const LoadingBackdrop = ({ open }) => {

  const [locale, setLocale] = useState("pt");
  
  useEffect(() => {
    // Carregar o idioma do localStorage
    const storedLanguage = localStorage.getItem("language");
    if (storedLanguage) {
      setLocale(storedLanguage);
    }
  }, []);

  // Carregar as traduções com base no idioma atual
  const t = translations[locale] || translations["pt"]; // fallback para "pt"
  return (
    <Backdrop
      sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
      open={open}
    >
      <div 
        style={{
          maxWidth: '300px', 
          padding: '16px', 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          backgroundColor: '#fff', 
          borderRadius: '8px'
        }}
      >
        <h2 style={{ marginBottom: '8px' }} className="text-black">Extensions myPMS</h2>
        <img 
          src="/loading/extensionsLoader.gif" 
          alt="Loading..." 
          style={{ width: '100px', height: '100px', marginBottom: '16px' }} 
        />
        <p style={{ textAlign: 'center', marginTop: '0' }} className="text-black">{t.errors.loading}</p>
      </div>
    </Backdrop>
  );
};

export default LoadingBackdrop;
