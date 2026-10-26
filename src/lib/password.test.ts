import { describe, expect, test } from "bun:test";
import { validatePasswordChange } from "./password";

describe("password changes", () => {
  test("rejects mismatching passwords", () => {
    expect(validatePasswordChange("SecureExample42", "DifferentExample42")).not.toBeNull();
  });
  test("rejects a short password", () => {
    expect(validatePasswordChange("short", "short")).not.toBeNull();
  });
  test("accepts matching passwords of at least eight characters", () => {
    expect(validatePasswordChange("SecureExample42", "SecureExample42")).toBeNull();
  });
});