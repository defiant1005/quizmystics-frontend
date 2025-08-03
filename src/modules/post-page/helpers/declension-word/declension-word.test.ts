import declensionWord from "./declension-word";

describe("declension-word", () => {
  test("0 баллов", () => {
    expect(declensionWord(0, "баллов", "балл", "балла")).toBe("баллов");
  });
  test("1 балл", () => {
    expect(declensionWord(1, "баллов", "балл", "балла")).toBe("балл");
  });
  test("23 балла", () => {
    expect(declensionWord(23, "баллов", "балл", "балла")).toBe("балла");
  });
});
