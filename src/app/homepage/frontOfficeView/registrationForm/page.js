'use client'
import React, { useEffect, useState, useRef } from 'react';
import axios from "axios";
import InputFieldControlled from "@/components/input/page";
// import CountryAutocomplete from "@/components/autocompletes/country/page";
import { IoIosArrowForward } from "react-icons/io";
// import CancelPIN from "@/components/modals/pin/cancel/page";

import { generatePDFTemplate } from "@/components/pdfTemplate/page";
import './styles.css';
// import { FaPencilAlt } from "react-icons/fa";
import { GiCancel } from "react-icons/gi";
import SignaturePad from 'signature_pad';
import TermsConditionsForm from "@/components/terms&conditions/page";
import ProtectionPolicyForm from "@/components/protectionPolicy/page";
import EditRegistrationForm from "@/components/modals/arrivals/reservationForm/edit/page";
import ErrorRegistrationForm from "@/components/modals/arrivals/reservationForm/error/page";
import SuccessRegistrationForm from "@/components/modals/arrivals/reservationForm/success/page";
import LoadingBackdrop from "@/components/Loader/page";

import en from "../../../../../public/locales/english/common.json";
import pt from "../../../../../public/locales/portuguesPortugal/common.json";
import es from "../../../../../public/locales/espanol/common.json";

const translations = { en, pt, es };

import { MdSunny } from "react-icons/md";
import { FaMoon } from "react-icons/fa";

import pako from 'pako'; // Adicione pako para compressão gzip

