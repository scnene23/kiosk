"use client";
import React from "react";

export default function InputFieldControlled({
  type,
  id,
  name,
  onChange,
  label,
  ariaLabel,
  style = "", // Default style string
  value,
  disabled,
}) {
  // Verificar se há uma classe de tamanho da fonte no estilo fornecido
  const hasFontSize = style && typeof style === "string" && style.includes("text-");

  return (
    <div>
      <p className="text-gray-400" style={{ fontSize: "9px" }}>
        {label}
      </p>
      <input
        type={type}
        id={id}
        disabled={disabled}
        name={name}
        // Adiciona classe padrão text-[13px] se nenhuma classe de fonte for especificada
        className={`outline-none text-gray-900 ${
          hasFontSize ? style : `${style} text-[13px]`
        }`}
        onChange={onChange}
        placeholder="-"
        aria-label={ariaLabel}
        value={value}
      />
    </div>
  );
}
