import { render, screen, fireEvent } from "@testing-library/react";
import SurrenderModal from "../components/SurrenderModal";

const mockT = (key: string) => {
  const translations: Record<string, string> = {
    confirmSurrender: "¿Confirmar rendición?",
    estasSeg: "¿Estás seguro?",
    perderas: "Perderás la partida",
    cancel: "Cancelar",
    siRend: "Sí, rendirse",
  };
  return translations[key] || key;
};

const MockedSurrenderModal = (props: any) => {
  const useLanguage = () => ({ t: mockT });
  return <SurrenderModal {...props} useLanguage={useLanguage} />;
};

describe("SurrenderModal", () => {
  it("no renderiza nada si isOpen es false", () => {
    render(<MockedSurrenderModal isOpen={false} onConfirm={() => {}} onCancel={() => {}} />);
    expect(screen.queryByText(/¿Confirmar rendición/i)).toBeNull();
  });

  it("llama a onCancel cuando se hace click en Cancelar", () => {
    let cancelCalled = false;
    const onCancel = () => { cancelCalled = true; };
    render(<MockedSurrenderModal isOpen={true} onConfirm={() => {}} onCancel={onCancel} />);
    fireEvent.click(screen.getByText("cancel"));
    expect(cancelCalled).toBe(true);
  });

  it("llama a onConfirm cuando se hace click en Sí, rendirse", () => {
    let confirmCalled = false;
    const onConfirm = () => { confirmCalled = true; };
    render(<MockedSurrenderModal isOpen={true} onConfirm={onConfirm} onCancel={() => {}} />);
    fireEvent.click(screen.getByText("siRend"));
    expect(confirmCalled).toBe(true);
  });
});