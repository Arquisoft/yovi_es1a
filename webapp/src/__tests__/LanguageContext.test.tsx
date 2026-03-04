import { render, screen, act } from "@testing-library/react";
import { describe, expect, test, beforeEach, vi } from "vitest";
import { LanguageProvider, useLanguage } from "../idiomaConf/LanguageContext"; 
import '@testing-library/jest-dom';

const TestComponent = () => {
  const { lang, setLang, t } = useLanguage();
  return (
    <div>
      <p data-testid="lang-value">{lang}</p>
      <button onClick={() => setLang("en")}>Change to EN</button>
      <p data-testid="translation">{t("jugar")}</p> 
    </div>
  );
};

describe("LanguageContext", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  test("It loads the language from localStorage on mount", () => {
    localStorage.setItem("lang", "en");
    
    render(
      <LanguageProvider>
        <TestComponent />
      </LanguageProvider>
    );

    expect(screen.getByTestId("lang-value")).toHaveTextContent("en");
  });

  test("It changes language and saves it to localStorage", async () => {
    render(
      <LanguageProvider>
        <TestComponent />
      </LanguageProvider>
    );

    const button = screen.getByText("Change to EN");
    
    await act(async () => {
      button.click();
    });

    expect(screen.getByTestId("lang-value")).toHaveTextContent("en");
    expect(localStorage.getItem("lang")).toBe("en");
  });

  test("It translates keys correctly based on the current language", () => {
    render(
      <LanguageProvider>
        <TestComponent />
      </LanguageProvider>
    );

    const translation = screen.getByTestId("translation").textContent;
    expect(translation).toBeDefined();
    expect(translation).not.toBe("jugar");
  });

  test('Test the default value of the context', () => {
  render(<TestComponent />); 
  
  expect(screen.getByTestId("translation")).toHaveTextContent("jugar");
});
});