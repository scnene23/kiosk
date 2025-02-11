"use client";
import React, { useState, useEffect } from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, Button } from "@heroui/react";
import { MdClose } from "react-icons/md";
import axios from "axios";
import { Tabs, Tab } from "@heroui/react";

import en from "../../../../../public/locales/english/common.json";
import pt from "../../../../../public/locales/portuguesPortugal/common.json";
import es from "../../../../../public/locales/espanol/common.json";

const translations = { en, pt, es };

const PropertiesEditForm = ({ hotel, onClose }) => {
    const [propertyName, setPropertyName] = useState(hotel.propertyName || "");
    const [propertyTag, setPropertyTag] = useState(hotel.propertyTag || "");
    const [propertyServer, setPropertyServer] = useState(hotel.propertyServer || "");
    const [propertyPort, setPropertyPort] = useState(hotel.propertyPort || "");
    const [mpehotel, setmpehotel] = useState(hotel.mpehotel || "");
    const [pdfFilePath, setPdfFilePath] = useState(hotel.pdfFilePath || "");
    const [passeIni, setPasseIni] = useState(hotel.passeIni || "");

    const [hotelName, setHotelName] = useState(hotel.hotelName || "");
    const [hotelTermsEN, setHotelTermsEN] = useState(hotel.hotelTermsEN || "");
    const [hotelTermsPT, setHotelTermsPT] = useState(hotel.hotelTermsPT || "");
    const [hotelTermsES, setHotelTermsES] = useState(hotel.hotelTermsES || "");
    const [hotelPhone, setHotelPhone] = useState(hotel.hotelPhone || "");
    const [hotelEmail, setHotelEmail] = useState(hotel.hotelEmail || "");
    const [hotelAddress, setHotelAddress] = useState(hotel.hotelAddress || "");
    const [hotelPostalCode, setHotelPostalCode] = useState(hotel.hotelPostalCode || "");
    const [hotelRNET, setHotelRNET] = useState(hotel.hotelRNET || "");
    const [hotelNIF, setHotelNIF] = useState(hotel.hotelNIF || "");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isEditing, setIsEditing] = useState(false); // Novo estado para controlar se estamos no modo de edição

    const [locale, setLocale] = useState("pt");

    useEffect(() => {
        // Carregar o idioma do localStorage
        const storedLanguage = localStorage.getItem("language");
        if (storedLanguage) {
            setLocale(storedLanguage);
        }
    }, []);

    // Carregar as traduções com base no idioma atual
    const t = translations[locale] || translations["pt"]; // fallback para "pt"

    const handleSave = async () => {
        if (!propertyName || !propertyTag || !propertyServer) {
            setError("Please fill in all fields.");
            return;
        }

        try {
            setLoading(true);

            // Converta campos para inteiros, se necessário
            const formattedMpehotel = parseInt(mpehotel, 10);
            const formattedPropertyPort = parseInt(propertyPort, 10);

            if (isNaN(formattedMpehotel) || isNaN(formattedPropertyPort)) {
                setError("mpehotel and propertyPort must be valid numbers.");
                setLoading(false);
                return;
            }

            // Envia a requisição PATCH
            const response = await axios.patch(`/api/properties/${hotel.propertyID}`, {
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
            });

            if (response.status === 200) {
                setIsEditing(false);
                onClose();
            }
        } catch (error) {
            console.error("Error updating property:", error);
            setError("Failed to update property. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const [selectedImage, setSelectedImage] = useState(null);
    const [imageUrl, setImageUrl] = useState(hotel.imageUrl); // Estado para armazenar a URL da imagem

    const handleImageChange = (event) => {
        const file = event.target.files[0];
        // Limpa o estado de erro antes de verificar o tipo de arquivo
        setError(null);

        if (file) {
            // Verifica se o arquivo é um PNG
            if (file.type !== "image/png") {
                setError("Please upload a PNG image.");
                setSelectedImage(null); // Limpa a seleção se o tipo for inválido
                return;
            }
            setSelectedImage(file); // Atualiza o estado com a nova imagem
        }
    };

    const handleImageUpload = async () => {
        if (!selectedImage) {
            setError("Please select an image to upload.");
            return;
        }

        const formData = new FormData();
        formData.append("file", selectedImage);
        formData.append("hotelId", hotel.propertyID);
        formData.append("existingImage", imageUrl); // Passa a URL da imagem antiga

        try {
            setLoading(true);
            const response = await axios.post("/api/upload-image", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            if (response.status === 200) {
                setImageUrl(response.data.imageUrl); // Atualiza a URL com a nova imagem no Cloudinary
                setSelectedImage(null);
            }
        } catch (error) {
            console.error("Error uploading image:", error);
            setError("Failed to upload image. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const [activeKey, setActiveKey] = useState("EN"); // Estado de controle da aba ativa

    return (
        <Modal
            isOpen={true}
            onOpenChange={onClose}
            className="z-50"
            size="2xl"
            hideCloseButton={true}
            backdrop="transparent"
        >
            <ModalContent>
                <ModalHeader className="flex flex-row justify-between items-center gap-1 p-2 px-4 bg-primary text-white">
                    {isEditing ? t.modals.propertiesEdit.editProperty : t.modals.propertiesEdit.viewProperty } {/* Mudança do título com base no modo */}
                    <Button
                        color="transparent"
                        variant="light"
                        onClick={onClose}
                        className="w-auto min-w-0 p-0 m-0"
                    >
                        <MdClose size={30} />
                    </Button>
                </ModalHeader>
                <ModalBody className="flex flex-col mx-5 my-5 space-y-4 text-textPrimaryColor">
                    <Tabs aria-label="Options" className="flex justify-center">
                        <Tab key="propertyDetails" title={t.modals.propertiesEdit.settings}>
                            <div className="-mt-4 flex flex-col gap-2">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400">{t.modals.propertiesEdit.propertyName}</label>
                                    <input
                                        type="text"
                                        value={propertyName}
                                        onChange={(e) => setPropertyName(e.target.value)}
                                        className="w-full border border-gray-300 rounded-md px-2 py-1 focus:outline-none"
                                        disabled={!isEditing} // Desabilita o campo quando não está em edição
                                    />
                                </div>
                                {/* <div>
                                    <label className="block text-sm font-medium text-gray-400">{"Connection String:"}</label>
                                    <input
                                        type="text"
                                        value={propertyConnectionString}
                                        onChange={(e) => setPropertyConnectionString(e.target.value)}
                                        className="w-full border border-gray-300 rounded-md px-2 py-1 focus:outline-none"
                                        disabled={!isEditing} // Desabilita o campo quando não está em edição
                                    />
                                </div> */}
                                <div className="flex flex-row w-full gap-4"> {/* Usa flex-row para exibir os itens lado a lado */}
                                    <div className="flex flex-col w-1/2"> {/* Cada campo ocupa metade do espaço */}
                                        <label className="block text-sm font-medium text-gray-400">{t.modals.propertiesEdit.propertyTag}</label>
                                        <input
                                            type="text"
                                            value={propertyTag}
                                            onChange={(e) => setPropertyTag(e.target.value)}
                                            className="w-full border border-gray-300 rounded-md px-2 py-1 focus:outline-none"
                                            disabled={!isEditing} // Desabilita o campo quando não está em edição
                                        />
                                    </div>
                                    <div className="flex flex-col w-1/2"> {/* Cada campo ocupa metade do espaço */}
                                        <label className="block text-sm font-medium text-gray-400">{t.modals.propertiesEdit.mpeHotel}</label>
                                        <input
                                            type="text"
                                            value={mpehotel}
                                            onChange={(e) => setmpehotel(e.target.value)}
                                            className="w-full border border-gray-300 rounded-md px-2 py-1 focus:outline-none"
                                            disabled={!isEditing} // Desabilita o campo quando não está em edição
                                        />
                                    </div>
                                </div>
                                <div className="flex flex-row w-full gap-4"> {/* Usa flex-row para exibir os itens lado a lado */}
                                    <div className="flex flex-col w-1/2"> {/* Cada campo ocupa metade do espaço */}
                                        <label className="block text-sm font-medium text-gray-400">{t.modals.propertiesEdit.propertyServer}</label>
                                        <input
                                            type="text"
                                            value={propertyServer}
                                            onChange={(e) => setPropertyServer(e.target.value)}
                                            className="w-full border border-gray-300 rounded-md px-2 py-1 focus:outline-none"
                                            disabled={!isEditing} // Desabilita o campo quando não está em edição
                                        />
                                    </div>
                                    <div className="flex flex-col w-1/2"> {/* Cada campo ocupa metade do espaço */}
                                        <label className="block text-sm font-medium text-gray-400">{t.modals.propertiesEdit.propertyPort}</label>
                                        <input
                                            type="text"
                                            value={propertyPort}
                                            onChange={(e) => setPropertyPort(e.target.value)}
                                            className="w-full border border-gray-300 rounded-md px-2 py-1 focus:outline-none"
                                            disabled={!isEditing} // Desabilita o campo quando não está em edição
                                        />
                                    </div>
                                </div>

                                <div className="flex flex-col"> {/* Cada campo ocupa metade do espaço */}
                                    <label className="block text-sm font-medium text-gray-400">{t.modals.propertiesEdit.iniPath}</label>
                                    <input
                                        type="text"
                                        value={passeIni}
                                        onChange={(e) => setPasseIni(e.target.value)}
                                        className="w-full border border-gray-300 rounded-md px-2 py-1 focus:outline-none"
                                        disabled={!isEditing} // Desabilita o campo quando não está em edição
                                    />
                                </div>
                                <div className="flex flex-col"> {/* Cada campo ocupa metade do espaço */}
                                    <label className="block text-sm font-medium text-gray-400">{t.modals.propertiesEdit.pdfFile}</label>
                                    <input
                                        type="text"
                                        value={pdfFilePath}
                                        onChange={(e) => setPdfFilePath(e.target.value)}
                                        className="w-full border border-gray-300 rounded-md px-2 py-1 focus:outline-none"
                                        disabled={!isEditing} // Desabilita o campo quando não está em edição
                                    />
                                </div>
                            </div>
                        </Tab>
                        <Tab key="hotelDetails" title={t.modals.propertiesEdit.details}>
                            <div className="-mt-4 flex flex-col gap-2 -ml-8 -mr-8">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400">{t.modals.propertiesEdit.hotelName}</label>
                                    <input
                                        type="text"
                                        value={hotelName}
                                        onChange={(e) => setHotelName(e.target.value)}
                                        className="w-full border border-gray-300 rounded-md px-2 py-1 focus:outline-none"
                                        disabled={!isEditing} // Desabilita o campo quando não está em edição
                                    />
                                </div>
                                <div className="flex flex-row w-full gap-4"> {/* Usa flex-row para exibir os itens lado a lado */}
                                    <div className="flex flex-col w-2/3"> {/* Cada campo ocupa metade do espaço */}
                                        <label className="block text-sm font-medium text-gray-400">{t.modals.propertiesEdit.hotelEmail}</label>
                                        <input
                                            type="text"
                                            value={hotelEmail}
                                            onChange={(e) => setHotelEmail(e.target.value)}
                                            className="w-full border border-gray-300 rounded-md px-2 py-1 focus:outline-none"
                                            disabled={!isEditing} // Desabilita o campo quando não está em edição
                                        />
                                    </div>
                                    <div className="flex flex-col w-1/3"> {/* Cada campo ocupa metade do espaço */}
                                        <label className="block text-sm font-medium text-gray-400">{t.modals.propertiesEdit.hotelPhone}</label>
                                        <input
                                            type="text"
                                            value={hotelPhone}
                                            onChange={(e) => setHotelPhone(e.target.value)}
                                            className="w-full border border-gray-300 rounded-md px-2 py-1 focus:outline-none"
                                            disabled={!isEditing} // Desabilita o campo quando não está em edição
                                        />
                                    </div>
                                </div>
                                <div className="flex flex-row w-full gap-4"> {/* Usa flex-row para exibir os itens lado a lado */}
                                    <div className="flex flex-col w-2/3"> {/* Cada campo ocupa metade do espaço */}
                                        <label className="block text-sm font-medium text-gray-400">{t.modals.propertiesEdit.hotelAddress}</label>
                                        <input
                                            type="text"
                                            value={hotelAddress}
                                            onChange={(e) => setHotelAddress(e.target.value)}
                                            className="w-full border border-gray-300 rounded-md px-2 py-1 focus:outline-none"
                                            disabled={!isEditing} // Desabilita o campo quando não está em edição
                                        />
                                    </div>
                                    <div className="flex flex-col w-1/3"> {/* Cada campo ocupa metade do espaço */}
                                        <label className="block text-sm font-medium text-gray-400">{t.modals.propertiesEdit.hotelPCode}</label>
                                        <input
                                            type="text"
                                            value={hotelPostalCode}
                                            onChange={(e) => setHotelPostalCode(e.target.value)}
                                            className="w-full border border-gray-300 rounded-md px-2 py-1 focus:outline-none"
                                            disabled={!isEditing} // Desabilita o campo quando não está em edição
                                        />
                                    </div>
                                </div>
                                <div className="flex flex-row w-full gap-4"> {/* Usa flex-row para exibir os itens lado a lado */}
                                    <div className="flex flex-col w-1/2"> {/* Cada campo ocupa metade do espaço */}
                                        <label className="block text-sm font-medium text-gray-400">{t.modals.propertiesEdit.hotelRNET}</label>
                                        <input
                                            type="text"
                                            value={hotelRNET}
                                            onChange={(e) => setHotelRNET(e.target.value)}
                                            className="w-full border border-gray-300 rounded-md px-2 py-1 focus:outline-none"
                                            disabled={!isEditing} // Desabilita o campo quando não está em edição
                                        />
                                    </div>
                                    <div className="flex flex-col w-1/2"> {/* Cada campo ocupa metade do espaço */}
                                        <label className="block text-sm font-medium text-gray-400">{t.modals.propertiesEdit.hotelNIF}</label>
                                        <input
                                            type="text"
                                            value={hotelNIF}
                                            onChange={(e) => setHotelNIF(e.target.value)}
                                            className="w-full border border-gray-300 rounded-md px-2 py-1 focus:outline-none"
                                            disabled={!isEditing} // Desabilita o campo quando não está em edição
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-400">{t.modals.propertiesEdit.hotelTerms}</label>

                                    <div className="mb-2">
                                        <div className="flex flex-row justify-center bg-gray-100 w-32 h-8 rounded-xl items-center">
                                            <div
                                                onClick={() => setActiveKey("EN")}
                                                className={`cursor-pointer p-1 ${activeKey === "EN" ? "bg-white text-black rounded-lg m-1 text-sm text-bold border border-gray-200" : "text-gray-500 m-1 text-sm"}`}
                                            >
                                                EN
                                            </div>
                                            <div
                                                onClick={() => setActiveKey("PT")}
                                                className={`cursor-pointer p-1 ${activeKey === "PT" ? "bg-white text-black rounded-lg m-1 text-sm text-bold border border-gray-200" : "text-gray-500 m-1 text-sm"}`}
                                            >
                                                PT
                                            </div>
                                            <div
                                                onClick={() => setActiveKey("ES")}
                                                className={`cursor-pointer p-1 ${activeKey === "ES" ? "bg-white text-black rounded-lg m-1 text-sm text-bold border border-gray-200" : "text-gray-500 m-1 text-sm"}`}
                                            >
                                                ES
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        {activeKey === "EN" && (
                                            <div>
                                                <textarea
                                                    value={hotelTermsEN}
                                                    onChange={(e) => setHotelTermsEN(e.target.value)}
                                                    className="w-full h-20 border border-gray-300 rounded-md px-2 py-1 focus:outline-none"
                                                    disabled={!isEditing} // Desabilita o campo quando não está em edição
                                                />
                                            </div>
                                        )}
                                        {activeKey === "PT" && (
                                            <div>
                                                <textarea
                                                    value={hotelTermsPT}
                                                    onChange={(e) => setHotelTermsPT(e.target.value)}
                                                    className="w-full h-20 border border-gray-300 rounded-md px-2 py-1 focus:outline-none"
                                                    disabled={!isEditing} // Desabilita o campo quando não está em edição
                                                />
                                            </div>
                                        )}
                                        {activeKey === "ES" && (
                                            <div>
                                                <textarea
                                                    value={hotelTermsES}
                                                    onChange={(e) => setHotelTermsES(e.target.value)}
                                                    className="w-full h-20 border border-gray-300 rounded-md px-2 py-1 focus:outline-none"
                                                    disabled={!isEditing} // Desabilita o campo quando não está em edição
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-400">{t.modals.propertiesEdit.hotelImage}</label>
                                    <div className="flex flex-col gap-2">
                                        <input
                                            type="file"
                                            accept="image/png" // Aceita apenas arquivos PNG
                                            onChange={handleImageChange}
                                            className="block w-full text-sm text-gray-500
                                            file:mr-4 file:py-2 file:px-4
                                            file:rounded file:border-0
                                            file:text-sm file:font-semibold
                                            file:bg-primary file:text-white
                                            hover:file:bg-primary-dark"
                                        />
                                        {selectedImage && (
                                            <div className="flex items-center gap-2">
                                                <p className="text-sm text-gray-700">{t.modals.propertiesEdit.selected} {selectedImage.name}</p>
                                                <Button
                                                    color="primary"
                                                    onClick={handleImageUpload}
                                                    disabled={loading}
                                                >
                                                    {loading ? "Uploading..." : "Upload"}
                                                </Button>
                                            </div>
                                        )}
                                        {imageUrl && (
                                            <img
                                                src={imageUrl}
                                                alt="Current Hotel"
                                                className="mt-4 w-20 h-20 rounded shadow -mb-8"
                                            />
                                        )}
                                    </div>
                                </div>
                            </div>
                        </Tab>
                    </Tabs>

                    {/* Exibição de erro */}
                    {error && <p className="text-red-500 text-sm">{error}</p>}

                    <div className="flex justify-end space-x-2">
                        <Button color="error" onClick={onClose}>
                        {t.modals.propertiesEdit.cancel}
                        </Button>
                        {isEditing ? (
                            <Button color="primary" onClick={handleSave} disabled={loading}>
                                {loading ? "Saving..." : "Save"}
                            </Button>
                        ) : (
                            <Button color="primary" onClick={() => setIsEditing(true)}>
                                {t.modals.propertiesEdit.edit}
                            </Button>
                        )}
                    </div>
                </ModalBody>
            </ModalContent>
        </Modal >
    );
};

export default PropertiesEditForm;