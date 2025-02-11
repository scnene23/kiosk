import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET(request, context) {
  const { id } = await context.params;

  try {
    const response = await prisma.properties.findMany({
      where: {
        propertyID: parseInt(id),
      },
    });

    // Verifique se a resposta está vazia
    if (response.length === 0) {
      return new NextResponse(JSON.stringify({ error: "Not found" }), {
        status: 404,
      });
    }

    return new NextResponse(JSON.stringify({ response }), { status: 200 });
  } catch (error) {
    console.error("Erro ao buscar dados:", error);
    return new NextResponse(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}

// Função PATCH para atualizar a propriedade
export async function PATCH(request, context) {
  const { id } = context.params;
  const {
      propertyName,
      propertyTag,
      propertyServer,
      propertyPort,
      mpehotel,
      hotelName,
      hotelTermsEN,
      hotelTermsPT,
      hotelTermsES,
      hotelPhone,
      hotelEmail,
      hotelAddress,
      hotelPostalCode,
      hotelRNET,
      hotelNIF,
      passeIni,
      pdfFilePath,
  } = await request.json();

  try {
      // Verifique se todos os campos obrigatórios foram fornecidos
      if (!propertyName || !propertyTag || !propertyServer) {
          return new NextResponse(
              JSON.stringify({ error: "All fields are required" }),
              { status: 400 }
          );
      }

      // Verifique se mpehotel e propertyPort são números inteiros
      const formattedMpehotel = parseInt(mpehotel, 10);
      const formattedPropertyPort = parseInt(propertyPort, 10);

      if (isNaN(formattedMpehotel) || isNaN(formattedPropertyPort)) {
          return new NextResponse(
              JSON.stringify({ error: "mpehotel and propertyPort must be valid integers" }),
              { status: 400 }
          );
      }

      // Atualize a propriedade no banco de dados
      const updatedProperty = await prisma.properties.update({
          where: {
              propertyID: parseInt(id),
          },
          data: {
              propertyName,
              propertyTag,
              propertyServer,
              propertyPort: formattedPropertyPort,
              mpehotel: formattedMpehotel,
              hotelName,
              hotelTermsEN,
              hotelTermsPT,
              hotelTermsES,
              hotelPhone,
              hotelEmail,
              hotelAddress,
              hotelPostalCode,
              hotelRNET,
              hotelNIF,
              passeIni,
              pdfFilePath,
          },
      });

      return new NextResponse(JSON.stringify({ updatedProperty }), { status: 200 });
  } catch (error) {
      console.error("Erro ao atualizar a propriedade:", error);
      return new NextResponse(
          JSON.stringify({ error: error.message || "Failed to update property" }),
          { status: 500 }
      );
  }
}
