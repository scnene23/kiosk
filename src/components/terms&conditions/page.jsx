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
                                            A Quinta da Vacaria 1616 – Vinhos, S.A (adiante designada “QV”), com sede sita na Quinta da Vacaria, 5050-364 Vilarinho dos Freires, Peso da Régua, Portugal e NIPC 50035988, é a responsável pelo tratamento.
                                            Os dados pessoais recolhidos serão utilizados unicamente para registo na newsletter da QV após obtermos o seu consentimento prévio e expresso, e para que possamos enviar-lhe outras publicações que nos pediu e/ou que possam ser do seu interesse, nomeadamente, ofertas especiais ou informar sobre atualizações do website.
                                            O seu “email” é de preenchimento obrigatório para podermos enviar a newsletter, pelo que sem este dado não poderemos realizar o seu pedido. Por sua vez, o seu “nome”, permitem-nos personalizar comunicação.
                                            Os dados em questão não serão utilizados para nenhuma outra finalidade sem o seu consentimento prévio, sem ser informado previamente e quando necessário recolhido o seu consentimento, sendo conservados pela QV durante 2 anos.
                                            Relembramos que poderá retirar o presente consentimento a qualquer momento.
                                            Quando nos envia os seus dados pessoais, estes serão protegidos através de protocolos de segurança adequados às comunicações via internet e serão conservados num servidor seguro e de acesso condicionado.
                                            A QV poderá comunicar os dados pessoais identificados ao(s) seu(s) prestador(es) de serviços para cumprimento da finalidade descrita.
                                            Poderá exercer os seus direitos previstos na legislação (acesso, retificação, apagamento, limitação, oposição, portabilidade) através de contacto escrito para o seguinte e-mail: geral@quintadavacaria.pt, sem prejuízo do direito a apresentar reclamação à autoridade de controlo competente (www.cnpd.pt).
                                            Saiba mais sobre a forma como os seus dados serão tratados Política de Privacidade ou através do e-mail: geral@quintadavacaria.pt
                                            A Quinta da Vacaria 1616 – Vinhos, S.A (adiante designada “QV”), com sede sita na Quinta da Vacaria, 5050-364 Vilarinho dos Freires, Peso da Régua, Portugal e NIPC 50035988, é a responsável pelo tratamento.
                                            Os dados pessoais recolhidos serão utilizados unicamente para registo na newsletter da QV após obtermos o seu consentimento prévio e expresso, e para que possamos enviar-lhe outras publicações que nos pediu e/ou que possam ser do seu interesse, nomeadamente, ofertas especiais ou informar sobre atualizações do website.
                                            O seu “email” é de preenchimento obrigatório para podermos enviar a newsletter, pelo que sem este dado não poderemos realizar o seu pedido. Por sua vez, o seu “nome”, permitem-nos personalizar comunicação.
                                            Os dados em questão não serão utilizados para nenhuma outra finalidade sem o seu consentimento prévio, sem ser informado previamente e quando necessário recolhido o seu consentimento, sendo conservados pela QV durante 2 anos.
                                            Relembramos que poderá retirar o presente consentimento a qualquer momento.
                                            Quando nos envia os seus dados pessoais, estes serão protegidos através de protocolos de segurança adequados às comunicações via internet e serão conservados num servidor seguro e de acesso condicionado.
                                            A QV poderá comunicar os dados pessoais identificados ao(s) seu(s) prestador(es) de serviços para cumprimento da finalidade descrita.
                                            Poderá exercer os seus direitos previstos na legislação (acesso, retificação, apagamento, limitação, oposição, portabilidade) através de contacto escrito para o seguinte e-mail: geral@quintadavacaria.pt, sem prejuízo do direito a apresentar reclamação à autoridade de controlo competente (www.cnpd.pt).
                                            Saiba mais sobre a forma como os seus dados serão tratados Política de Privacidade ou através do e-mail: geral@quintadavacaria.pt
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