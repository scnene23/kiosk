import { NextResponse } from 'next/server';
import prisma from "@/lib/db"; // Certifique-se de que o Prisma está configurado

export async function GET(request, { params }) {
  const { id } = await params; // Extraímos o parâmetro `id` da URL

  try {
    // Verifica se o `id` foi fornecido
    if (!id) {
      return new NextResponse(
        JSON.stringify({ error: "O parâmetro ID é obrigatório." }),
        { status: 400 }
      );
    }

    // Busca registros com o `propertyID` igual ao `id` fornecido
    const response = await prisma.requestRecordsArrivals.findMany({
      where: {
        propertyID: parseInt(id),
      },
    });

    // Retorna os registros encontrados
    return new NextResponse(JSON.stringify({ response }), { status: 200 });
  } catch (error) {
    console.error("Erro ao buscar registros:", error);
    return new NextResponse(
      JSON.stringify({ error: "Erro ao buscar registros" }),
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
