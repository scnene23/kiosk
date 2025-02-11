import { NextResponse } from "next/server";
import axios from "axios";
import prisma from "@/lib/db";

export async function POST(request) {
  try {
    // Obtém os dados do corpo da requisição
    const body = await request.json();
    console.log("Dados recebidos no backend:", body);

    // Acessa o parâmetro propertyID do corpo da requisição
    const PropertyID = body.propertyID;

    // Verifica se o parâmetro PropertyID está presente
    if (!PropertyID) {
      return new NextResponse(
        JSON.stringify({ error: "Faltam parâmetros: PropertyID" }),
        { status: 400, headers: { 'Content-Type': 'application/json; charset=utf-8' } }
      );
    }

    // Garantir que PropertyID seja um número inteiro
    const propertyIDInt = parseInt(PropertyID, 10);

    if (isNaN(propertyIDInt)) {
      return new NextResponse(
        JSON.stringify({ error: "PropertyID inválido, deve ser um número" }),
        { status: 400, headers: { 'Content-Type': 'application/json; charset=utf-8' } }
      );
    }

    // Consulta ao banco de dados para obter informações sobre o servidor e a porta
    const property = await prisma.properties.findUnique({
      where: { propertyID: propertyIDInt },
      select: { propertyServer: true, propertyPort: true }
    });

    if (!property) {
      return new NextResponse(
        JSON.stringify({ error: "PropertyID não encontrado no banco de dados" }),
        { status: 404, headers: { 'Content-Type': 'application/json; charset=utf-8' } }
      );
    }

    const { propertyServer, propertyPort } = property;

    // Prepara os dados para enviar ao servidor externo
    const dataToSend = {
      editedEmail: body.email !== undefined ? body.email : null,
      editedVAT: body.vatNo !== undefined ? body.vatNo : null,
      registerID: body.registerID !== undefined ? body.registerID : null
    };

    // Verifica se pelo menos um dos campos (editedEmail, editedVAT ou registerID) está presente
    if (!dataToSend.editedEmail && !dataToSend.editedVAT && !dataToSend.registerID) {
      return new NextResponse(
        JSON.stringify({ error: "Faltam dados: editedEmail, editedVAT ou registerID" }),
        { status: 400, headers: { 'Content-Type': 'application/json; charset=utf-8' } }
      );
    }

    console.log("Dados a serem enviados:", dataToSend);

    // Define a URL de destino dinamicamente
    const url = `http://${propertyServer}:${propertyPort}/valuesEdited`;
    console.log("URL de destino:", url);

    // Envia os dados para o servidor externo com o token de autorização no cabeçalho
    const response = await axios.post(url, dataToSend, {
      headers: {
        Authorization: 'q4vf9p8n4907895f7m8d24m75c2q947m2398c574q9586c490q756c98q4m705imtugcfecvrhym04capwz3e2ewqaefwegfiuoamv4ros2nuyp0sjc3iutow924bn5ry943utrjmi',
        'Content-Type': 'application/json',
      },
    });
    console.log("Resposta da API externa:", response.data);

    return new NextResponse(
      JSON.stringify({ message: "Dados recebidos e enviados com sucesso", data: response.data }),
      { status: 200, headers: { 'Content-Type': 'application/json; charset=utf-8' } }
    );

  } catch (error) {
    console.error("Erro ao processar os dados:", error.response ? error.response.data : error.message);
    return new NextResponse(
      JSON.stringify({ error: error.response ? error.response.data : "Erro ao processar os dados" }),
      { status: 500, headers: { 'Content-Type': 'application/json; charset=utf-8' } }
    );
  }
}
