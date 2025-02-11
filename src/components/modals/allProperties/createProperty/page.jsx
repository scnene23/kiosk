import axios from "axios";
import React, { useState, useEffect } from "react";
import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    Button,
    useDisclosure,
} from "@heroui/react";
import { MdClose } from "react-icons/md";
import { Tabs, Tab } from "@heroui/react";

import en from "../../../../../public/locales/english/common.json";
import pt from "../../../../../public/locales/portuguesPortugal/common.json";
import es from "../../../../../public/locales/espanol/common.json";

const translations = { en, pt, es };

const CreatePropertyModal = ({
    buttonName,
    buttonIcon,
    buttonColor,
    modalHeader,
    editIcon,
    modalEditArrow,
    modalEdit,
    formTypeModal,
}) => {
    const { isOpen, onOpen, onOpenChange } = useDisclosure();

    const [propertyName, setPropertyName] = useState("");
    const [propertyTag, setPropertyTag] = useState("");
    const [propertyServer, setPropertyServer] = useState("");
    const [propertyPort, setPropertyPort] = useState("");
    const [mpehotel, setmpehotel] = useState("");
    const [pdfFilePath, setPdfFilePath] = useState("");
    const [passeIni, setPasseIni] = useState("");

    const [hotelName, setHotelName] = useState("");
    const [hotelTermsEN, setHotelTermsEN] = useState("");
    const [hotelTermsPT, setHotelTermsPT] = useState("");
    const [hotelTermsES, setHotelTermsES] = useState("");
    const [hotelPhone, setHotelPhone] = useState("");
    const [hotelEmail, setHotelEmail] = useState("");
    const [hotelAddress, setHotelAddress] = useState("");
    const [hotelPostalCode, setHotelPostalCode] = useState("");
    const [hotelRNET, setHotelRNET] = useState("");
    const [hotelNIF, setHotelNIF] = useState("");

    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const [selectedImage, setSelectedImage] = useState(null);
    const [imageUrl, setImageUrl] = useState(); // Estado para armazenar a URL da imagem

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setSuccessMessage("");
        setErrorMessage("");

        try {
            // Envio dos dados da propriedade
            const propertyResponse = await axios.put(`/api/properties`, {
                propertyName,
                propertyTag,
                propertyServer,
                propertyPort: parseInt(propertyPort, 10),
                mpehotel: parseInt(mpehotel, 10),
                pdfFilePath,
                passeIni,
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
            });

            if (propertyResponse.status === 201) {
                setSuccessMessage("Properties updated successfully.");

                resetForm();
            } else {
                setErrorMessage(`Failed to update properties. Status: ${propertyResponse.status}`);
            }
        } catch (error) {
            console.error("Error during the process:", error);
            setErrorMessage(
                error.response?.data?.message || "An error occurred. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setPropertyName("");
        setPropertyTag("");
        setPropertyServer("");
        setPropertyPort("");
        setmpehotel("");
        setPdfFilePath("");
        setPasseIni("");
        setHotelName("");
        setHotelTermsEN("");
        setHotelTermsPT("");
        setHotelTermsES("");
        setHotelPhone("");
        setHotelEmail("");
        setHotelAddress("");
        setHotelPostalCode("");
        setHotelRNET("");
        setHotelNIF("");
    };

    const handleImageChange = (event) => {
        const file = event.target.files[0];
        // Limpa o estado de erro antes de verificar o tipo de arquivo
        setErrorMessage(null);

        if (file) {
            // Verifica se o arquivo é um PNG
            if (file.type !== "image/png") {
                setErrorMessage("Please upload a PNG image.");
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

    const [activeKey, setActiveKey] = useState("EN");

    return (
        <>
            {formTypeModal === 11 && (
                <>
                    <Button
                        color={buttonColor}
                        size="ms"
                        onPress={onOpen}
                        className="flex items-center justify-center rounded-md bg-primary px-2"
                    >
                        {buttonIcon} {buttonName}
                    </Button>

                    <Modal
                        isOpen={isOpen}
                        hideCloseButton={true}
                        onOpenChange={onOpenChange}
                        isDismissable={true}
                        isKeyboardDismissDisabled={false}
                        className="z-50"
                        size="2xl"
                    >
                        <ModalContent>
                            <form onSubmit={handleSubmit}>
                                <ModalHeader className="flex flex-row justify-between items-center gap-1 bg-primary text-white p-2">
                                    <div className="flex flex-row justify-start gap-4 pl-4">
                                        {editIcon} {modalHeader} {modalEditArrow} {modalEdit}
                                    </div>
                                    <div className="flex flex-row items-center justify-end">
                                        <Button
                                            color="transparent"
                                            variant="light"
                                            className="w-auto min-w-0 p-0 m-0 -pr-4"
                                            onClick={() => {
                                                onOpenChange(false);
                                                window.location.reload();
                                            }}
                                        >
                                            <MdClose size={30} />
                                        </Button>
                                    </div>
                                </ModalHeader>
                                <ModalBody className="flex flex-col space-y-8 bg-background">
                                    <Tabs aria-label="Options" className="flex justify-center">
                                        <Tab key="propertyDetails" title={t.modals.createProperty.propertyDetails}>
                                            <div className="-mt-4 flex flex-col gap-2">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-400">{t.modals.createProperty.propertyName}</label>
                                                    <input
                                                        type="text"
                                                        value={propertyName}
                                                        onChange={(e) => setPropertyName(e.target.value)}
                                                        className="w-full border border-gray-300 rounded-md px-2 py-1 focus:outline-none"
                                                    />
                                                </div>
                                                <div className="flex flex-row w-full gap-4"> {/* Usa flex-row para exibir os itens lado a lado */}
                                                    <div className="flex flex-col w-1/2"> {/* Cada campo ocupa metade do espaço */}
                                                        <label className="block text-sm font-medium text-gray-400">{t.modals.createProperty.propertyTag}</label>
                                                        <input
                                                            type="text"
                                                            value={propertyTag}
                                                            onChange={(e) => setPropertyTag(e.target.value)}
                                                            className="w-full border border-gray-300 rounded-md px-2 py-1 focus:outline-none"
                                                        />
                                                    </div>
                                                    <div className="flex flex-col w-1/2"> {/* Cada campo ocupa metade do espaço */}
                                                        <label className="block text-sm font-medium text-gray-400">{t.modals.createProperty.mpeHotel}</label>
                                                        <input
                                                            type="text"
                                                            value={mpehotel}
                                                            onChange={(e) => setmpehotel(e.target.value)}
                                                            className="w-full border border-gray-300 rounded-md px-2 py-1 focus:outline-none"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="flex flex-row w-full gap-4"> {/* Usa flex-row para exibir os itens lado a lado */}
                                                    <div className="flex flex-col w-1/2"> {/* Cada campo ocupa metade do espaço */}
                                                        <label className="block text-sm font-medium text-gray-400">{t.modals.createProperty.propertyServer}</label>
                                                        <input
                                                            type="text"
                                                            value={propertyServer}
                                                            onChange={(e) => setPropertyServer(e.target.value)}
                                                            className="w-full border border-gray-300 rounded-md px-2 py-1 focus:outline-none"
                                                        />
                                                    </div>
                                                    <div className="flex flex-col w-1/2"> {/* Cada campo ocupa metade do espaço */}
                                                        <label className="block text-sm font-medium text-gray-400">{t.modals.createProperty.propertyPort}</label>
                                                        <input
                                                            type="text"
                                                            value={propertyPort}
                                                            onChange={(e) => setPropertyPort(e.target.value)}
                                                            className="w-full border border-gray-300 rounded-md px-2 py-1 focus:outline-none"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="flex flex-row w-full gap-4"> {/* Usa flex-row para exibir os itens lado a lado */}
                                                    <div className="flex flex-col w-1/2"> {/* Cada campo ocupa metade do espaço */}
                                                        <label className="block text-sm font-medium text-gray-400">{t.modals.createProperty.iniPath}</label>
                                                        <input
                                                            type="text"
                                                            value={passeIni}
                                                            onChange={(e) => setPasseIni(e.target.value)}
                                                            className="w-full border border-gray-300 rounded-md px-2 py-1 focus:outline-none"
                                                        />
                                                    </div>
                                                    <div className="flex flex-col w-1/2"> {/* Cada campo ocupa metade do espaço */}
                                                        <label className="block text-sm font-medium text-gray-400">{t.modals.createProperty.pdfFile}</label>
                                                        <input
                                                            type="text"
                                                            value={pdfFilePath}
                                                            onChange={(e) => setPdfFilePath(e.target.value)}
                                                            className="w-full border border-gray-300 rounded-md px-2 py-1 focus:outline-none"
                                                        />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-400">{t.modals.createProperty.hotelImage}</label>
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
                                                                <p className="text-sm text-gray-700">{t.modals.createProperty.selected} {selectedImage.name}</p>
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
                                        <Tab key="hotelDetails" title={t.modals.createProperty.hotelDetails}>
                                            <div className="-mt-4 flex flex-col gap-2 ">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-400">{t.modals.createProperty.hotelName}</label>
                                                    <input
                                                        type="text"
                                                        value={hotelName}
                                                        onChange={(e) => setHotelName(e.target.value)}
                                                        className="w-full border border-gray-300 rounded-md px-2 py-1 focus:outline-none"
                                                    />
                                                </div>
                                                <div className="flex flex-row w-full gap-4"> {/* Usa flex-row para exibir os itens lado a lado */}
                                                    <div className="flex flex-col w-2/3"> {/* Cada campo ocupa metade do espaço */}
                                                        <label className="block text-sm font-medium text-gray-400">{t.modals.createProperty.hotelEmail}</label>
                                                        <input
                                                            type="text"
                                                            value={hotelEmail}
                                                            onChange={(e) => setHotelEmail(e.target.value)}
                                                            className="w-full border border-gray-300 rounded-md px-2 py-1 focus:outline-none"
                                                        />
                                                    </div>
                                                    <div className="flex flex-col w-1/3"> {/* Cada campo ocupa metade do espaço */}
                                                        <label className="block text-sm font-medium text-gray-400">{t.modals.createProperty.hotelPhone}</label>
                                                        <input
                                                            type="text"
                                                            value={hotelPhone}
                                                            onChange={(e) => setHotelPhone(e.target.value)}
                                                            className="w-full border border-gray-300 rounded-md px-2 py-1 focus:outline-none"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="flex flex-row w-full gap-4"> {/* Usa flex-row para exibir os itens lado a lado */}
                                                    <div className="flex flex-col w-2/3"> {/* Cada campo ocupa metade do espaço */}
                                                        <label className="block text-sm font-medium text-gray-400">{t.modals.createProperty.hotelAddress}</label>
                                                        <input
                                                            type="text"
                                                            value={hotelAddress}
                                                            onChange={(e) => setHotelAddress(e.target.value)}
                                                            className="w-full border border-gray-300 rounded-md px-2 py-1 focus:outline-none"
                                                        />
                                                    </div>
                                                    <div className="flex flex-col w-1/3"> {/* Cada campo ocupa metade do espaço */}
                                                        <label className="block text-sm font-medium text-gray-400">{t.modals.createProperty.hotelPCode}</label>
                                                        <input
                                                            type="text"
                                                            value={hotelPostalCode}
                                                            onChange={(e) => setHotelPostalCode(e.target.value)}
                                                            className="w-full border border-gray-300 rounded-md px-2 py-1 focus:outline-none"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="flex flex-row w-full gap-4"> {/* Usa flex-row para exibir os itens lado a lado */}
                                                    <div className="flex flex-col w-1/2"> {/* Cada campo ocupa metade do espaço */}
                                                        <label className="block text-sm font-medium text-gray-400">{t.modals.createProperty.hotelRNET}</label>
                                                        <input
                                                            type="text"
                                                            value={hotelRNET}
                                                            onChange={(e) => setHotelRNET(e.target.value)}
                                                            className="w-full border border-gray-300 rounded-md px-2 py-1 focus:outline-none"
                                                        />
                                                    </div>
                                                    <div className="flex flex-col w-1/2"> {/* Cada campo ocupa metade do espaço */}
                                                        <label className="block text-sm font-medium text-gray-400">{t.modals.createProperty.hotelNIF}</label>
                                                        <input
                                                            type="text"
                                                            value={hotelNIF}
                                                            onChange={(e) => setHotelNIF(e.target.value)}
                                                            className="w-full border border-gray-300 rounded-md px-2 py-1 focus:outline-none"
                                                        />
                                                    </div>
                                                </div>


                                                <div>
                                                    <label className="block text-sm font-medium text-gray-400">{t.modals.createProperty.hotelTerms}</label>

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
                                                                />
                                                            </div>
                                                        )}
                                                        {activeKey === "PT" && (
                                                            <div>
                                                                <textarea
                                                                    value={hotelTermsPT}
                                                                    onChange={(e) => setHotelTermsPT(e.target.value)}
                                                                    className="w-full h-20 border border-gray-300 rounded-md px-2 py-1 focus:outline-none"
                                                                />
                                                            </div>
                                                        )}
                                                        {activeKey === "ES" && (
                                                            <div>
                                                                <textarea
                                                                    value={hotelTermsES}
                                                                    onChange={(e) => setHotelTermsES(e.target.value)}
                                                                    className="w-full h-20 border border-gray-300 rounded-md px-2 py-1 focus:outline-none"
                                                                />
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </Tab>
                                    </Tabs>
                                    {successMessage && (
                                        <p className="text-green-500 text-sm">{successMessage}</p>
                                    )}
                                    {errorMessage && (
                                        <p className="text-red-500 text-sm">{errorMessage}</p>
                                    )}
                                </ModalBody>
                                <div className="flex justify-end p-4">
                                    <Button
                                        type="submit"
                                        color="primary"
                                        isLoading={loading}
                                        className="rounded-md"
                                    >
                                        {t.modals.createProperty.save}
                                    </Button>
                                </div>
                            </form>
                        </ModalContent>
                    </Modal>
                </>
            )}
        </>
    );
};

export default CreatePropertyModal;
