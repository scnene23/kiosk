"use client"
import React from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, Button, useDisclosure } from "@heroui/react";
//imports de icons
import { MdClose } from "react-icons/md";

const ProtectionPolicyForm = ({
    buttonName,
    buttonIcon,
    modalHeader,
    formTypeModal,
    buttonColor
}) => {

    const { isOpen, onOpen, onOpenChange } = useDisclosure();

    return (<>
        {formTypeModal === 11 && ( //characteristics insert
            (<>
                <Button onPress={onOpen} color={buttonColor} className="w-fit h-6 bg-[#DFEDB6]">
                    {buttonName} {buttonIcon}
                </Button>
                <Modal
                    isOpen={isOpen}
                    hideCloseButton={true}
                    onOpenChange={onOpenChange}
                    isDismissable={false}
                    isKeyboardDismissDisabled={true}
                    className="z-50"
                    size="xl"
                >
                    <ModalContent>
                        {(onClose) => (
                            <>
                                <form>
                                    <ModalHeader className="flex flex-row justify-between items-center gap-1 bg-primary text-white">
                                        {modalHeader}
                                        <div className='flex flex-row items-center justify-end'>
                                            <Button color="transparent" variant="light" className={"w-auto min-w-0 p-0 m-0 -pr-4"} onClick={() => { onClose() }}><MdClose size={30} /></Button>
                                        </div>
                                    </ModalHeader>
                                    <ModalBody className="flex flex-col mx-5 my-5 space-y-8 max-h-96 overflow-y-auto bg-background text-textPrimaryColor">
                                        <p>
                                            
                                        </p>
                                    </ModalBody>
                                </form>

                            </>
                        )}
                    </ModalContent>
                </Modal>
            </>)
        )}
    </>);
};

export default ProtectionPolicyForm;