import { NextResponse } from "next/server";
import axios from "axios";
import prisma from "@/lib/db"; // Certifique-se de que o Prisma esteja configurado corretamente

export async function POST(request) {
  try {
    // Parse do corpo da requisição
    const body = await request.json();
    const { PropertyID, pdfBase64, fileName, ResNo, ProfileID } = body;

    // Validação dos campos obrigatórios
    if (!PropertyID || !pdfBase64 || !fileName || !ResNo || !ProfileID) {
      return new NextResponse(
        JSON.stringify({ error: "Parâmetros ausentes: PropertyID, pdfBase64, fileName, ResNo ou ProfileID" }),
        { status: 400, headers: { "Content-Type": "application/json; charset=utf-8" } }
      );
    }

    // Garantir que PropertyID seja um número inteiro
    const propertyIDInt = parseInt(PropertyID, 10);
    if (isNaN(propertyIDInt)) {
      return new NextResponse(
        JSON.stringify({ error: "PropertyID inválido, deve ser um número" }),
        { status: 400, headers: { "Content-Type": "application/json; charset=utf-8" } }
      );
    }

    // Consulta o banco de dados para obter propertyServer e propertyPort
    const property = await prisma.properties.findUnique({
      where: {
        propertyID: propertyIDInt,
      },
      select: {
        propertyServer: true,
        propertyPort: true,
      },
    });

    if (!property) {
      return new NextResponse(
        JSON.stringify({ error: "PropertyID não encontrado no banco de dados" }),
        { status: 404, headers: { "Content-Type": "application/json; charset=utf-8" } }
      );
    }

    const { propertyServer, propertyPort } = property;
    const uploadUrl = `http://${propertyServer}:${propertyPort}/registration_form_base64`;
    console.log("URL da requisição de upload:", uploadUrl);

    const headers = {
      "FileName": fileName,
      Authorization: "q4vf9p8n4907895f7m8d24m75c2q947m2398c574q9586c490q756c98q4m705imtugcfecvrhym04capwz3e2ewqaefwegfiuoamv4ros2nuyp0sjc3iutow924bn5ry943utrjmi",
      "Content-Type": "text/plain",
    };

    try {
      // Envia a requisição POST com o corpo contendo apenas o pdfBase64
      const uploadResponse = await axios.post(uploadUrl, pdfBase64, { headers });

      // Construindo a resposta para o segundo endpoint
      const acceptanceResponse = {
        bookingNumber: ResNo,
        externalProfileId: ProfileID,
        accepted: true,
      };

      // Headers para o segundo endpoint
      const responseHeaders = {
        "X-Custom-Header": "pttexternalcall",
        "Content-Type": "application/json",
      };

      const requestUrl = "https://apiopo.ykioskhotel.com/api/v1/sefdocument/SetExternalAcceptance";
      await axios.post(requestUrl, acceptanceResponse, { headers: responseHeaders });

      return new NextResponse(
        JSON.stringify({ message: "PDF enviado e aceitação registrada com sucesso", response: uploadResponse.data }),
        { status: 200, headers: { "Content-Type": "application/json; charset=utf-8" } }
      );
    } catch (uploadError) {
      console.error("Erro ao enviar PDF:", uploadError.message);

      // Construindo a resposta negativa
      const rejectionResponse = {
        bookingNumber: ResNo,
        externalProfileId: ProfileID,
        accepted: false,
      };

      const responseHeaders = {
        "X-Custom-Header": "pttexternalcall",
        "Content-Type": "application/json",
      };

      const requestUrl = "https://apiopo.ykioskhotel.com/api/v1/sefdocument/SetExternalAcceptance";
      await axios.post(requestUrl, rejectionResponse, { headers: responseHeaders });

      return new NextResponse(
        JSON.stringify({ error: "Erro ao enviar PDF", details: uploadError.message }),
        { status: 500, headers: { "Content-Type": "application/json; charset=utf-8" } }
      );
    }
  } catch (error) {
    console.error("Erro ao processar requisição:", error.message);
    return new NextResponse(
      JSON.stringify({ error: "Erro interno ao processar a requisição", details: error.message }),
      { status: 500, headers: { "Content-Type": "application/json; charset=utf-8" } }
    );
  }
}
