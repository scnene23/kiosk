import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import prisma from "@/lib/db";

const AUTH_TOKEN =
  "q4vf9p8n4907895f7m8d24m75c2q947m2398c574q9586c490q756c98q4m705imtugcfecvrhym04capwz3e2ewqaefwegfiuoamv4ros2nuyp0sjc3iutow924bn5ry943utrjmi";

const JWT_SECRET = process.env.JWT_SECRET; 

// Função para gerar o token JWT
function generateAccessToken({ propertyID, requestID, resNo, profileID }) {
  const token = jwt.sign(
    { propertyID, requestID, resNo, profileID }, 
    JWT_SECRET, 
    { expiresIn: 600 }  // Expira em 10 minutos
  );
  console.log("Token gerado:", token); // Log do token gerado
  return token;
}

export async function POST(req) {
  try {
    // Verificar se o token de autorização está correto
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || authHeader !== AUTH_TOKEN) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Capturar os parâmetros da URL
    const { searchParams } = new URL(req.url);
    const propertyID = searchParams.get("propertyID");
    const resNo = searchParams.get("resNo");
    const profileID = searchParams.get("profileID");

    if (!propertyID || !resNo || !profileID) {
      return NextResponse.json(
        { error: "Parâmetros ausentes ou inválidos" },
        { status: 400 }
      );
    }

    // Lê o corpo da requisição que contém os dados do GuestInfo e ReservationInfo
    const requestBody = await req.json();
    if (!requestBody || !Array.isArray(requestBody) || requestBody.length === 0) {
      return NextResponse.json(
        { error: "Corpo da requisição inválido ou vazio" },
        { status: 400 }
      );
    }

    // Gravar no banco de dados
    const propertyIDInt = parseInt(propertyID, 10);
    const newRequest = await prisma.requestRecordsArrivals.create({
      data: {
        requestBody: requestBody,
        requestType: "POST",
        requestDateTime: new Date(),
        responseStatus: "200",
        responseBody: JSON.stringify(requestBody),
        propertyID: propertyIDInt,
      },
    });

    // Agora que temos o requestID, podemos gerar o token JWT
    const requestID = newRequest.requestID;
    const token = generateAccessToken({ propertyID, requestID, resNo, profileID });

    // Criar a URL com o token
    const redirectUrl = `http://localhost:3001/homepage/frontOfficeView/registrationForm?propertyID=${propertyID}&requestID=${requestID}&resNo=${resNo}&profileID=${profileID}&token=${token}`;

    // Salvar o token no cookie para manter a sessão
    const response = NextResponse.json({ redirectUrl });
    response.cookies.set("authToken", token, { httpOnly: true, maxAge: 60 * 60 }); // Token expira em 1 hora

    return response;

  } catch (error) {
    console.error("Erro no registrationForm_kiosk:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
