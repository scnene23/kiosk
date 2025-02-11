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

import en from "../../../../../public/locales/english/common.json";
import pt from "../../../../../public/locales/portuguesPortugal/common.json";
import es from "../../../../../public/locales/espanol/common.json";

const translations = { en, pt, es };

const CreateUserModal = ({
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
    const [firstName, setFirstName] = useState("");
    const [secondName, setSecondName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [pin, setPin] = useState("");
    const [expirationDate, setExpirationDate] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [loading, setLoading] = useState(false);

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
            const response = await axios.put(`/api/user`, {
                firstName,
                secondName,
                email,
                password,
                pin,
                expirationDate,
            });

            if (response.status === 201) {
                setSuccessMessage("User created successfully.");
                resetForm();
                onOpenChange(false); // Fecha o modal
            } else {
                setErrorMessage(`Failed to create user. Status: ${response.status}`);
            }
        } catch (error) {
            console.error("Error creating user:", error);
            // Exibindo o erro completo para diagnóstico
            setErrorMessage(
                error.response?.data?.message || "An error occurred. Please try again."
            );
            console.log("ERRO: ", error);
        } finally {
            setLoading(false);
        }
    };


    const resetForm = () => {
        setFirstName("");
        setSecondName("");
        setEmail("");
        setPassword("");
        setPin("");
        setExpirationDate("");
    };

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
                        size="sm"
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
                                            onClick={() => onOpenChange(false)}
                                        >
                                            <MdClose size={30} />
                                        </Button>
                                    </div>
                                </ModalHeader>
                                <ModalBody className="flex flex-col space-y-8 bg-background">
                                    <div className="flex flex-col gap-2">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-400">
                                                {t.modals.createUser.name}
                                            </label>
                                            <input
                                                type="text"
                                                value={firstName}
                                                onChange={(e) => setFirstName(e.target.value)}
                                                className="w-full border border-gray-300 rounded-md px-2 py-1 bg-tableFooter text-gray-400 focus:outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-400">
                                                {t.modals.createUser.surname}
                                            </label>
                                            <input
                                                type="text"
                                                value={secondName}
                                                onChange={(e) => setSecondName(e.target.value)}
                                                className="w-full border border-gray-300 rounded-md px-2 py-1 bg-tableFooter text-gray-400 focus:outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-400">
                                                {t.modals.createUser.email}
                                            </label>
                                            <input
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="w-full border border-gray-300 rounded-md px-2 py-1 bg-tableFooter text-gray-400 focus:outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-400">
                                                {t.modals.createUser.password}
                                            </label>
                                            <input
                                                type="password"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                className="w-full border border-gray-300 rounded-md px-2 py-1 bg-tableFooter text-gray-400 focus:outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-400">
                                                {t.modals.createUser.pin}
                                            </label>
                                            <input
                                                type="password"
                                                value={pin}
                                                onChange={(e) => setPin(e.target.value)}
                                                className="w-full border border-gray-300 rounded-md px-2 py-1 bg-tableFooter text-gray-400 focus:outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-400">
                                                {t.modals.createUser.expirationDate}
                                            </label>
                                            <input
                                                type="date"
                                                value={expirationDate}
                                                onChange={(e) => setExpirationDate(e.target.value)}
                                                className="w-full border border-gray-300 rounded-md px-2 py-1 bg-tableFooter text-gray-400 focus:outline-none"
                                            />
                                        </div>
                                    </div>
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
                                        {t.modals.createUser.submit}
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

export default CreateUserModal;
