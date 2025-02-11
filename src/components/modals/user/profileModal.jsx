"use client";
import React, { useState, useEffect } from "react";
import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    Button,
    useDisclosure,
    Switch,
} from "@heroui/react";
import { MdClose } from "react-icons/md";
import { useSession } from "next-auth/react";
import axios from "axios";
import { FaPencilAlt } from "react-icons/fa";
import PropertiesEditForm from "@/components/modals/user/propertiesEdit/page";
import ChangePIN from "@/components/modals/user/changePin/page";

import en from "../../../../public/locales/english/common.json";
import pt from "../../../../public/locales/portuguesPortugal/common.json";
import es from "../../../../public/locales/espanol/common.json";

const translations = { en, pt, es };

const ProfileModalForm = ({
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
    const { data: session } = useSession();
    const [hotels, setHotels] = useState([]);
    const [selectedHotel, setSelectedHotel] = useState(null); // Estado para armazenar a propriedade selecionada
    const [showPasswordFields, setShowPasswordFields] = useState(false);
    const [isPasswordUpdate, setIsPasswordUpdate] = useState(false);
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmNewPassword, setConfirmNewPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [statusMap, setStatusMap] = useState({});

    const [activeKey, setActiveKey] = useState("idInfo"); // Estado de controle da aba ativa

    const user = session?.user || {};
    const { firstName, secondName, email, expirationDate } = user;

    const isAdmin = user?.permission === 1; // Verifica se o usuário é admin
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

    useEffect(() => {
        const fetchHotels = async () => {
            if (user?.propertyIDs && Array.isArray(user.propertyIDs)) {
                try {
                    const response = await axios.get(
                        `/api/properties?propertyIDs=${user.propertyIDs.join(",")}`
                    );
                    const allHotels = Array.isArray(response.data.response) ? response.data.response : [];
                    const filteredHotels = allHotels.filter((hotel) =>
                        user.propertyIDs.includes(hotel.propertyID)
                    );
                    setHotels(filteredHotels);
                } catch (error) {
                    console.error("Erro ao buscar hotéis:", error);
                }
            }
        };

        fetchHotels();
    }, [user]);

    const handleEditClick = (hotel) => {
        if (isAdmin) {
            setSelectedHotel(hotel); // Armazena a propriedade clicada
            setIsModalOpen(true); // Abre o modal de edição de propriedade
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault(); // Impede o comportamento padrão do formulário
        setErrorMessage("");
        setSuccessMessage("");

        if (isPasswordUpdate) {
            if (!oldPassword || !newPassword || !confirmNewPassword) {
                setErrorMessage("Please fill in all fields.");
                return;
            }

            if (newPassword !== confirmNewPassword) {
                setErrorMessage("New passwords do not match.");
                return;
            }

            try {
                const response = await axios.patch(`/api/user/changePassword/${user.id}`, {
                    oldPassword,
                    newPassword,
                });

                if (response.status === 200) {
                    setSuccessMessage("Password updated successfully.");
                    resetForm();
                } else {
                    setErrorMessage("Failed to update password. Please try again.");
                }
            } catch (error) {
                console.error("Error updating password:", error);
                setErrorMessage(error.response?.data?.message || "An error occurred.");
            }
        }
    };

    const [loadingMap, setLoadingMap] = useState({});

    const resetForm = () => {
        setShowPasswordFields(false);
        setOldPassword("");
        setNewPassword("");
        setConfirmNewPassword("");
        setErrorMessage("");
        setSuccessMessage("");
    };

    const verifyProperties = async () => {
        // Inicializa o estado de carregamento para todos os hotéis como 'true'
        const initialLoadingMap = hotels.reduce((acc, hotel) => {
            acc[hotel.propertyID] = true; // Todos os hotéis começam em "carregando"
            return acc;
        }, {});
        setLoadingMap(initialLoadingMap);

        for (const hotel of hotels) {
            let attempts = 0;
            let success = false;

            while (attempts < 3 && !success) {
                try {
                    const hotelData = {
                        propertyServer: hotel.propertyServer,
                        propertyPort: hotel.propertyPort,
                    };
                    const response = await axios.post("/api/verifyProperty", hotelData);

                    success = response.data.success;
                    setStatusMap((prevStatusMap) => ({
                        ...prevStatusMap,
                        [hotel.propertyID]: success, // Atualiza o status do hotel
                    }));
                } catch (error) {
                    console.error(`Erro ao verificar propriedade ${hotel.propertyName}:`, error);
                    setStatusMap((prevStatusMap) => ({
                        ...prevStatusMap,
                        [hotel.propertyID]: false, // Marca o status como 'false' em caso de erro
                    }));
                }

                attempts++;
            }

            if (!success) {
                setStatusMap((prevStatusMap) => ({
                    ...prevStatusMap,
                    [hotel.propertyID]: false,
                }));
            }

            // Marca o hotel atual como "não carregando"
            setLoadingMap((prev) => ({
                ...prev,
                [hotel.propertyID]: false,
            }));

            await new Promise((resolve) => setTimeout(resolve, 1000)); // 1 segundo de atraso
        }
    };

    useEffect(() => {
        if (activeKey === "properties" && hotels.length > 0) {
            verifyProperties();
        }
    }, [activeKey, hotels]);

    return (
        <>
            {formTypeModal === 11 && (
                <>
                    <Button
                        fullWidth={true}
                        color={buttonColor}
                        size="ms"
                        onPress={onOpen}
                        className={`flex items-center gap-4 justify-start px-3 rounded-md hover:bg-background`}
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
                                    {/* Abas feitas com divs */}
                                    <div className="flex justify-center">
                                        <div className="flex flex-row justify-center bg-gray-100 w-40 h-10 rounded-xl">
                                            <div
                                                onClick={() => setActiveKey("idInfo")}
                                                className={`cursor-pointer p-2 ${activeKey === "idInfo" ? "bg-white text-black rounded-lg m-1 text-sm text-bold border border-gray-200" : "text-gray-500 m-1 text-sm"}`}
                                            >
                                                {t.modals.user.allProfiles.tabs.idInfo}
                                            </div>
                                            <div
                                                onClick={() => setActiveKey("properties")}
                                                className={`cursor-pointer p-2 ${activeKey === "properties" ? "bg-white text-black rounded-lg m-1 text-sm text-bold border border-gray-200" : "text-gray-500 m-1 text-sm"}`}
                                            >
                                                {t.modals.user.allProfiles.tabs.properties}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Conteúdo das abas */}
                                    <div>
                                        {activeKey === "idInfo" && (
                                            <div className="-mt-10 flex flex-col gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-400">{t.modals.user.allProfiles.name}</label>
                                                    <input
                                                        type="text"
                                                        value={firstName || ""}
                                                        readOnly
                                                        className="w-full border border-gray-300 rounded-md px-2 py-1 bg-tableFooter text-gray-400 focus:outline-none"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-400">{t.modals.user.allProfiles.surname}</label>
                                                    <input
                                                        type="text"
                                                        value={secondName || ""}
                                                        readOnly
                                                        className="w-full border border-gray-300 rounded-md px-2 py-1 bg-tableFooter text-gray-400 focus:outline-none"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-400">{t.modals.user.allProfiles.email}</label>
                                                    <input
                                                        type="text"
                                                        value={email || ""}
                                                        readOnly
                                                        className="w-full border border-gray-300 rounded-md px-2 py-1 bg-tableFooter text-gray-400 focus:outline-none"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-400">{t.modals.user.allProfiles.expirationDate}</label>
                                                    <input
                                                        type="text"
                                                        value={expirationDate ? new Date(expirationDate).toLocaleDateString('en-GB') : ""}
                                                        readOnly
                                                        className="w-full border border-gray-300 rounded-md px-2 py-1 bg-tableFooter text-gray-400 focus:outline-none"
                                                    />
                                                </div>
                                                {/* Botão para exibir os campos de senha */}
                                                <div className="flex flex-row justify-between">
                                                    {!showPasswordFields && (
                                                        <button
                                                            className="bg-primary text-white p-2 rounded-lg w-32 text-xs cursor-pointer"
                                                            onClick={() => {
                                                                setShowPasswordFields(true);
                                                                setIsPasswordUpdate(true);
                                                            }}
                                                        >
                                                            {t.modals.user.allProfiles.changePassword}
                                                        </button>
                                                    )}

                                                    <div className="">
                                                        <ChangePIN
                                                            buttonName={t.modals.user.allProfiles.modalHeaderPin}
                                                            modalHeader={t.modals.user.allProfiles.modalHeaderPin}
                                                            userID={user.id}
                                                        />
                                                    </div>
                                                </div>

                                                {/* Campos de Redefinição de Senha */}
                                                {showPasswordFields && (
                                                    <>
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-400">{t.modals.user.allProfiles.oldPassword}</label>
                                                            <input
                                                                type="password"
                                                                value={oldPassword}
                                                                onChange={(e) => setOldPassword(e.target.value)}
                                                                className="w-full border border-gray-300 rounded-md px-2 py-1 focus:outline-none"
                                                                required
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-400">{t.modals.user.allProfiles.newPassword}</label>
                                                            <input
                                                                type="password"
                                                                value={newPassword}
                                                                onChange={(e) => setNewPassword(e.target.value)}
                                                                className="w-full border border-gray-300 rounded-md px-2 py-1 focus:outline-none"
                                                                required
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-400">{t.modals.user.allProfiles.confirmNewPassword}</label>
                                                            <input
                                                                type="password"
                                                                value={confirmNewPassword}
                                                                onChange={(e) => setConfirmNewPassword(e.target.value)}
                                                                className="w-full border border-gray-300 rounded-md px-2 py-1 focus:outline-none"
                                                                required
                                                            />
                                                        </div>
                                                        {errorMessage && (
                                                            <p className="text-red-500 text-sm">{errorMessage}</p>
                                                        )}
                                                        {successMessage && (
                                                            <p className="text-green-500 text-sm">{successMessage}</p>
                                                        )}
                                                        <div className="flex flex-row justify-between">
                                                            <Button
                                                                type="button"
                                                                className="w-32 text-xs bg-gray-300"
                                                                onClick={() => {
                                                                    setShowPasswordFields(false);
                                                                    setIsPasswordUpdate(false);
                                                                }}
                                                            >
                                                                {t.modals.user.allProfiles.cancel}
                                                            </Button>
                                                            <Button
                                                                type="submit"
                                                                color="primary"
                                                                className="w-32 text-xs"
                                                            >
                                                                {t.modals.user.allProfiles.updatePassword}
                                                            </Button>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        )}
                                        {activeKey === "properties" && (
                                            <div>
                                                {hotels.length > 0 ? (
                                                    hotels.map((hotel) => (
                                                        <div
                                                            key={hotel.propertyID}
                                                            className="mb-4 flex flex-col items-left"
                                                        >
                                                            <label className="block text-sm font-medium text-gray-400">
                                                                {hotel.propertyName}
                                                            </label>
                                                            <div className="flex items-center gap-4">
                                                                <input
                                                                    type="text"
                                                                    value={hotel.propertyName || ""}
                                                                    readOnly
                                                                    className="w-full border border-gray-300 rounded-md px-2 py-1 bg-tableFooter text-gray-400 focus:outline-none"
                                                                />
                                                                {loadingMap[hotel.propertyID] ? (
                                                                    <div className="text-gray-400">Loading...</div>
                                                                ) : (
                                                                    <div className="flex flex-col items-center">
                                                                        <span className="text-xs text-gray-500">PMS Service</span>
                                                                        <Switch
                                                                            size="sm"
                                                                            isSelected={statusMap[hotel.propertyID]}
                                                                            onChange={() => console.log(`Switch ${hotel.propertyID} toggled`)}
                                                                        />
                                                                    </div>
                                                                )}
                                                                <FaPencilAlt
                                                                    className={`cursor-pointer ${isAdmin ? "text-primary" : "text-gray-400"}`}
                                                                    onClick={() => handleEditClick(hotel)}
                                                                    style={{ pointerEvents: isAdmin ? "auto" : "none" }}
                                                                />
                                                            </div>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <p>{t.modals.user.allProfiles.noResults}</p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </ModalBody>
                            </form>
                        </ModalContent>
                    </Modal>
                </>
            )}

            {isModalOpen && selectedHotel && (
                <PropertiesEditForm
                    hotel={selectedHotel}
                    onClose={() => setIsModalOpen(false)}
                />
            )}
        </>
    );
};

export default ProfileModalForm;
