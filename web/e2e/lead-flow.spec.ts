import { expect, test } from "@playwright/test";

test("homepage mostra os planos", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /Nossos Planos/i })).toBeVisible();
  await expect(page.getByText("Anual à Vista")).toBeVisible();
  await expect(page.getByText("R$ 999,00")).toBeVisible();
});

test("formulário rejeita dados inválidos", async ({ page }) => {
  await page.goto("/#contacto");
  await page.getByLabel("Nome").fill("A"); // curto demais (min 2)
  await page.getByLabel("Telefone ou WhatsApp").fill("51999999999");
  await page.getByRole("button", { name: /quero começar/i }).click();
  await expect(page.getByRole("alert")).toBeVisible();
});

test("formulário envia um lead válido", async ({ page }) => {
  await page.goto("/#contacto");
  await page.getByLabel("Nome").fill("E2E Teste");
  await page.getByLabel("Telefone ou WhatsApp").fill("51999999999");
  await page.getByLabel("Plano ou modalidade de interesse").fill("E2E");
  await page.getByRole("button", { name: /quero começar/i }).click();
  await expect(page.getByText(/recebemos o teu contacto/i)).toBeVisible();
});
