import { jsPDF } from 'jspdf';

import en from "../../../public/locales/english/common.json";
import pt from "../../../public/locales/portuguesPortugal/common.json";
import es from "../../../public/locales/espanol/common.json";

const translations = { en, pt, es };

// Função para carregar imagem do Cloudinary e convertê-la para base64
const loadImageAsBase64 = async (imagePath) => {
    try {
        const response = await fetch(imagePath);
        if (!response.ok) throw new Error('Erro ao carregar imagem');
        const blob = await response.blob();
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result); // Resultado é a string base64
            reader.readAsDataURL(blob);
        });
    } catch (error) {
        console.error('Erro ao carregar a imagem:', error);
        return null; // Retorna null se a imagem não for carregada
    }
};

export const generatePDFTemplate = async (reserva, signatureBase64) => {
    const { Locale } = reserva.Locale; 

    // A partir do locale, você pode acessar as traduções
    const t = translations[Locale] || translations["en"];

    const doc = new jsPDF();

    // Função utilitária para formatar datas
    const formatDate = (date) => {
        if (!date) return "";
        const datePart = date.split('T')[0];
        // Verifica se a data é uma das inválidas ('1900-01-01' ou '2050-12-31')
        return (datePart !== '1900-01-01' && datePart !== '2050-12-31') ? datePart : "";
    };

    // Defina a URL da imagem no Cloudinary
    const CLOUDINARY_BASE_URL = "https://res.cloudinary.com/dp6iart4f/image/upload/hotels/";  // Substitua SEU_CLOUD_NAME
    const logoPath = `${CLOUDINARY_BASE_URL}${reserva.PropertyID}.png`; // URL da imagem no Cloudinary

    // Converte a imagem do Cloudinary para base64
    const logoBase64 = await loadImageAsBase64(logoPath);

    // Tamanho da página (A4 padrão)
    const pageWidth = doc.internal.pageSize.width;

    // Tamanho da imagem
    const logoWidth = 60;
    const logoHeight = 30;

    // Calcular a posição X para centralizar a imagem
    const logoX = (pageWidth - logoWidth) / 2;

    // Adiciona o logo ao PDF (caso carregado com sucesso)
    if (logoBase64) {
        doc.addImage(logoBase64, 'PNG', logoX, 10, logoWidth, logoHeight); // Posição X, Y, largura, altura
    }

    // Ajuste o conteúdo para não sobrepor a imagem
    const contentStartY = logoBase64 ? 50 : 10;

    // Adiciona "Registration Form", local e data na mesma linha
    const location = reserva.HotelName || ''; // Local da propriedade
    const currentDate = new Date().toLocaleDateString(); // Data atual formatada

    const headerText = `${location}, Registration Form, ${currentDate}`;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);

    // Calcula a posição X para centralizar o texto no documento
    const textWidth = doc.getTextWidth(headerText);
    const headerX = (pageWidth - textWidth) / 2; // Centraliza horizontalmente

    doc.text(headerText, headerX, contentStartY); // Adiciona o texto na mesma linha

    // Move o início do próximo conteúdo (Guest Details)
    const guestDetailsStartY = contentStartY + 10;

    // Adiciona título e detalhes do hóspede
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Guest Details', 10, guestDetailsStartY);
    doc.setFont('helvetica', 'normal');

    // Retângulo com detalhes da reserva
    const guestRectX = 10;
    const guestRectY = guestDetailsStartY + 2;
    const guestRectWidth = 190;
    const guestRectHeight = 60;

    doc.setDrawColor(0);
    doc.rect(guestRectX, guestRectY, guestRectWidth, guestRectHeight, 'S');

    const guestColumn1X = guestRectX + 5;
    const guestColumn2X = guestRectX + guestRectWidth / 2 + 5;
    const guestTextY = guestRectY + 8;

    // Definindo as cores para as descrições e variáveis
    const grayColor = [105, 105, 105]; // Cor para os títulos (descrições)
    const blackColor = [0, 0, 0]; // Cor para os valores (variáveis)

    // Ajuste de espaçamento para evitar sobreposição
    const lineHeight = 8; // Espaçamento entre linhas

    // Definir o deslocamento adicional para valores
    const titleValueSpacing = 27; // Espaçamento entre título e valor

    // Ajuste o texto das descrições (títulos) para a cor cinza
    doc.setTextColor(...grayColor); // Define a cor do texto para cinza
    doc.text(t.registrationForm.name, guestColumn1X, guestTextY);
    doc.text(t.registrationForm.address, guestColumn1X, guestTextY + lineHeight);
    doc.text(t.registrationForm.country, guestColumn1X, guestTextY + 2 * lineHeight);
    doc.text(t.registrationForm.idTypeDoc, guestColumn2X, guestTextY + 2 * lineHeight);
    doc.text(t.registrationForm.email, guestColumn1X, guestTextY + 3 * lineHeight);
    doc.text(t.registrationForm.docNo, guestColumn2X, guestTextY + 3 * lineHeight);
    doc.text(t.registrationForm.phone, guestColumn1X, guestTextY + 4 * lineHeight);
    doc.text(t.registrationForm.expDate, guestColumn2X, guestTextY + 4 * lineHeight);
    doc.text(t.registrationForm.birthDate, guestColumn1X, guestTextY + 5 * lineHeight);
    doc.text(t.registrationForm.countryIssue, guestColumn2X, guestTextY + 5 * lineHeight);
    doc.text(t.registrationForm.birthPlace, guestColumn1X, guestTextY + 6 * lineHeight);
    doc.text(t.registrationForm.vatNo, guestColumn2X, guestTextY + 6 * lineHeight);

    // Agora, definimos a cor preta para as variáveis (valores)
    doc.setTextColor(...blackColor); // Define a cor do texto para preto
    doc.setFontSize(10);
    doc.text(`${reserva.LastName || ""}, ${reserva.FirstName || ""}`, guestColumn1X + titleValueSpacing, guestTextY);
    doc.text(`${reserva.Street || ""}`, guestColumn1X + titleValueSpacing, guestTextY + lineHeight);
    doc.text(`${reserva.Country || ""}`, guestColumn1X + titleValueSpacing, guestTextY + 2 * lineHeight);
    doc.text(`${reserva.IdDoc || ""}`, guestColumn2X + titleValueSpacing, guestTextY + 2 * lineHeight);
    doc.text(`${reserva.PersonalEmail || ""}`, guestColumn1X + titleValueSpacing, guestTextY + 3 * lineHeight);
    doc.text(`${reserva.NrDoc || ""}`, guestColumn2X + titleValueSpacing, guestTextY + 3 * lineHeight);
    doc.text(`${reserva.Phone || ""}`, guestColumn1X + titleValueSpacing, guestTextY + 4 * lineHeight);
    doc.text(`${formatDate(reserva.ExpDate) || ""}`, guestColumn2X + titleValueSpacing, guestTextY + 4 * lineHeight);
    doc.text(`${formatDate(reserva.DateOfBirth) || ""}`, guestColumn1X + titleValueSpacing, guestTextY + 5 * lineHeight);
    doc.text(`${reserva.Issue || ""}`, guestColumn2X + titleValueSpacing, guestTextY + 5 * lineHeight);
    doc.text(`${reserva.CountryOfBirth || ""}`, guestColumn1X + titleValueSpacing, guestTextY + 6 * lineHeight);
    doc.text(`${reserva.VatNo || ""}`, guestColumn2X + titleValueSpacing, guestTextY + 6 * lineHeight);
    doc.setFontSize(12);

    // Adiciona título e detalhes da estadia
    doc.setFont('helvetica', 'bold');
    const stayDetailsStartY = guestRectY + guestRectHeight + 10;
    doc.text(t.registrationForm.stayDetails, 10, stayDetailsStartY);
    doc.setFont('helvetica', 'normal');

    const stayguestRectX = 10;
    const stayguestRectY = stayDetailsStartY + 2;
    const stayguestRectWidth = 190;
    const stayguestRectHeight = 40;

    doc.rect(stayguestRectX, stayguestRectY, stayguestRectWidth, stayguestRectHeight, 'S');

    const stayColumn1X = stayguestRectX + 5;
    const stayColumn2X = stayguestRectX + stayguestRectWidth / 2 + 5;
    const stayTextY = stayguestRectY + 8;

    // Ajuste o texto das descrições (títulos) para a cor cinza
    doc.setTextColor(...grayColor); // Define a cor do texto para cinza
    doc.text(t.registrationForm.reservationNo, stayColumn1X, stayTextY);
    doc.text(t.registrationForm.room, stayColumn2X, stayTextY);
    doc.text(t.registrationForm.arrivalDate, stayColumn1X, stayTextY + lineHeight);
    doc.text(t.registrationForm.departureDate, stayColumn2X, stayTextY + lineHeight);
    doc.text(t.registrationForm.paxNo, stayColumn1X, stayTextY + 2 * lineHeight);
    doc.text(t.registrationForm.rateCode, stayColumn2X, stayTextY + 2 * lineHeight);
    doc.text(t.registrationForm.notes, stayColumn1X, stayTextY + 3 * lineHeight);

    // Agora, definimos a cor preta para as variáveis (valores)
    doc.setTextColor(...blackColor); // Define a cor do texto para preto
    doc.setFontSize(10);
    doc.text(`${reserva.ResNo || ""}`, stayColumn1X + 40, stayTextY); // Aproxima a variável do título
    doc.text(`${reserva.Room || ""}`, stayColumn2X + 40, stayTextY);
    doc.text(`${reserva.DateCI || ""}`, stayColumn1X + 40, stayTextY + lineHeight);
    doc.text(`${reserva.DateCO || ""}`, stayColumn2X + 40, stayTextY + lineHeight);
    doc.text(`${reserva.Adults || ""} / ${reserva.Childs || "0"}`, stayColumn1X + 40, stayTextY + 2 * lineHeight);
    doc.text(`${reserva.RateCode || ""}`, stayColumn2X + 40, stayTextY + 2 * lineHeight);
    doc.text(`${reserva.Notes || ""}`, stayColumn1X + 40, stayTextY + 3 * lineHeight, { maxWidth: stayguestRectWidth - 50 });
    doc.setFontSize(12);

    // Adiciona título e detalhes da estadia
    doc.setFont('helvetica', 'bold');
    const termsStartY = stayguestRectY + stayguestRectHeight + 10;
    doc.text('Hotel GDPR', 10, termsStartY);
    doc.setFont('helvetica', 'normal');

    // Retângulo para termos
    const termsRectX = 10;
    const termsRectY = termsStartY + 2;
    const termsRectWidth = 190;
    const termsRectHeight = 40; // Ajustado para acomodar checkbox e textos

    doc.rect(termsRectX, termsRectY, termsRectWidth, termsRectHeight, 'S');

    // Checkbox e texto "Eu aceito", posicionados no topo interno do retângulo
    const checkboxX = termsRectX + 5; // Um pouco deslocado da borda esquerda
    const checkboxY = termsRectY + 4; // Espaço superior no retângulo
    const checkboxSize = 5;

    // Desenha a checkbox
    doc.rect(checkboxX, checkboxY, checkboxSize, checkboxSize, 'S'); // Desenha o quadrado da checkbox

    // Verifica se ProtectionPolicy é true para adicionar o "X" na checkbox
    if (reserva.ProtectionPolicy) {
        doc.text('X', checkboxX + 1.5, checkboxY + checkboxSize - 1); // Adiciona "X" centralizado na checkbox
    }

    // Texto ao lado da checkbox
    doc.text(t.registrationForm.terms, checkboxX + checkboxSize + 5, checkboxY + checkboxSize - 1);

    // Colunas e textos dentro do retângulo (abaixo da checkbox)
    const termsColumn1X = termsRectX + 5; // Margem interna do retângulo
    const termsTextY = checkboxY + 12; // Começa logo abaixo da checkbox

    // Definir o tamanho da fonte menor apenas para o texto de justificação
    doc.setFontSize(9); // Ajuste o tamanho da fonte para ser menor
    doc.setFont('helvetica', 'normal');

    // Texto justificado dentro do retângulo
    const justificationText = `
    ${reserva.HotelTermsEN}
    `;

    doc.text(justificationText, termsColumn1X, termsTextY, { maxWidth: termsRectWidth - 10 });

    // Se precisar de voltar ao tamanho de fonte padrão para outros textos, faça assim:
    doc.setFontSize(12); // Retorna ao tamanho normal da fonte
    // Adiciona a assinatura (se disponível)
    const signatureStartY = termsStartY + termsRectHeight + 10; // Ajuste a posição Y da assinatura
    doc.setFont('helvetica', 'bold');
    doc.text(t.registrationForm.signature, 10, signatureStartY);
    doc.setFont('helvetica', 'normal');

    // Adiciona a imagem da assinatura se disponível
    if (signatureBase64) {
        // Calcular a posição X para centralizar a assinatura
        const signatureWidth = 90; // Largura da assinatura
        const signatureX = (pageWidth - signatureWidth) / 2; // Centraliza a assinatura

        // Posiciona a imagem da assinatura
        doc.addImage(signatureBase64, 'PNG', signatureX, signatureStartY + 10, signatureWidth, 10);
    }

    // Centraliza a linha após a assinatura
    const lineWidth = 150; // Largura da linha
    const lineStartX = (pageWidth - lineWidth) / 2; // Calcula a posição X da linha para centralizá-la
    doc.line(lineStartX, signatureStartY + 22, lineStartX + lineWidth, signatureStartY + 22); // Linha centralizada

    // Adiciona "Guest Sign" abaixo da linha e centralizado
    doc.setFontSize(9); // Reduz o tamanho da fonte para "Guest Sign"
    const guestSignText = "(Guest Sign)";
    const guestSignWidth = doc.getTextWidth(guestSignText); // Largura do texto "Guest Sign"
    const guestSignX = (pageWidth - guestSignWidth) / 2; // Centraliza o texto

    // Adiciona "Guest Sign" abaixo da linha e centralizado
    doc.text(guestSignText, guestSignX, signatureStartY + 27); // Ajuste o valor do Y para posicionar abaixo da linha

    // Informações do rodapé
    const footerLines = [
        `${reserva.HotelName}`,
        `${reserva.HotelPhone}   ${t.registrationForm.callInfo} ${reserva.HotelEmail}`,
        `${reserva.HotelAddress} ${reserva.HotelPostalCode}, SA   NIF - ${reserva.HotelNIF} RNET – ${reserva.HotelRNET}`
    ];

    // Configurações de estilo do rodapé
    doc.setFontSize(8); // Tamanho da fonte pequeno para o rodapé
    doc.setFont('helvetica', 'italic'); // Estilo da fonte itálico

    // Ajustar para ficar mais próximo do final da página
    const footerYStart = doc.internal.pageSize.height - 20; // Posição inicial do rodapé, mais abaixo
    const footerLineSpacing = 5; // Espaçamento entre linhas

    // Adiciona cada linha do rodapé
    footerLines.forEach((line, index) => {
        const lineWidth = doc.getTextWidth(line);
        const lineX = (pageWidth - lineWidth) / 2; // Centraliza cada linha
        const lineY = footerYStart + index * footerLineSpacing; // Calcula a posição Y com espaçamento
        doc.text(line, lineX, lineY);
    });


    return doc; // Retorna o documento PDF gerado

};