"use client";
import React, { useState, useEffect, useRef } from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, Button } from "@heroui/react";
import { MdClose } from "react-icons/md";

const EditRegistrationForm = ({ currentLabel, currentValue, onSave, onClose, validation }) => {
    const [newValue, setNewValue] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    // Cria a referência para o input
    const inputRef = useRef(null);

    useEffect(() => {
        setNewValue(""); // Garante que o campo começa vazio

        // Dá foco ao input assim que o modal for aberto
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, [currentValue]);

    const handleSave = () => {
        const isEmail = currentLabel.toLowerCase() === "e-mail"; // Verifica se é um e-mail
        const trimmedValue = newValue.trim(); // Remove espaços extras

        // Validação - Campo vazio
        if (!trimmedValue) {
            setErrorMessage(`${currentLabel} cannot be empty.`);
            return;
        }

        if (isEmail) {
            // Expressão regular atualizada e testada
            const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/; // Valida formato
            const isValidEmail = emailRegex.test(trimmedValue); // Testa o e-mail
            const hasInvalidDomain = /@guest\.booking\.com$/i.test(trimmedValue); // Domínio proibido

            // Validação de formato
            if (!isValidEmail) {
                setErrorMessage("Please enter a valid email address.");
                return;
            }

            // Validação de domínio proibido
            if (hasInvalidDomain) {
                setErrorMessage("Invalid email. It cannot end with @guest.booking.com");
                return;
            }
        } else if (validation && !validation(trimmedValue)) {
            // Validação personalizada para outros campos
            setErrorMessage(`${currentLabel} is invalid. Please check the value.`);
            return;
        }

        // Se todas as validações passarem
        setErrorMessage(""); // Limpa mensagens de erro
        onSave(trimmedValue); // Salva o valor
    };

    return (
        <Modal
            isOpen={true}
            onOpenChange={onClose}
            className="z-50"
            size="lg"
            hideCloseButton={true}
        >
            <ModalContent>
                {(onCloseModal) => (
                    <>
                        <ModalHeader className="flex flex-row justify-between items-center gap-1 bg-primary text-white">
                            Edit {currentLabel}
                            <Button
                                color="transparent"
                                variant="light"
                                onClick={onCloseModal}
                                className="w-auto min-w-0 p-0 m-0"
                            >
                                <MdClose size={30} />
                            </Button>
                        </ModalHeader>
                        <ModalBody className="flex flex-col mx-5 my-5 space-y-4 text-textPrimaryColor">
                            <div>
                                <label className="block text-sm font-medium text-gray-400">{`Current ${currentLabel}:`}</label>
                                <input
                                    type="text"
                                    value={currentValue}
                                    readOnly
                                    className="w-full border border-gray-300 rounded-md px-2 py-1 bg-tableFooter text-gray-400 focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-textPrimaryColor">{`New ${currentLabel}:`}</label>
                                <input
                                    ref={inputRef} // Referencia o input
                                    type="text"
                                    value={newValue}
                                    onChange={(e) => setNewValue(e.target.value)}
                                    className="w-full border border-gray-300 rounded-md px-2 py-1 focus:outline focus:outline-black focus:ring-2 focus:ring-black"
                                />
                                {errorMessage && <p className="text-red-500 text-xs">{errorMessage}</p>}
                            </div>
                            <div className="flex justify-end space-x-2">
                                <Button color="error" onClick={onCloseModal}>
                                    Cancel
                                </Button>
                                <Button color="primary" onClick={handleSave}>
                                    Save
                                </Button>
                            </div>
                        </ModalBody>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
};

export default EditRegistrationForm;
