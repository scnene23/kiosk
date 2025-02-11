import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Função para gerar a `uniqueKey`
const generateUniqueKey = (HotelInfo, Reservation, GuestInfo) => {
  if (!HotelInfo || !Reservation || !GuestInfo) {
    throw new Error("Dados insuficientes para gerar a chave única.");
  }

  const { Tag } = HotelInfo;
  const { RoomNumber, ReservationNumber, DateCI, DateCO } = Reservation;
  const { FirstName, LastName } = GuestInfo;

  return `${Tag}-${RoomNumber}-${ReservationNumber}-${DateCI}-${DateCO}-${FirstName}-${LastName}`;
};

export async function POST(req) {
  console.log("Received POST request");

  let newRequest; // Definido para capturar o novo registro
  try {
    const body = await req.json(); // Ler o corpo da requisição
    
    // Extrair informações do JSON
    const { HotelInfo, Reservation, GuestInfo } = body[0];
    const hotelInfo = HotelInfo?.[0];
    const reservation = Reservation?.[0];
    const guestInfo = GuestInfo?.[0];

    // Validar que os dados necessários estão presentes
    if (!hotelInfo || !reservation || !guestInfo) {
      return NextResponse.json(
        { message: "Dados obrigatórios ausentes." },
        { status: 400 }
      );
    }

    // Gerar a chave única
    const uniqueKey = generateUniqueKey(hotelInfo, reservation, guestInfo);
    console.log("Generated uniqueKey:", uniqueKey);

    // Verificar se existe uma propriedade com o campo propertyTag igual ao valor de Tag
    const property = await prisma.properties.findFirst({
      where: { propertyTag: hotelInfo.Tag },
    });

    if (!property) {
      return NextResponse.json(
        { message: `Propriedade com Tag '${hotelInfo.Tag}' não encontrada.` },
        { status: 404 }
      );
    }

    // Verificar se já existe um registro com a mesma uniqueKey
    const existingRequest = await prisma.requestRecords.findFirst({
      where: { uniqueKey: uniqueKey },
    });

    if (existingRequest) {
      console.log("Statement com esta chave única já existe. Atualizando...");

      // Atualiza o registro existente com os novos dados, utilizando o `requestID` (chave primária)
      const updatedRequest = await prisma.requestRecords.update({
        where: { requestID: existingRequest.requestID }, // Usando o `requestID` como chave primária
        data: {
          requestBody: JSON.stringify(body), // Atualiza o corpo da requisição
          requestDateTime: new Date(), // Atualiza o timestamp da requisição
          responseStatus: "201", // Marque como sucesso (ou conforme necessário)
          responseBody: "", // Defina a resposta se necessário
        },
      });

      console.log("Statement atualizado com sucesso:", updatedRequest);

      return NextResponse.json(
        { message: "Statement atualizado com sucesso", data: updatedRequest },
        { status: 200 }
      );
    } else {
      // Criar um novo registro se não existir
      console.log("Statement não encontrado. Criando novo...");
      newRequest = await prisma.requestRecords.create({
        data: {
          requestBody: JSON.stringify(body), // Armazena o corpo completo como JSON
          requestType: "POST",
          requestDateTime: new Date(),
          responseStatus: "201",
          responseBody: "",
          propertyID: property.propertyID, // Usar o propertyID encontrado
          seen: false,
          uniqueKey: uniqueKey, // Armazenar a chave única
        },
      });

      console.log("Novo statement criado:", newRequest);

      return NextResponse.json(
        { message: "Novo statement criado com sucesso", data: newRequest },
        { status: 201 }
      );
    }
  } catch (error) {
    console.error("Erro ao gravar os dados:", error.message);

    // Evitar criar ou registrar um erro na base de dados
    return NextResponse.json(
      { message: "Erro ao processar os dados", error: error.message },
      { status: 500 }
    );
  }
}

// Função para lidar com requisições GET
export async function GET() {
  try {
    const allRequests = await prisma.requestRecords.findMany();
    console.log("GET request: Retrieved all requests:", allRequests);
    return NextResponse.json({ data: allRequests }, { status: 200 });
  } catch (error) {
    console.error("Erro ao buscar os dados:", error);
    return NextResponse.json({ message: "Erro ao buscar os dados" }, { status: 500 });
  }
}