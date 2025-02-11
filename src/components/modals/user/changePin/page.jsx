"use client";
import React, { useState, useEffect } from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, Button, useDisclosure } from "@heroui/react";
import axios from "axios";
import { MdClose } from "react-icons/md";

import en from "../../../../../public/locales/english/common.json";
import pt from "../../../../../public/locales/portuguesPortugal/common.json";
import es from "../../../../../public/locales/espanol/common.json";

const translations = { en, pt, es };

const OkPIN = ({ buttonName, buttonIcon, modalHeader, userID }) => {
    const [activeField, setActiveField] = useState("old"); // Controla o campo ativo
    const [oldPin, setOldPin] = useState("");
    const [newPin, setNewPin] = useState("");
    const [confirmNewPin, setConfirmNewPin] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const { isOpen, onOpen, onOpenChange } = useDisclosure();

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

    const resetForm = () => {
        setOldPin("");
        setNewPin("");
        setConfirmNewPin("");
    };

    const handleSubmit = async () => {
        setErrorMessage("");
        setSuccessMessage("");

        if (!oldPin || !newPin || !confirmNewPin) {
            setErrorMessage("Please fill in all fields.");
            return;
        }

        if (newPin.length !== 4 || oldPin.length !== 4 || confirmNewPin.length !== 4) {
            setErrorMessage("PINs must be exactly 4 digits.");
            return;
        }

        if (newPin !== confirmNewPin) {
            setErrorMessage("New PINs do not match.");
            return;
        }

        try {
            const response = await axios.patch(`/api/user/changePin/${userID}`, {
                oldPin,
                newPin,
            });

            if (response.status === 200) {
                setSuccessMessage("PIN updated successfully.");
                resetForm();
                onOpenChange(false); // Fecha o modal após o sucesso
            } else {
                setErrorMessage("Failed to update PIN. Please try again.");
            }
        } catch (error) {
            console.error("Error updating PIN:", error);
            setErrorMessage(error.response?.data?.message || "An error occurred.");
        }
    };

    const handleKeyPress = (key) => {
        if (key === "C") {
            if (activeField === "old") setOldPin("");
            if (activeField === "new") setNewPin("");
            if (activeField === "confirm") setConfirmNewPin("");
        } else if (key === "OK") {
            handleSubmit(); // Chama o envio ao clicar em "OK"
        } else if (!isNaN(key)) { // Apenas números são permitidos
            if (activeField === "old" && oldPin.length < 4) setOldPin((prev) => prev + key);
            if (activeField === "new" && newPin.length < 4) setNewPin((prev) => prev + key);
            if (activeField === "confirm" && confirmNewPin.length < 4) setConfirmNewPin((prev) => prev + key);
        }
    };

    return (
        <>
            <Button
                onPress={onOpen}
                color="primary"
                className="bg-primary text-white font-semibold p-2 rounded-lg text-xs h-10"
            >
                {buttonName} {buttonIcon}
            </Button>
            <Modal
                isOpen={isOpen}
                hideCloseButton={true}
                onOpenChange={onOpenChange}
                className="z-50"
                size="sm"
                backdrop="transparent"
            >
                <ModalContent>
                    <ModalHeader className="flex justify-between items-center bg-primary text-white p-2">
                        <div className="flex flex-row justify-start gap-4 pl-4">
                            {modalHeader}
                        </div>
                        <div className="flex flex-row items-center justify-end">
                            <Button color="transparent" variant="light" className="w-auto min-w-0 p-0 m-0 -pr-4"
                                onClick={() => {
                                    resetForm();
                                    onOpenChange(false);
                                }}>
                                <MdClose size={30} />
                            </Button>
                        </div>
                    </ModalHeader>
                    <ModalBody className="px-4 py-2 flex flex-col gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-400">{t.modals.changePin.oldPin}</label>
                            <input
                                type="password"
                                value={oldPin}
                                onClick={() => setActiveField("old")}
                                readOnly
                                className={`w-full border rounded-md px-2 py-1 focus:outline-none text-center ${activeField === "old" ? "border-primary ring-1 ring-primary" : "border-gray-300"
                                    }`}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400">{t.modals.changePin.newPin}</label>
                            <input
                                type="password"
                                value={newPin}
                                onClick={() => setActiveField("new")}
                                readOnly
                                className={`w-full border rounded-md px-2 py-1 focus:outline-none text-center ${activeField === "new" ? "border-primary ring-1 ring-primary" : "border-gray-300"
                                    }`}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400">{t.modals.changePin.confirmNewPin}</label>
                            <input
                                type="password"
                                value={confirmNewPin}
                                onClick={() => setActiveField("confirm")}
                                readOnly
                                className={`w-full border rounded-md px-2 py-1 focus:outline-none text-center ${activeField === "confirm" ? "border-primary ring-1 ring-primary" : "border-gray-300"
                                    }`}
                            />
                        </div>
                        <div className="grid grid-cols-3 gap-2 mt-4">
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, "C", 0, "OK"].map((key) => (
                                <button
                                    key={key}
                                    type="button"
                                    onClick={() => handleKeyPress(key)}
                                    className={`p-4 rounded ${key === "C"
                                        ? "bg-gray-300 text-black"
                                        : key === "OK"
                                            ? "bg-primary text-white"
                                            : "bg-lightGray text-black"
                                        } text-center font-bold`}
                                >
                                    {key}
                                </button>
                            ))}
                        </div>
                        {errorMessage && (
                            <p className="text-red-500 text-sm">{errorMessage}</p>
                        )}
                        {successMessage && (
                            <p className="text-green-500 text-sm">{successMessage}</p>
                        )}
                    </ModalBody>
                </ModalContent>
            </Modal>
        </>
    );
};

export default OkPIN;
