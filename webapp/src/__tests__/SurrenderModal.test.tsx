import { render, screen, fireEvent } from "@testing-library/react";
import SurrenderModal from "../components/SurrenderModal";
import { useLanguage } from "../idiomaConf/LanguageContext";
import { vi, describe, it, expect, beforeEach } from "vitest";

vi.mock("../idiomaConf/LanguageContext", () => ({
  useLanguage: vi.fn(),
}));

describe("SurrenderModal", () => {
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

  beforeEach(() => {
    (useLanguage as unknown as vi.Mock).mockReturnValue({ t: mockT });
  });

  it("no renderiza nada si isOpen es false", () => {
    render(
      <SurrenderModal
        isOpen={false}
        onConfirm={() => {}}
        onCancel={() => {}}
      />
    );
    expect(screen.queryByText(/¿Confirmar rendición/i)).toBeNull();
  });


  it("llama a onCancel cuando se hace click en Cancelar", () => {
    const onCancel = vi.fn();
    render(
      <SurrenderModal
        isOpen={true}
        onConfirm={() => {}}
        onCancel={onCancel}
      />
    );
    fireEvent.click(screen.getByText("Cancelar"));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("llama a onConfirm cuando se hace click en Sí, rendirse", () => {
    const onConfirm = vi.fn();
    render(
      <SurrenderModal
        isOpen={true}
        onConfirm={onConfirm}
        onCancel={() => {}}
      />
    );
    fireEvent.click(screen.getByText("Sí, rendirse"));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });
});