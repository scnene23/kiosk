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
import { Switch } from "@heroui/switch";

import en from "../../../../../../public/locales/english/common.json";
import pt from "../../../../../../public/locales/portuguesPortugal/common.json";
import es from "../../../../../../public/locales/espanol/common.json";

const translations = { en, pt, es };

const UserPropertiesModal = ({
    buttonName,
    buttonIcon,
    buttonColor,
    modalHeader,
    editIcon,
    modalEditArrow,
    modalEdit,
    formTypeModal,
    userID,
}) => {
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const [properties, setProperties] = useState([]);
    const [userProperties, setUserProperties] = useState([]);
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

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

    console.log(loading);
    useEffect(() => {
        const fetchProperties = async () => {
            try {
                const response = await axios.get(`/api/properties`);
                if (Array.isArray(response.data.response)) {
                    // Agora inclui `propertyTag` junto com `propertyID`
                    setProperties(response.data.response);
                } else {
                    console.log("Estrutura de resposta inesperada da API", response.data);
                }
            } catch (error) {
                console.log("Erro ao buscar propriedades:", error);
            }
        };

        if (isOpen) {
            fetchProperties();
        }
    }, [isOpen]); // ✅ Agora está correto

    useEffect(() => {
        const fetchUserProperties = async () => {
            try {
                const response = await axios.get(`/api/user/userProperties/${userID}`);
                console.log("Propriedades api", response);
                if (Array.isArray(response.data.propertyIDs)) {
                    setUserProperties(response.data.propertyIDs);
                } else {
                    console.log("Estrutura de resposta inesperada da API", response.data);
                }
            } catch (error) {
                console.log("Erro ao buscar propriedades do usuário:", error);
            }
        };

        if (userID) {
            fetchUserProperties();
        }
    }, [userID]);

    const handleToggleProperty = async (propertyId, e) => {
        e?.preventDefault(); // Evita comportamento inesperado

        // Encontrar a propertyTag correspondente à propertyId
        const property = properties.find((prop) => prop.propertyID === propertyId);
        const propertyTag = property ? property.propertyTag : null;

        if (!propertyTag) {
            console.log("Propriedade não encontrada ou tag ausente.");
            return;
        }

        try {
            setLoading(true);

            if (userProperties.includes(propertyId)) {
                // Remover a propriedade (delete)
                await axios.delete(`/api/user/userProperties/${userID}`, { data: { propertyID: propertyId } });
                setUserProperties(prev => prev.filter(id => id !== propertyId));
            } else {
                // Adicionar a propriedade (post)
                await axios.post(`/api/user/userProperties/${userID}`, { userID, propertyID: propertyId, propertyTag });
                setUserProperties(prev => [...prev, propertyId]);
            }

            setSuccessMessage("Update completed successfully!");
        } catch (error) {
            setErrorMessage("Error updating property.");
            console.log("Error updating property.", error);

            // Remover a mensagem de erro após 5 segundos
            setTimeout(() => {
                setErrorMessage("");
            }, 5000);
        } finally {
            setLoading(false);
        }
    };


    return (
        <>
            {formTypeModal === 11 && (
                <>
                    <Button
                        color={buttonColor}
                        size="ms"
                        onPress={onOpen}
                        className="flex items-center justify-center rounded-md bg-primary px-2 h-8 w-5"
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
                        size="sm"
                    >
                        <ModalContent>
                            <ModalHeader className="flex flex-row justify-between items-center gap-1 bg-primary text-white p-2">
                                <div className="flex flex-row justify-start gap-4 pl-4">
                                    {editIcon} {modalHeader} {modalEditArrow} {modalEdit}
                                </div>
                                <div className="flex flex-row items-center justify-end">
                                    <Button
                                        color="transparent"
                                        variant="light"
                                        className="w-auto min-w-0 p-0 m-0 -pr-4"
                                        onClick={() => onOpenChange(false)}
                                    >
                                        <MdClose size={30} />
                                    </Button>
                                </div>
                            </ModalHeader>

                            <ModalBody className="flex flex-col space-y-8 bg-background">
                                <div className="flex flex-col gap-2">
                                    {properties.length === 0 ? (
                                        <p>{t.modals.user.userProperties.noResults}</p>
                                    ) : (
                                        properties.map((property) => (
                                            <div key={property.propertyID} className="flex justify-between items-center p-2 border-b">
                                                <span>{property.propertyName}</span>
                                                <Switch
                                                    isSelected={userProperties.includes(property.propertyID)}
                                                    onChange={(e) => handleToggleProperty(property.propertyID, e)}
                                                />

                                            </div>
                                        ))
                                    )}
                                </div>
                                {successMessage && <p className="text-green-500 text-sm">{successMessage}</p>}
                                {errorMessage && <p className="text-red-500 text-sm">{errorMessage}</p>}
                            </ModalBody>

                            <div className="flex justify-end p-4">
                                <Button
                                    color="primary"
                                    className="rounded-md"
                                    onClick={() => onOpenChange(false)}
                                >
                                    {t.modals.user.userProperties.close}
                                </Button>
                            </div>
                        </ModalContent>
                    </Modal>
                </>
            )}
        </>
    );
};

export default UserPropertiesModal;
