"use client";
import React, { useState, useEffect } from "react";
import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    Button,
    Switch,
} from "@heroui/react";
import { MdClose } from "react-icons/md";
import { useSession } from "next-auth/react";
import axios from "axios";
import { FaPencilAlt, FaSave } from 'react-icons/fa';
import PropertiesEditForm from "@/components/modals/user/propertiesEdit/page";
import ChangePIN from "@/components/modals/user/changePin/page";
import { FaPlus } from "react-icons/fa";
import UserPropertiesModal from "@/components/modals/user/allProfiles/userProperties/page";

import en from "../../../../../public/locales/english/common.json";
import pt from "../../../../../public/locales/portuguesPortugal/common.json";
import es from "../../../../../public/locales/espanol/common.json";

const translations = { en, pt, es };

const ProfileModalEditForm = ({
    modalHeader,
    editIcon,
    modalEditArrow,
    modalEdit,
    formTypeModal,
    isOpen, // Recebe o controle de abertura como prop
    onClose,
    firstName,
    secondName,
    email,
    userID, // Função de fechamento como prop
    expirationDate,
}) => {

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
    const [loading, setLoading] = useState(true); // Estado de carregamento

    const user = session?.user || {};

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
        const fetchPropertiesAndHotels = async () => {
            if (userID) {  // Certifique-se de que user.userID está disponível
                try {
                    // Busque os propertyIDs associados ao userID
                    const propertiesResponse = await axios.get(`/api/user/userProperties/${userID}`);
                    const propertyIDs = propertiesResponse.data.propertyIDs;

                    if (Array.isArray(propertyIDs) && propertyIDs.length > 0) {
                        // Use os propertyIDs para buscar os hotéis
                        const hotelsResponse = await axios.get(
                            `/api/properties?propertyIDs=${propertyIDs.join(",")}`
                        );

                        const allHotels = Array.isArray(hotelsResponse.data.response)
                            ? hotelsResponse.data.response
                            : [];

                        const filteredHotels = allHotels.filter((hotel) =>
                            propertyIDs.includes(hotel.propertyID)
                        );

                        setHotels(filteredHotels);
                    } else {
                        console.log("Nenhuma propriedade associada ao usuário.");
                    }
                } catch (error) {
                    console.error("Erro ao buscar propriedades ou hotéis:", error);
                }
            }
        };

        fetchPropertiesAndHotels();
    }, [userID]);

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
                const response = await axios.patch(`/api/user/changePassword/${userID}`, {
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

    const resetForm = () => {
        setShowPasswordFields(false);
        setOldPassword("");
        setNewPassword("");
        setConfirmNewPassword("");
        setErrorMessage("");
        setSuccessMessage("");
    };

    // Função para verificar propriedades
    const verifyProperties = async () => {
        setLoading(true); // Começa o carregamento
        const newStatusMap = { ...statusMap };
        for (const hotel of hotels) {
            try {
                const hotelData = {
                    propertyServer: hotel.propertyServer,
                    propertyPort: hotel.propertyPort,
                };
                const response = await axios.post("/api/verifyProperty", hotelData);
                newStatusMap[hotel.propertyID] = response.data.success;
            } catch (error) {
                console.error(`Erro ao verificar propriedade ${hotel.propertyName}:`, error);
                newStatusMap[hotel.propertyID] = false;
            }
        }
        setStatusMap(newStatusMap);
        setLoading(false); // Finaliza o carregamento
    };

    useEffect(() => {
        if (activeKey === "properties" && hotels.length > 0) {
            verifyProperties();
        }
    }, [activeKey, hotels]);

    const [isEditingExpDate, setIsEditingExpDate] = useState(false);  // Estado para controle do modo de edição da data de expiração
    const [newExpirationDate, setNewExpirationDate] = useState(expirationDate ? new Date(expirationDate).toLocaleDateString('en-GB') : "");
    const [error, setError] = useState(null);

    const handleEditExpirationDateClick = () => {
        if (isAdmin) {
            setIsEditingExpDate(true);  // Habilita a edição ao clicar no lápis
        }
    };

    const handleSaveExpirationDate = async () => {
        if (!newExpirationDate) {
            setError('Expiration date cannot be empty.');
            return;
        }

        try {
            setLoading(true);
            const response = await axios.patch(`/api/user/expirationDate/${userID}`, {
                expirationDate: newExpirationDate,  // Envia a data de expiração editada
            });

            if (response.status === 200) {
                setIsEditingExpDate(false);  // Desativa o modo de edição após salvar
                setError('');
            } else {
                setError('Failed to update expiration date.');
            }
        } catch (error) {
            console.error('Error updating expiration date:', error);
            setError('An error occurred while updating the expiration date.');
        } finally {
            setLoading(false);
        }
    };

    const handleExpirationDateChange = (e) => {
        setNewExpirationDate(e.target.value);  // Atualiza a data enquanto o usuário edita
    };

    return (
        <>
            {formTypeModal === 11 && isOpen && (
                <>
                    <Modal
                        isOpen={isOpen}
                        hideCloseButton={true}
                        onOpenChange={onClose}
                        isDismissable={false}
                        isKeyboardDismissDisabled={true}
                        className="z-50"
                        size="sm"
                        backdrop="transparent"
                    >
                        <ModalContent>
                            {(onClose) => (
                                <>
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
                                                    onClick={onClose}
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
                                                            <div className="flex flex-row gap-2 items-center">
                                                                <input
                                                                    type="text"
                                                                    value={newExpirationDate}
                                                                    onChange={handleExpirationDateChange}  // Atualiza o valor enquanto edita
                                                                    readOnly={!isEditingExpDate}  // Se não estiver editando, o campo é somente leitura
                                                                    className={`w-full border border-gray-300 rounded-md px-2 py-1 ${isEditingExpDate ? 'bg-white' : 'bg-tableFooter text-gray-400'} focus:outline-none`}
                                                                />
                                                                {/* Exibição do ícone de lápis ou disquete dependendo do estado de edição */}
                                                                {isEditingExpDate ? (
                                                                    <FaSave
                                                                        className={`cursor-pointer ${isAdmin ? "text-primary" : "text-gray-400"}`}
                                                                        onClick={handleSaveExpirationDate}  // Salva os dados ao clicar no ícone de disquete
                                                                        style={{ pointerEvents: isAdmin ? "auto" : "none" }}
                                                                    />
                                                                ) : (
                                                                    <FaPencilAlt
                                                                        className={`cursor-pointer ${isAdmin ? "text-primary" : "text-gray-400"}`}
                                                                        onClick={handleEditExpirationDateClick}  // Ativa a edição ao clicar no ícone de lápis
                                                                        style={{ pointerEvents: isAdmin ? "auto" : "none" }}
                                                                    />
                                                                )}
                                                            </div>
                                                            {error && <p className="text-red-500 text-sm">{error}</p>}
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
                                                        <div className="flex justify-end">
                                                            <div className="flex flex-row justify-center -mt-4">
                                                                <UserPropertiesModal
                                                                    buttonIcon={<FaPlus
                                                                        className={`cursor-pointer ${isAdmin ? "text-white" : "text-gray-400"}`}
                                                                        style={{ pointerEvents: isAdmin ? "auto" : "none" }}
                                                                    />}
                                                                    formTypeModal={11}
                                                                    modalHeader={t.modals.user.allProfiles.modalHeaderProp}
                                                                    userID={userID}
                                                                />
                                                            </div>
                                                        </div>
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
                                                                        {loading ? (
                                                                            <div className="text-gray-400">Loading...</div>
                                                                        ) : (
                                                                            <Switch
                                                                                size="sm"
                                                                                isSelected={statusMap[hotel.propertyID]}
                                                                                onChange={() => console.log(`Switch ${hotel.propertyID} toggled`)}
                                                                            />
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
                                </>
                            )}
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

export default ProfileModalEditForm;
