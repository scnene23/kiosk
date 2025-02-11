"use client";
import React from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, Button } from "@heroui/react";
//imports de icons
import { MdClose } from "react-icons/md";
import { Tabs, Tab } from "@heroui/react";

const DepartureInfoForm = ({
    modalHeader,
    editIcon,
    modalEditArrow,
    modalEdit,
    formTypeModal,
    roomNumber,
    dateCO,
    booker,
    salutation,
    lastName,
    firstName,
    roomType,
    resStatus,
    childs,
    adults,
    balance,
    country,
    isOpen,
    onClose,
}) => {

    return (
        <>
            {formTypeModal === 11 && (
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
                                    <form>
                                        <ModalHeader className="flex flex-row !justify-between items-center gap-1 bg-primary text-white p-2">
                                            <div className="flex flex-row justify-start gap-4 pl-4">
                                                {editIcon} {modalHeader} {modalEditArrow} {modalEdit}
                                            </div>
                                            <div className='flex flex-row items-center'>
                                                <Button color="transparent" variant="light" className="w-auto min-w-0 p-0 m-0" onClick={() => onClose()}>
                                                    <MdClose size={30} />
                                                </Button>
                                            </div>
                                        </ModalHeader>
                                        <ModalBody className="flex flex-col space-y-8 bg-background">
                                            <Tabs aria-label="Options" className="flex justify-center">
                                                <Tab key="reservation" title="Reservation">
                                                    {/* Exibindo Room Number e DateCO */}
                                                    <div className="-mt-8 flex flex-col gap-5">
                                                        <div className="flex justify-between text-textPrimaryColor">
                                                            <p><strong>Room</strong></p>
                                                            <p>{roomNumber}</p>
                                                        </div>
                                                        <div className="flex justify-between text-textPrimaryColor">
                                                            <p><strong>RoomType</strong></p>
                                                            <p>{roomType}</p>
                                                        </div>
                                                        <div className="flex justify-between text-textPrimaryColor">
                                                            <p><strong>Status</strong></p>
                                                            <p>{resStatus}</p>
                                                        </div>
                                                        <div className="flex justify-between text-textPrimaryColor">
                                                            <p><strong>Departure</strong></p>
                                                            <p>{dateCO}</p>
                                                        </div>
                                                        <div className="flex justify-between text-textPrimaryColor">
                                                            <p><strong>Adults</strong></p>
                                                            <p>{adults}</p>
                                                        </div>
                                                        <div className="flex justify-between text-textPrimaryColor">
                                                            <p><strong>Childs</strong></p>
                                                            <p>{childs}</p>
                                                        </div>
                                                        <div className="flex justify-between text-textPrimaryColor">
                                                            <p><strong>Balance</strong></p>
                                                            <p>{balance}</p>
                                                        </div>
                                                    </div>
                                                </Tab>
                                                <Tab key="profiles" title="Profiles">
                                                    <div className="-mt-8 flex flex-col gap-4">
                                                        <p className="text-gray-400">TRAVEL AGENCY</p>
                                                        <p className="text-textPrimaryColor">{booker}</p>
                                                    </div>
                                                    <div className="mt-10 flex flex-col gap-4">
                                                        <p className="text-gray-400">COUNTRY</p>
                                                        <p className="text-textPrimaryColor">{country}</p>
                                                    </div>
                                                    <div className="mt-10 flex flex-col gap-4">
                                                        <p className="text-gray-400">GUESTS</p>
                                                        <p className="text-textPrimaryColor">{salutation}
                                                            {lastName && firstName
                                                                ? `${lastName}, ${firstName}`
                                                                : lastName || firstName}
                                                        </p>
                                                    </div>
                                                </Tab>
                                            </Tabs>
                                        </ModalBody>
                                    </form>
                                </>
                            )}
                        </ModalContent>
                    </Modal>
                </>
            )}
        </>
    );
};

export default DepartureInfoForm;