export default function Page() {
    const [reserva, setReserva] = useState(null);
    const [guestInfo, setGuestInfo] = useState(null);
    const [address, setAddress] = useState(null);
    const [personalID, setPersonalID] = useState(null);
    const [contacts, setContacts] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [propertyID, setPropertyID] = useState(null);
    const [profileID, setProfileID] = useState(null);
    console.log(profileID);
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const [isErrorModalOpen, setIsErrorModalOpen] = useState(false); // Controle do modal de erro
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false); // Controle do modal de erro
    // Estados para armazenar as informações do hotel
    const [hotelName, setHotelName] = useState('');
    const [hotelTermsEN, setHotelTermsEN] = useState("");
    const [hotelTermsPT, setHotelTermsPT] = useState("");
    const [hotelTermsES, setHotelTermsES] = useState("");
    const [hotelTerms, setHotelTerms] = useState(""); // Estado dinâmico para exibição

    const [hotelNIF, setHotelNIF] = useState('');
    const [hotelPhone, setHotelPhone] = useState('');
    const [hotelEmail, setHotelEmail] = useState('');
    const [hotelAddress, setHotelAddress] = useState('');
    const [hotelPostalCode, setHotelPostalCode] = useState('');
    const [hotelRNET, setHotelRNET] = useState('');

    const canvasRef = useRef(null);
    const signaturePadRef = useRef(null);

    const [locale, setLocale] = useState("pt");

    const handleLanguageChange = (lang) => {
        setLocale(lang);
        setActiveFlag(lang === "en" ? "usa-uk" : lang === "pt" ? "pt" : "es");
        localStorage.setItem("language", lang);

        // Atualiza os termos do hotel conforme o idioma selecionado
        setHotelTerms(
            lang === "en" ? hotelTermsEN :
                lang === "pt" ? hotelTermsPT :
                    hotelTermsES
        );
    };

    useEffect(() => {
        // Carregar o idioma do localStorage
        const storedLanguage = localStorage.getItem("language");
        if (storedLanguage) {
            setLocale(storedLanguage);
            setActiveFlag(storedLanguage === "en" ? "usa-uk" : storedLanguage === "pt" ? "pt" : "es");
        }
    }, []);

    // Carregar as traduções com base no idioma atual
    const t = translations[locale] || translations["pt"]; // fallback para "pt"

    // const searchParams = useSearchParams();  // Usando useSearchParams diretamente
    // const requestID = searchParams.get("requestID");  // Acessando parâmetro de URL
    // const resNo = searchParams.get("resNo");  // Acessando o parâmetro resNo

    console.log(isLoading);

    useEffect(() => {
        const preventBackNavigation = () => {
            // Impede a navegação para trás
            window.history.pushState(null, null, window.location.href);
        };

        // Adiciona evento para interceptar o botão "voltar"
        window.addEventListener("popstate", preventBackNavigation);

        // Configura o estado inicial do histórico
        preventBackNavigation();

        return () => {
            // Remove o evento ao desmontar o componente
            window.removeEventListener("popstate", preventBackNavigation);
        };
    }, []);

    const calculateNights = (start, end) => {
        if (!start || !end) return '-';
        const startDate = new Date(start);
        const endDate = new Date(end);
        const diffTime = endDate - startDate;
        const diffDays = diffTime / (1000 * 60 * 60 * 24);
        return diffDays > 0 ? diffDays : '-';
    };

    const nights = reserva && reserva.DateCI && reserva.DateCO
        ? calculateNights(reserva.DateCI, reserva.DateCO)
        : '-';

    //botoes que mudam de cor
    const halfInputStyle = "w-10 h-4 outline-none my-2 text-sm !text-textLabelColor bg-cardColor input-field"
    const inputStyle = "w-32 h-4 outline-none my-2 text-sm !text-textLabelColor bg-cardColor input-field"
    const inputStyleFull = "w-full h-4 outline-none my-2 text-sm !text-textLabelColor bg-cardColor input-field"
    const inputStyleFullWithLine = "w-full border-b-2 border-gray-200 px-1 h-4 outline-none my-2 text-sm !text-textLabelColor bg-cardColor input-field"

    useEffect(() => {
        const queryParams = new URLSearchParams(window.location.search);
        const requestID = queryParams.get("requestID");
        const resNo = queryParams.get("resNo");
        const propertyID = queryParams.get("propertyID");
        const profileID = queryParams.get("profileID");

        setPropertyID(propertyID);
        setProfileID(profileID);
        const fetchPropertyDetails = async () => {
            if (!propertyID) {
                console.warn("Parâmetro ausente na URL: propertyID");
                return;
            }

            try {
                const response = await axios.get(`/api/properties/${propertyID}`);
                console.log("Resposta da API para as propriedades:", response);

                const property = response.data.response[0];
                if (property) {
                    const hotelName = property.hotelName;
                    const hotelTermsEN = property.hotelTermsEN;
                    const hotelTermsPT = property.hotelTermsPT;
                    const hotelTermsES = property.hotelTermsES;
                    const hotelNIF = property.hotelNIF;
                    const hotelPhone = property.hotelPhone;
                    const hotelEmail = property.hotelEmail;
                    const hotelAddress = property.hotelAddress;
                    const hotelPostalCode = property.hotelPostalCode;
                    const hotelRNET = property.hotelRNET;

                    console.log("Hotel Information:", {
                        hotelName,
                        hotelTermsEN,
                        hotelTermsPT,
                        hotelTermsES,
                        hotelNIF,
                        hotelPhone,
                        hotelEmail,
                        hotelAddress,
                        hotelPostalCode,
                        hotelRNET
                    });

                    // Atualizando o estado
                    setHotelName(hotelName);
                    setHotelTermsEN(hotelTermsEN);
                    setHotelTermsPT(hotelTermsPT);
                    setHotelTermsES(hotelTermsES);
                    setHotelNIF(hotelNIF);
                    setHotelPhone(hotelPhone);
                    setHotelEmail(hotelEmail);
                    setHotelAddress(hotelAddress);
                    setHotelPostalCode(hotelPostalCode);
                    setHotelRNET(hotelRNET);
                } else {
                    console.warn(`Nenhuma propriedade encontrada com propertyID: ${propertyID}`);
                }
            } catch (error) {
                console.error("Erro ao buscar detalhes da propriedade:", error.message);
            }
        };


        const fetchReservaByRequestID = async () => {
            if (!requestID || !resNo) {
                console.warn("Parâmetros ausentes na URL: requestID ou resNo");
                return;
            }

            setIsLoading(true);
            try {
                const response = await axios.get(`/api/reservations/checkins/registrationForm/${requestID}`);
                console.log("Resposta da API para o requestID:", response);

                if (response.data?.response?.length > 0) {
                    const requestBody = response.data.response[0].responseBody;
                    const reservas = JSON.parse(requestBody);
                    console.log("Reservas encontradas no responseBody:", reservas);

                    const reservaSelecionada = reservas.find(r =>
                        r.ReservationInfo.some(info => `${info.ResNo}` === `${resNo}`)
                    );

                    if (reservaSelecionada) {
                        console.log("Reserva encontrada:", reservaSelecionada);

                        // Acessando informações diretamente do primeiro índice de GuestInfo
                        const guestInfo = reservaSelecionada.GuestInfo?.[0]?.GuestDetails?.[0] || null;
                        const address = reservaSelecionada.GuestInfo?.[0]?.Address?.[0] || null;
                        const personalID = reservaSelecionada.GuestInfo?.[0]?.PersonalID?.[0] || null;
                        const contacts = reservaSelecionada.GuestInfo?.[0]?.Contacts?.[0] || null;

                        console.log("Informações do hóspede:", guestInfo);
                        console.log("Informações do endereço:", address);
                        console.log("Informações do PersonalID:", personalID);
                        console.log("Informações de contato:", contacts);

                        setReserva(reservaSelecionada.ReservationInfo.find(info => `${info.ResNo}` === `${resNo}`));
                        setGuestInfo(guestInfo);
                        setAddress(address);
                        setPersonalID(personalID);
                        setContacts(contacts);

                        // Verifica se o e-mail termina com "@guest.booking.com"
                        if (contacts?.Email?.endsWith('@guest.booking.com')) {
                            setErrorMessage('Email inválido. O email não pode terminar em guest.booking.com');
                        } else {
                            setErrorMessage(''); // Limpa a mensagem de erro se o e-mail for válido
                        }
                    } else {
                        console.warn(`Nenhuma reserva encontrada com ResNo: ${resNo}`);
                    }
                } else {
                    console.warn(`Nenhuma reserva encontrada para o requestID: ${requestID}`);
                }
            } catch (error) {
                console.error("Erro ao buscar reserva específica:", error.message);
            } finally {
                setIsLoading(false);
            }
        };

        if (requestID && resNo && propertyID) {
            fetchReservaByRequestID();
            fetchPropertyDetails();
        }
    }, []);


    const initializeSignaturePad = () => {
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();

        // Ajustar o tamanho do canvas para corresponder ao tamanho visível
        canvas.width = rect.width * window.devicePixelRatio;
        canvas.height = rect.height * window.devicePixelRatio;

        // Escalar o contexto para alinhar com a densidade de pixels
        const context = canvas.getContext('2d');
        context.scale(window.devicePixelRatio, window.devicePixelRatio);

        // Reinicializar o SignaturePad com o novo tamanho
        if (signaturePadRef.current) {
            signaturePadRef.current.clear(); // Limpa antes de recriar
        }
        signaturePadRef.current = new SignaturePad(canvas);
    };

    // Inicializar o SignaturePad
    // Inicializar o SignaturePad
    useEffect(() => {
        const initializeOrResizeCanvas = () => {
            if (canvasRef.current) {
                initializeSignaturePad();
            }
        };

        if (!isLoading) {
            initializeOrResizeCanvas(); // Inicializa o SignaturePad após o carregamento completo
        }

        // Atualizar o canvas ao redimensionar a janela
        const handleResize = () => {
            initializeOrResizeCanvas();
        };

        window.addEventListener('resize', handleResize);

        // Cleanup do event listener ao desmontar o componente
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, [isLoading]); // Adiciona `isLoading` como dependência


    const [dropdownOpen, setDropdownOpen] = useState(false);
    // Estado para controlar a bandeira ativa
    const [activeFlag, setActiveFlag] = useState(locale === "en" ? "usa-uk" : locale === "pt" ? "pt" : "es"); // Bandeira padrão

    const [termsAccepted, setTermsAccepted] = useState(true); // "Agree" por padrão
    const [policyAccepted, setPolicyAccepted] = useState(true); // "Agree" por padrão
    const [error] = useState('');

    // Verifica se o canvas está vazio
    const isCanvasEmpty = () => {
        const canvas = canvasRef.current;
        if (!canvas) return true;

        const ctx = canvas.getContext('2d');
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);

        // Verifica se todos os pixels são transparentes
        return imgData.data.every((value, index) => index % 4 !== 3 || value === 0);
    };

    const [signatureDataUrl] = useState(null); // Para armazenar a base64 da assinatura

    console.log(signatureDataUrl);

    const handleOkClick = async () => {
        let errors = [];

        // Validações de formulário
        if (isCanvasEmpty()) {
            errors.push("Please fill in all required fields to submit the form.");
        }
        if (email.endsWith("@guest.booking.com")) {
            errors.push("The e-mail cannot end with @guest.booking.com.");
        }
        if (errors.length > 0) {
            setErrorMessage(errors.join("\n"));
            setIsErrorModalOpen(true);
            return;
        }

        setErrorMessage('');
        setIsErrorModalOpen(false);

        // Captura a assinatura e gera o PDF
        try {
            const canvas = canvasRef.current;
            if (!canvas) return;

            const signatureBase64 = canvas.toDataURL().split(',')[1]; // Remove prefixo "data:..."

            const reservaDetails = {
                // Detalhes da reserva
                PropertyID: propertyID,
                ResNo: reserva.ResNo,
                Room: reserva.Room,
                DateCI: reserva.DateCI,
                DateCO: reserva.DateCO,
                Adults: reserva.Adults,
                Childs: reserva.Childs,
                LastName: guestInfo.LastName,
                FirstName: guestInfo.FirstName,
                Street: address.Street,
                Country: address.Country,
                IdDoc: personalID.IDDoc,
                NrDoc: personalID.NrDoc,
                Phone: contacts.PhoneNumber,
                ExpDate: personalID.ExpDate,
                DateOfBirth: personalID.DateOfBirth,
                Issue: personalID.Issue,
                CountryOfBirth: personalID.CountryOfBirth,
                VatNo: contacts.VatNo,
                PersonalEmail: contacts.Email,
                ProtectionPolicy: policyAccepted,
                HotelName: hotelName,
                HotelTermsEN: hotelTerms,
                HotelPhone: hotelPhone,
                HotelEmail: hotelEmail,
                HotelAddress: hotelAddress,
                HotelPostalCode: hotelPostalCode,
                HotelNIF: hotelNIF,
                HotelRNET: hotelRNET,
                RateCode: reserva.RateCode,
                Locale: locale, // passa a variavel de idioma
            };

            // Geração do PDF
            const pdfDoc = await generatePDFTemplate(reservaDetails, `data:image/png;base64,${signatureBase64}`);
            const pdfBlob = pdfDoc.output('blob'); // Gerar o PDF como um Blob
            // Compressão do PDF com pako (gzip)
            const pdfArrayBuffer = await pdfBlob.arrayBuffer();
            const compressedPdf = pako.gzip(new Uint8Array(pdfArrayBuffer)); // Comprime usando gzip

            // Codificação do PDF comprimido em Base64
            const pdfBase64 = btoa(String.fromCharCode(...compressedPdf));
            console.log(pdfBase64);
            // Envia os dados via Axios
            const response = await axios.post(
                "/api/reservations/checkins/registration_form_base64",
                {
                    PropertyID: propertyID,
                    pdfBase64: pdfBase64, // Envia o PDF comprimido em Base64
                    fileName: `RegistrationForm_ResNo_${reserva.ResNo}_TC_${termsAccepted ? 0 : 1}_DPP_${policyAccepted ? 0 : 1}_ProfileID_${guestInfo.ProfileID}.pdf`,
                    ResNo: reserva.ResNo,
                    ProfileID: guestInfo.ProfileID,
                }
            );

            console.log('Resposta da API:', response.data);
            setSuccessMessage("Registration sent successfully");
            setIsSuccessModalOpen(true);
        } catch (error) {
            console.error('Erro ao gerar ou enviar o PDF:', error);
            errors.push("There was an issue generating or sending the form. Please contact support.");
            setErrorMessage(errors.join("\n"));
            setIsErrorModalOpen(true);
        }
    };

    const clearSignature = () => {
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    };

    const [isDarkMode, setIsDarkMode] = useState(false);

    // Alterna entre os modos
    const toggleTheme = () => {
        setIsDarkMode(!isDarkMode);
        if (!isDarkMode) {
            document.documentElement.classList.add("dark"); // Adiciona classe "dark"
        } else {
            document.documentElement.classList.remove("dark"); // Remove classe "dark"
        }
    };

    const [email, setEmail] = useState("");
    const [vatNo, setVatNo] = useState(""); // Novo estado para VAT No.
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalField, setModalField] = useState(null); // Para identificar o campo em edição
    console.log(setModalField);
    const [initialEmail, setInitialEmail] = useState("");
    const [initialVatNo, setInitialVatNo] = useState("");

    useEffect(() => {
        if (contacts?.Email && initialEmail === "") {
            setEmail(contacts.Email);
            setInitialEmail(contacts.Email); // Armazena o valor inicial
        }
        if (contacts?.VatNo && initialVatNo === "") {
            setVatNo(contacts.VatNo);
            setInitialVatNo(contacts.VatNo); // Armazena o valor inicial
        }
    }, [contacts, initialEmail, initialVatNo]);


    const handleModalSave = (newValue) => {
        // Verifica qual campo está sendo editado
        if (modalField === "Email") {
            setEmail(newValue); // Atualiza o estado de email
        } else if (modalField === "VatNo") {
            setVatNo(newValue); // Atualiza o estado de VAT No
        }

        // Fechar o modal após salvar
        setIsModalOpen(false);
    };

    useEffect(() => {
        if (locale === "en") {
            setHotelTerms(hotelTermsEN);
        } else if (locale === "pt") {
            setHotelTerms(hotelTermsPT);
        } else {
            setHotelTerms(hotelTermsES);
        }
    }, [locale, hotelTermsEN, hotelTermsPT, hotelTermsES]);

    return (
        <div className='bg-background main-page min-h-screen'>
            {/* Exibe o loader enquanto isLoading for verdadeiro */}
            {isLoading ? (
                <LoadingBackdrop open={true} />
            ) : (
                <>
                    <div className="pt-2 px-4 flex justify-between flag-position items-center">
                        <div className='text-textPrimaryColor'>{hotelName}</div>
                        <div className='text-textPrimaryColor'>
                            <p>{t.frontOffice.registrationForm.title}</p>
                        </div>
<div className="flex flex-row gap-8 items-center language-row">
                        <div
          className={`flag ${activeFlag === 'pt' ? 'active' : 'inactive'}`}
          onClick={() => handleLanguageChange('pt')}
        >
          <img
            src="/flags/pt.png"
            alt="portuguese"
            className="w-8 h-8 object-cover rounded-full" // Tornar a bandeira circular
          />
        </div>
        <div
          className={`flag ${activeFlag === 'es' ? 'active' : 'inactive'}`}
          onClick={() => handleLanguageChange('es')}
        >
          <img
            src="/flags/sp.png"
            alt="spanish"
            className="w-8 h-8 object-cover rounded-full" // Tornar a bandeira circular
          />
        </div>
        <div
          className={`flag ${activeFlag === 'usa-uk' ? 'active' : 'inactive'}`}
          onClick={() => handleLanguageChange('en')}
        >
          <img
            src="/flags/uk.png"
            alt="english"
            className="w-8 h-8 object-cover rounded-full" // Tornar a bandeira circular
          />
        </div>
      </div>

                        {/* Combo Box with Flag Images */}
                        <div className="ml-4 relative language-combobox">
                            <div
                                className="flex items-center cursor-pointer"
                                onClick={() => setDropdownOpen(!dropdownOpen)}
                            >
                                <img
                                    src={`/flags/${activeFlag === 'usa-uk' ? 'uk.png' : activeFlag === 'pt' ? 'pt.png' : 'sp.png'}`}
                                    alt={activeFlag}
                                    className="w-8 h-8 object-cover rounded-full" // Tornar a bandeira circular
                                />
                            </div>
                            {dropdownOpen && (
                                <div className="absolute mt-2 bg-white border rounded shadow-lg">
                                    <div
                                        className="flex items-center p-2 cursor-pointer"
                                        onClick={() => handleLanguageChange('pt')}
                                    >
                                        <img
                                            src="/flags/pt.png"
                                            alt="portuguese"
                                            className="w-8 h-8 object-cover rounded-full"
                                        />
                                        <span className="ml-2">Portuguese</span>
                                    </div>
                                    <div
                                        className="flex items-center p-2 cursor-pointer"
                                        onClick={() => handleLanguageChange('es')}
                                    >
                                        <img
                                            src="/flags/es.png"
                                            alt="spanish"
                                            className="w-8 h-8 object-cover rounded-full"
                                        />
                                        <span className="ml-2">Spanish</span>
                                    </div>
                                    <div
                                        className="flex items-center p-2 cursor-pointer"
                                        onClick={() => handleLanguageChange('en')}
                                    >
                                        <img
                                            src="/flags/uk.png"
                                            alt="english"
                                            className="w-8 h-8 object-cover rounded-full"
                                        />
                                        <span className="ml-2">English</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>



                    {/* Divisão de tela  */}
                    <div className='flex flex-row mt-1 screen-division'>
                        {reserva && guestInfo && address && personalID && contacts && (
                            <div className='w-1/2 ml-4 mr-4 half-screen'>
                                <div className='flex flex-row details-on-screen'>
                                    {/** Dados de Morada */}
                                    <div className='w-1/2 bg-cardColor py-2 px-2 rounded-lg mt-1 mr-1 details-on-screen-card'>
                                        <div className='flex flex-row items-center'>
                                            <h3 className='text-[#f7ba83]'>{t.frontOffice.registrationForm.stayDetails}</h3>
                                            <IoIosArrowForward size={20} color='#f7ba83' />
                                            <h3 className='text-[#f7ba83]'>{t.frontOffice.registrationForm.resNo}: {reserva.ResNo}</h3>
                                        </div>
                                        {/** Info do quarto */}
                                        <div className='flex flex-row gap-5 mt-2'>
                                            <InputFieldControlled
                                                type={"text"}
                                                id={"de"}
                                                name={"De"}
                                                label={t.frontOffice.registrationForm.room}
                                                ariaLabel={"De:"}
                                                value={reserva.Room}
                                                style={inputStyle}
                                            />
                                            <InputFieldControlled
                                                type={"text"}
                                                id={"roomType"}
                                                name={"roomType"}
                                                label={t.frontOffice.registrationForm.roomType}
                                                ariaLabel={"Room Type:"}
                                                value={reserva.RoomType}
                                                style={inputStyleFull}
                                            />
                                            <div className='flex flex-row gap-2'>
                                                <InputFieldControlled
                                                    type={"text"}
                                                    id={"Adults"}
                                                    name={"Adults"}
                                                    label={t.frontOffice.registrationForm.adults}
                                                    ariaLabel={"Adults:"}
                                                    value={reserva.Adults}
                                                    style={`${halfInputStyle}`}
                                                />
                                                <InputFieldControlled
                                                    type={"text"}
                                                    id={"Childs"}
                                                    name={"Childs"}
                                                    label={t.frontOffice.registrationForm.childs}
                                                    ariaLabel={"Childs:"}
                                                    value={reserva.Childs}
                                                    style={halfInputStyle}
                                                />
                                            </div>
                                        </div>
                                        <div className='flex flex-row justify-start gap-5 mt-2'>
                                            <InputFieldControlled
                                                type={"date"}
                                                id={"Arrival"}
                                                name={"Arrival"}
                                                label={t.frontOffice.registrationForm.arrival}
                                                ariaLabel={"Arrival:"}
                                                value={reserva.DateCI}
                                                style={inputStyle}
                                            />
                                            <InputFieldControlled
                                                type={"text"}
                                                id={"Nights"}
                                                name={"Nights"}
                                                label={t.frontOffice.registrationForm.nights}
                                                ariaLabel={"Nights:"}
                                                value={nights}
                                                style={halfInputStyle}
                                            />
                                            <InputFieldControlled
                                                type={"date"}
                                                id={"Departure"}
                                                name={"Departure"}
                                                label={t.frontOffice.registrationForm.departure}
                                                ariaLabel={"Departure:"}
                                                value={reserva.DateCO}
                                                style={inputStyle}
                                            />
                                        </div>
                                    </div>

                                    {/** Dados de Info pessoal */}
                                    <div className='w-1/2 bg-cardColor py-2 px-2 rounded-lg mt-1 px-4 details-on-screen-card'>
                                        <p className='text-[#f7ba83] mb-1'>{t.frontOffice.registrationForm.priceInfo}</p>
                                        <div className='flex flex-row justify-between items-center gap-4 mt-2'>
                                            <InputFieldControlled
                                                type={"text"}
                                                id={"Rate Code"}
                                                name={"Rate Code"}
                                                label={t.frontOffice.registrationForm.rateCode}
                                                ariaLabel={"Rate Code:"}
                                                value={reserva.RateCode}
                                                style={inputStyleFull}
                                            />
                                            <InputFieldControlled
                                                type={"text"}
                                                id={"City Tax"}
                                                name={"City Tax"}
                                                label={t.frontOffice.registrationForm.cityTax}
                                                ariaLabel={"City Tax:"}
                                                value={reserva.CityTax}
                                                style={inputStyleFull}
                                            />
                                        </div>
                                        <div className='flex flex-row justify-between items-center gap-4 mt-2'>
                                            {reserva.toShow === 1 ? (
                                                <>
                                                    <InputFieldControlled
                                                        type={"text"}
                                                        id={"Price"}
                                                        name={"Price"}
                                                        label={t.frontOffice.registrationForm.priceNight}
                                                        ariaLabel={"Price:"}
                                                        value={reserva.Price === 0 ? "" : `${reserva.Price.toFixed(2)} €`} // Se Price for 0, exibe como vazio
                                                        style={inputStyleFull}
                                                    />

                                                    <InputFieldControlled
                                                        type={"text"}
                                                        id={"Total"}
                                                        name={"Total"}
                                                        label={t.frontOffice.registrationForm.total}
                                                        ariaLabel={"Total:"}
                                                        value={reserva.Total === 0 ? "" : `${reserva.Total.toFixed(2)} €`} // Se Total for 0, exibe como vazio
                                                        style={inputStyleFull}
                                                    />
                                                </>
                                            ) : (
                                                <>
                                                    <InputFieldControlled
                                                        type={"text"}
                                                        id={"Price"}
                                                        name={"Price"}
                                                        label={t.frontOffice.registrationForm.priceNight}
                                                        ariaLabel={"Price:"}
                                                        value={""} // Campos vazios
                                                        style={inputStyleFull}
                                                    />

                                                    <InputFieldControlled
                                                        type={"text"}
                                                        id={"Total"}
                                                        name={"Total"}
                                                        label={t.frontOffice.registrationForm.total}
                                                        ariaLabel={"Total:"}
                                                        value={""} // Campos vazios
                                                        style={inputStyleFull}
                                                    />
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/** Dados de cliente */}
                                <div className='bg-cardColor py-2 px-2 rounded-lg mt-1'>
                                    <p className='text-[#f7ba83] mb-1'>{t.frontOffice.registrationForm.guestDetails}</p>
                                    <div className='flex flex-row w-full mt-2'>
                                        <div className='mr-4'>
                                            <InputFieldControlled
                                                type={"text"}
                                                id={"Salutation"}
                                                name={"Salutation"}
                                                label={t.frontOffice.registrationForm.salutation}
                                                ariaLabel={"Salutation:"}
                                                value={guestInfo.Salution}
                                                style={"w-10 h-5 outline-none my-2 text-lg !text-textSecondaryLabelColor bg-cardColor"}
                                            />
                                        </div>
                                        <div className='w-full flex flex-row'>
                                            <div className='w-1/2'>
                                                <InputFieldControlled
                                                    type={"text"}
                                                    id={"Last Name"}
                                                    name={"Last Name"}
                                                    label={t.frontOffice.registrationForm.lastName}
                                                    ariaLabel={"Last Name:"}
                                                    value={guestInfo.LastName}
                                                    style={"w-72 h-5 outline-none my-2 text-lg !text-textSecondaryLabelColor bg-cardColor"}
                                                />
                                            </div>
                                            <div className='w-1/2 -ml-2'>
                                                <InputFieldControlled
                                                    type={"text"}
                                                    id={"First Name"}
                                                    name={"First Name"}
                                                    label={t.frontOffice.registrationForm.firstName}
                                                    ariaLabel={"First Name:"}
                                                    value={guestInfo.FirstName}
                                                    style={"w-full h-5 outline-none my-2 text-lg !text-textSecondaryLabelColor bg-cardColor"}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className='flex flex-row details-on-screen'>
                                    {/** Dados de Morada */}
                                    <div className='w-1/2 bg-cardColor py-2 px-2 rounded-lg mt-1 mr-1 details-on-screen-card'>
                                        <p className='text-[#f7ba83] mb-1'>{t.frontOffice.registrationForm.address}</p>
                                        <div className='flex flex-col w-full mt-2'>
                                            <InputFieldControlled
                                                type={"text"}
                                                id={"Country"}
                                                name={"Country"}
                                                label={t.frontOffice.registrationForm.country}
                                                ariaLabel={"Country:"}
                                                value={address.Country}
                                                style={inputStyleFull}
                                            />
                                            <InputFieldControlled
                                                type={"text"}
                                                id={"Street Address"}
                                                name={"Street Address"}
                                                label={t.frontOffice.registrationForm.streetAddress}
                                                ariaLabel={"Street Address:"}
                                                value={address.Street}
                                                style={inputStyleFull}
                                            />
                                            <InputFieldControlled
                                                type={"text"}
                                                id={"ZIP / Postal Code"}
                                                name={"ZIP / Postal Code"}
                                                label={t.frontOffice.registrationForm.zipPostalCode}
                                                ariaLabel={"ZIP / Postal Code:"}
                                                value={address.PostalCode}
                                                style={inputStyleFull}
                                            />
                                            <InputFieldControlled
                                                type={"text"}
                                                id={"City"}
                                                name={"City"}
                                                label={t.frontOffice.registrationForm.city}
                                                ariaLabel={"City:"}
                                                value={address.City}
                                                style={inputStyleFull}
                                            />
                                            <InputFieldControlled
                                                type={"text"}
                                                id={"State / Province / Region"}
                                                name={"State / Province / Region"}
                                                label={t.frontOffice.registrationForm.stateProvinceRegion}
                                                ariaLabel={"State / Province / Region:"}
                                                value={address.Region}
                                                style={inputStyleFull}
                                            />
                                        </div>
                                    </div>

                                    {/** Dados de Info pessoal */}
                                    <div className='w-1/2 bg-cardColor py-2 px-2 rounded-lg mt-1 px-4 details-on-screen-card'>
                                        <p className='text-[#f7ba83] mb-1'>{t.frontOffice.registrationForm.personalId}</p>
                                        <div className='flex flex-row justify-between gap-4 mt-4'>
                                            <InputFieldControlled
                                                type={
                                                    personalID.DateOfBirth && personalID.DateOfBirth.split('T')[0] !== '1900-01-01'
                                                        ? "date"
                                                        : "text"
                                                }
                                                id={"Date of Birth"}
                                                name={"Date of Birth"}
                                                label={t.frontOffice.registrationForm.dateOfBirth}
                                                ariaLabel={"Date of Birth:"}
                                                value={
                                                    personalID.DateOfBirth && personalID.DateOfBirth.split('T')[0] !== '1900-01-01'
                                                        ? personalID.DateOfBirth.split('T')[0]
                                                        : ""
                                                }
                                                style={inputStyleFullWithLine}
                                            />

                                            <InputFieldControlled
                                                type={"text"}
                                                id={"Country of Birth"}
                                                name={"Country of Birth"}
                                                label={t.frontOffice.registrationForm.countryOfBirth}
                                                ariaLabel={"Country of Birth:"}
                                                value={personalID.CountryOfBirth}
                                                style={`${inputStyleFullWithLine}`}
                                            />
                                        </div>
                                        {/* <CountryAutocomplete
                                    label={"Nacionality"}
                                    style={"w-full h-9 -mt-2"}
                                    onChange={(value) => handleSelect(value)}
                                /> */}
                                        <InputFieldControlled
                                            type={"text"}
                                            id={"Nationality"}
                                            name={"Nationality"}
                                            label={t.frontOffice.registrationForm.nationality}
                                            ariaLabel={"Nationality:"}
                                            value={personalID.Nationality}
                                            style={`${inputStyleFullWithLine}`}
                                        />
                                        <div className='flex flex-row justify-between items-center gap-4 mt-4'>
                                            {/* <CountryAutocomplete
                                        label={"ID Doc"}
                                        style={"w-32 h-20"}
                                        onChange={(value) => handleSelect(value)}
                                    /> */}
                                            <InputFieldControlled
                                                type={"text"}
                                                id={"ID Doc"}
                                                name={"ID Doc"}
                                                label={t.frontOffice.registrationForm.idDoc}
                                                ariaLabel={"ID Doc:"}
                                                value={personalID.IDDoc}
                                                style={`${inputStyleFullWithLine}`}
                                            />
                                            <InputFieldControlled
                                                type={"text"}
                                                id={"ID Doc Nr."}
                                                name={"ID Doc Nr."}
                                                label={t.frontOffice.registrationForm.idDocNumber}
                                                ariaLabel={"ID Doc Nr.:"}
                                                value={personalID.NrDoc}
                                                style={`${inputStyleFullWithLine}`}
                                            />
                                        </div>
                                        <div className='flex flex-row justify-between gap-4 mt-4'>
                                            <InputFieldControlled
                                                type={
                                                    personalID.ExpDate && personalID.ExpDate.split('T')[0] !== '2050-12-31'
                                                        ? "date"
                                                        : "text"
                                                }
                                                id={"Exp. Date"}
                                                name={"Exp. Date"}
                                                label={t.frontOffice.registrationForm.expDate}
                                                ariaLabel={"Exp. Date:"}
                                                value={
                                                    personalID.ExpDate && personalID.ExpDate.split('T')[0] !== '2050-12-31'
                                                        ? personalID.ExpDate.split('T')[0]
                                                        : ""
                                                }
                                                style={inputStyleFullWithLine}
                                            />
                                            <InputFieldControlled
                                                type={"text"}
                                                id={"Country issue"}
                                                name={"Country issue"}
                                                label={t.frontOffice.registrationForm.issue}
                                                ariaLabel={"Country issue:"}
                                                value={personalID.Issue}
                                                style={inputStyleFullWithLine}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-row details-on-screen">
                                    {/** Dados de contacto */}
                                    <div className="w-1/2 bg-cardColor py-2 px-2 rounded-lg mt-1 mr-1 details-on-screen-card">
                                        <div className="flex flex-row justify-between">
                                            <p className="text-[#f7ba83] mb-1">{t.frontOffice.registrationForm.contacts}</p>
                                            <div className="flex flex-row justify-end gap-4">
                                                {/* <FaPencilAlt
                                                    size={15}
                                                    color="orange"
                                                    onClick={() => {
                                                        setModalField("Email"); // Define o campo em edição
                                                        setIsModalOpen(true); // Abre o modal
                                                    }}
                                                /> */}
                                            </div>
                                        </div>

                                        <div className="mt-2">
                                            <div className="flex flex-row justify-between items-center w-full">
                                                <div className="flex-grow">
                                                    <InputFieldControlled
                                                        type="text"
                                                        id="Email"
                                                        name="Email"
                                                        label={t.frontOffice.registrationForm.personalEmail}
                                                        ariaLabel="Email:"
                                                        value={email}
                                                        style={inputStyleFull}
                                                        disabled
                                                    />
                                                </div>
                                            </div>

                                            <InputFieldControlled
                                                type="text"
                                                id="PhoneNumber"
                                                name="PhoneNumber"
                                                label={t.frontOffice.registrationForm.phoneNumber}
                                                ariaLabel="PhoneNumber:"
                                                value={contacts.PhoneNumber}
                                                style={inputStyleFull}
                                                disabled
                                            />
                                        </div>
                                    </div>

                                    {/** Dados de faturação */}
                                    <div className="w-1/2 bg-cardColor py-2 px-2 rounded-lg mt-1 details-on-screen-card">
                                        <div className="flex flex-row justify-between">
                                            <p className="text-[#f7ba83] mb-1">{t.frontOffice.registrationForm.invoiceData}</p>
                                            {/* <FaPencilAlt
                                                size={15}
                                                color={reserva.BlockedVatNO === 1 ? "gray" : "#FC9D25"}
                                                style={{ cursor: reserva.BlockedVatNO === 1 ? "not-allowed" : "pointer" }}
                                                onClick={() => {
                                                    if (reserva.BlockedVatNO === 0) {
                                                        setModalField("VatNo"); // Define o campo em edição
                                                        setIsModalOpen(true); // Abre o modal
                                                    }
                                                }}
                                            /> */}
                                        </div>
                                        <div className="mt-2">
                                            <p className="!text-textLabelColor text-lg">{guestInfo.LastName}, {guestInfo.FirstName}</p>
                                            <div className="mt-4">
                                                <InputFieldControlled
                                                    type="text"
                                                    id="VAT Nr."
                                                    name="VAT Nr."
                                                    label={t.frontOffice.registrationForm.vatNr}
                                                    ariaLabel="VAT Nr.:"
                                                    value={vatNo}
                                                    style={inputStyleFull}
                                                    disabled
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/** Modal Dinâmico */}
                                    {isModalOpen && (
                                        <EditRegistrationForm
                                            currentLabel={modalField === "Email" ? "E-mail" : "VAT No."}
                                            currentValue={modalField === "Email" ? email : vatNo}
                                            validation={
                                                modalField === "Email"
                                                    ? (value) => !value.endsWith("@guest.booking.com")
                                                    : null // Adicione validações específicas para VAT No., se necessário
                                            }
                                            onSave={(newValue) => handleModalSave(newValue)}
                                            onClose={() => setIsModalOpen(false)}
                                        />
                                    )}
                                </div>
                            </div>
                        )}

                        <div className='w-1/2 ml-4 mr-4 half-screen'>
                            {/** Assinatura */}
                            <div className='bg-cardColor py-2 px-2 rounded-lg'>
                                <p className='text-[#f7ba83] mb-1'>{t.frontOffice.registrationForm.signature}</p>
                                {/* Termos e condições */}
                                <div className='flex flex-row mt-2 gap-8 details-on-screen'>
                                    <div className='w-1/2 flex flex-col details-on-screen-card'>
                                        <p className='text-xs font-semibold text-textPrimaryColor'>{t.frontOffice.registrationForm.acceptTerms}:</p>
                                        <div className='flex flex-row justify-between text-sm text-textPrimaryColor terms-button'>
                                            <label className="flex items-center">
                                                <input
                                                    type="radio"
                                                    name="terms"
                                                    className="mr-2"
                                                    checked={termsAccepted === true}
                                                    onChange={() => setTermsAccepted(true)}
                                                />
                                                {t.frontOffice.registrationForm.agree}
                                            </label>
                                            <label className="flex items-center">
                                                <input
                                                    type="radio"
                                                    name="terms"
                                                    className="mr-2"
                                                    checked={termsAccepted === false}
                                                    onChange={() => setTermsAccepted(false)}
                                                />
                                                {t.frontOffice.registrationForm.disagree}
                                            </label>
                                            <TermsConditionsForm
                                                buttonName={t.frontOffice.registrationForm.readMore}
                                                modalHeader={t.frontOffice.registrationForm.termsModalHeader}
                                                formTypeModal={11}
                                            />
                                        </div>
                                    </div>

                                    <div className='w-1/2 flex flex-col details-on-screen-card'>
                                        <p className='text-xs font-semibold text-textPrimaryColor'>{t.frontOffice.registrationForm.acceptHotelDataProtection}:</p>
                                        <div className='flex flex-row justify-between text-sm text-textPrimaryColor privacy-button terms-button'>
                                            <label className="flex items-center">
                                                <input
                                                    type="radio"
                                                    name="policy"
                                                    className="mr-2"
                                                    checked={policyAccepted === true}
                                                    onChange={() => setPolicyAccepted(true)}
                                                />
                                                {t.frontOffice.registrationForm.agree}
                                            </label>
                                            <label className="flex items-center">
                                                <input
                                                    type="radio"
                                                    name="policy"
                                                    className="mr-2"
                                                    checked={policyAccepted === false}
                                                    onChange={() => setPolicyAccepted(false)}
                                                />
                                                {t.frontOffice.registrationForm.disagree}
                                            </label>
                                            <ProtectionPolicyForm
                                                buttonName={t.frontOffice.registrationForm.readMore}
                                                modalHeader={t.frontOffice.registrationForm.dataModalHeader}
                                                formTypeModal={11}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Área para assinatura digital */}
                                <div className='mt-2'>
                                    <div className='border-2 border-gray-300 py-2 px-2'>
                                        <div className='flex justify-end'>
                                            <button
                                                onClick={clearSignature}
                                            >
                                                <GiCancel size={20} color='orange' />
                                            </button>
                                        </div>
                                        <canvas
                                            ref={canvasRef}
                                            className='w-full h-32'
                                        ></canvas>
                                    </div>
                                </div>
                                {/* Mensagem de Erro */}
                                {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
                            </div>
                            <p className='text-xs text-gray-500 mt-4 text-justify text-style'>
                                {hotelTerms}
                            </p>
                            <div className='flex flex-row justify-between items-center mt-4 buttons-style'>
                                <button
                                    onClick={toggleTheme}
                                    className="relative w-20 h-8 flex items-center bg-gray-300 rounded-full transition"
                                >
                                    {/* Ícone do Sol - lado esquerdo */}
                                    <div
                                        className={`absolute left-2 top-1/2 transform -translate-y-1/2 transition ${isDarkMode ? "opacity-100 text-gray-400" : "opacity-0"
                                            }`}
                                    >
                                        <MdSunny size={18} />
                                    </div>

                                    {/* Ícone da Lua - lado direito */}
                                    <div
                                        className={`absolute right-2 top-1/2 transform -translate-y-1/2 transition ${isDarkMode ? "opacity-0" : "opacity-100 text-gray-400"
                                            }`}
                                    >
                                        <FaMoon size={18} />
                                    </div>

                                    {/* Bolinha Deslizante */}
                                    <span
                                        className={`absolute w-6 h-6 bg-white rounded-full shadow-md transform transition ${isDarkMode ? "translate-x-12" : "translate-x-0"
                                            } flex items-center justify-center z-10`}
                                    >
                                        {/* Ícone dentro da Bolinha */}
                                        {isDarkMode ? (
                                            <FaMoon size={14} className="text-orange-400" />
                                        ) : (
                                            <MdSunny size={14} className="text-orange-400" />
                                        )}
                                    </span>
                                </button>

                                <div className='flex flex-row gap-4 justify-end px-4 buttons-style items-center'>
                                    {/** Botão de cancelar */}
                                    {/* <CancelPIN
                                        buttonName={t.frontOffice.registrationForm.cancel}
                                        modalHeader={"Insert PIN"}
                                        formTypeModal={11}
                                        editor={"teste"}
                                    /> */}

                                    {/** Botão de aceitar */}
                                    <button
                                        className='bg-primary font-semibold text-white py-2 px-2 rounded-lg w-20 h-10'
                                        onClick={handleOkClick}>
                                        Ok
                                    </button>
                                    {/** Modal de erro */}
                                    {isErrorModalOpen && errorMessage && (
                                        <ErrorRegistrationForm
                                            modalHeader={t.frontOffice.registrationForm.attention}
                                            errorMessage={errorMessage}
                                            onClose={() => setIsErrorModalOpen(false)} // Fecha o modal quando o erro for resolvido
                                        />
                                    )}
                                    {/** Modal de sucesso */}
                                    {isSuccessModalOpen && successMessage && (
                                        <SuccessRegistrationForm
                                            modalHeader={t.frontOffice.registrationForm.attention}
                                            successMessage={successMessage}
                                        />
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}