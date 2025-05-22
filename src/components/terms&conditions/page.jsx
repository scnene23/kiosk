"use client"
import React from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, Button, useDisclosure } from "@heroui/react";
//imports de icons
import { MdClose } from "react-icons/md";

const TermsConditionsForm = ({
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
                                            We inform you that all our rooms are Non-Smoking, therefore, according to Decree-Law 37/2007, in the event of non-compliance a fine of between €50 and €500 will be charged. We also inform you that if the limit of people per room is exceeded, the hotel reserves the right to charge a penalty of €100 per additional person.

                                            In the event of damage, theft or loss of items belonging to the Hotel, the Oporto Airport & Business Hotel reserves the right to charge the full amount of the damaged/stolen/lost items.
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

export default TermsConditionsForm;