"use client"
import React from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, Button } from "@heroui/react";
import { MdClose } from "react-icons/md";

const ErrorRegistrationForm = ({
    modalHeader,
    errorMessage,
    onClose
}) => {
    // Divide a mensagem de erro em uma lista de erros
    const errorMessages = errorMessage.split("\n");

    return (
        <Modal
            isOpen={!!errorMessage} // O modal só estará aberto quando houver erro
            onOpenChange={onClose} // Fecha o modal quando o estado mudar
            hideCloseButton={true} // Oculta o botão de fechar (já que o erro se fecha com a ação do usuário)
            isDismissable={false} // O modal não pode ser fechado clicando fora
            isKeyboardDismissDisabled={true} // Desativa o fechamento com ESC
            size="md"
            className="z-50"
        >
            <ModalContent>
                <ModalHeader className="flex flex-row w-full !justify-between items-center bg-primary text-white gap-1 text-lg py-1 ">
                    {modalHeader}
                    <Button color="transparent" variant="light" className={"-mr-4"} onClick={onClose}>
                        <MdClose size={25} />
                    </Button>
                </ModalHeader>
                <ModalBody className="flex flex-col mx-1 my-5 space-y-8 max-h-96 overflow-y-auto text-textPrimaryColor">
                    {/* Renderiza cada erro em uma lista */}
                    <ul>
                        {errorMessages.map((msg, index) => (
                            <li key={index}>{msg}</li>
                        ))}
                    </ul>
                </ModalBody>
            </ModalContent>
        </Modal>
    );
};

export default ErrorRegistrationForm;
