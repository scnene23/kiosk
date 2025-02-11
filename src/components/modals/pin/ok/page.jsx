"use client";
import React, { useState, useEffect } from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, Button, useDisclosure } from "@heroui/react";
import { MdClose } from "react-icons/md";
import axios from "axios";
import { useRouter } from "next/navigation";
import bcrypt from "bcryptjs";

const isDesktop = () => {
    if (typeof window !== "undefined") {
        return window.innerWidth >= 2000; // Define dispositivos desktop como largura maior ou igual a 1024px
    }
    return false;
};

const OkPIN = ({
    buttonName,
    buttonIcon,
    modalHeader,
    editIcon,
    modalEditArrow,
    modalEdit,
    formTypeModal,
}) => {
    const [pin, setPin] = useState(""); // Estado para o pin
    const [isPinError, setIsPinError] = useState(false);
    const [userPinHash, setUserPinHash] = useState(""); // Estado para o hash do pin do usuário logado
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const router = useRouter();
    const [propertyID, setPropertyID] = useState("");
    console.log(propertyID);
    const [autoFocusEnabled, setAutoFocusEnabled] = useState(false);

    useEffect(() => {
        // Verifica se é desktop no carregamento da página
        setAutoFocusEnabled(isDesktop());
    }, []);

    useEffect(() => {
        const checkSession = async () => {
            if (status === "loading") return;

            if (!session) {
                router.push("/auth");
            } else {
                const userPropertyID = localStorage.getItem("recordPropertyID");
                console.log(session.user);
                const userPinHash = session?.user?.pin; // Supondo que o pin armazenado é o hash
                setPropertyID(userPropertyID);
                setUserPinHash(userPinHash); // Armazena o hash do pin
            }
        };

        checkSession();
    }, [session, status, router]);

      const [selectedHotelID, setSelectedHotelID] = useState(""); // Estado do Hotel ID
    
        // Recupera o Hotel ID do localStorage ao carregar a página
        useEffect(() => {
            const savedHotelID = localStorage.getItem("selectedHotelID"); // Busca o ID salvo
            if (savedHotelID) {
                setSelectedHotelID(savedHotelID); // Define o ID no estado
            } else {
                setSelectedHotelID("defaultHotelID"); // ID padrão, caso não haja nenhum salvo
            }
        }, []); // Executa apenas uma vez no carregamento
        
    const handlePinSubmit = async (e) => {
        if (e) e.preventDefault();
        // Captura os parâmetros da URL
        const queryParams = new URLSearchParams(window.location.search);
        const recordID = queryParams.get("recordID");
        console.log(recordID);

        try {
            const isPinCorrect = await bcrypt.compare(pin, userPinHash);
            if (isPinCorrect) {
                await axios.patch(`/api/get_jsons/${recordID}`);
                router.push(`/homepage/frontOfficeView/${selectedHotelID}`);
            } else {
                setPin("");
                setIsPinError(true);
            }
        } catch (error) {
            console.error("Erro ao marcar como visto:", error);
        }
    };

    // const handleCancelPinSubmit = async (e) => {
    //     if (e) e.preventDefault();
    //     const recordID = localStorage.getItem("recordID");

    //     try {
    //         const isPinCorrect = await bcrypt.compare(pin, userPinHash);
    //         if (isPinCorrect) {
    //             router.push("/");
    //         } else {
    //             setIsPinError(true);
    //         }
    //     } catch (error) {
    //         console.error("Erro ao cancelar:", error);
    //     }
    // };

    const handleModalOpenChange = (isOpen) => {
        onOpenChange(isOpen);
        setPin("");
        setIsPinError(false);
    };

    return (
        <>
            {formTypeModal === 11 && (
                <>
                    <Button fullWidth={true} size="ms" onPress={onOpen} color="primary" className="bg-primary text-white font-semibold p-2 rounded-lg w-[10px]">
                        {buttonName} {buttonIcon}
                    </Button>
                    <Modal
                        isOpen={isOpen}
                        hideCloseButton={true}
                        onOpenChange={handleModalOpenChange}
                        isDismissable={true}
                        isKeyboardDismissDisabled={false}
                        className="z-50"
                        size="sm"
                    >
                        <ModalContent>
                            {(onClose) => (
                                <form onSubmit={handlePinSubmit}>
                                    <ModalHeader className="flex flex-row justify-between items-center gap-1 bg-primary text-white p-2">
                                        <div className="flex flex-row justify-start gap-4 pl-4">
                                            {editIcon} {modalHeader} {modalEditArrow} {modalEdit}
                                        </div>
                                        <div className="flex flex-row items-center justify-end">
                                            <Button color="transparent" variant="light" className="w-auto min-w-0 p-0 m-0 -pr-4" onClick={() => onClose()}>
                                                <MdClose size={30} />
                                            </Button>
                                        </div>
                                    </ModalHeader>
                                    <ModalBody className="flex flex-col mx-5 my-2">
                                        <input
                                            type="password"
                                            value={pin}
                                            autoFocus={autoFocusEnabled}
                                            onChange={(e) => {
                                                setPin(e.target.value);
                                                setIsPinError(false); // Reseta o erro ao digitar
                                            }}
                                            className="border border-gray-300 p-2 w-full text-center mb-4 text-textPrimaryColor"
                                            placeholder="• • • •"
                                        />
                                        {isPinError && (
                                            <p className="text-red-500 -mt-4">
                                                Incorrect PIN. Try again.
                                            </p>
                                        )}

                                        <div className="grid grid-cols-3 gap-2">
                                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, "C", 0, "OK"].map((key) => (
                                                <button
                                                    key={key}
                                                    type="button"
                                                    onClick={() => {
                                                        if (key === "C") {
                                                            setPin("");
                                                            setIsPinError(false);
                                                        } else if (key === "OK") {
                                                            handlePinSubmit();
                                                        } else {
                                                            setPin((prevPin) => prevPin + key.toString());
                                                            setIsPinError(false);
                                                        }
                                                    }}
                                                    className={`p-4 rounded ${key === "C" ? "bg-mediumGray text-textPrimaryColor" : key === "OK" ? "bg-primary text-white" : "bg-lightGray text-textPrimaryColor"
                                                        } text-center font-bold`}
                                                >
                                                    {key}
                                                </button>
                                            ))}
                                        </div>
                                    </ModalBody>
                                </form>
                            )}
                        </ModalContent>
                    </Modal>
                </>
            )}
        </>
    );
};

export default OkPIN;
