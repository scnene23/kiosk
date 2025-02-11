'use client';

import { redirect } from "next/navigation";
import { useState, useEffect } from "react"; // Adicionando useEffect
import { useSession } from "next-auth/react";

export default function Home() {
  const { data: session } = useSession(); // Acessa a sessão do usuário
  const [selectedHotelID, setSelectedHotelID] = useState(""); // Estado para armazenar o ID do hotel

  // Recupera o Hotel ID do localStorage ou usa o ID da primeira propriedade do usuário
  useEffect(() => {
    // Tenta obter o ID do hotel do localStorage
    const savedHotelID = localStorage.getItem("selectedHotelID");

    if (savedHotelID) {
      // Se o ID estiver no localStorage, define ele no estado
      setSelectedHotelID(savedHotelID);
    } else if (session?.user?.propertyIDs && session.user.propertyIDs.length > 0) {
      // Caso contrário, usa o primeiro propertyID da sessão do usuário
      setSelectedHotelID(session.user.propertyIDs[0]);
    }
  }, [session]); // Dependência para executar a lógica quando a sessão for carregada

  // Redireciona para a página do hotel com o ID selecionado ou para /homepage se não houver ID
  useEffect(() => {
    if (selectedHotelID) {
      redirect(`/homepage/frontOfficeView/${selectedHotelID}`);
    } else {
      redirect("/homepage");
    }
  }, [selectedHotelID]); // Executa o redirecionamento quando o selectedHotelID mudar

  return null; // Componente não precisa renderizar nada aqui
}
