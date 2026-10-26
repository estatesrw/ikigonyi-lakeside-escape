import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { validatePasswordChange } from "./password";

describe("password changes", () => {
  test("rejects mismatching passwords", () => {
    assert.notEqual(validatePasswordChange("SecureExample42", "DifferentExample42"), null);
  });
  test("rejects a short password", () => {
    assert.notEqual(validatePasswordChange("short", "short"), null);
  });
  test("accepts matching passwords of at least eight characters", () => {
    assert.equal(validatePasswordChange("SecureExample42", "SecureExample42"), null);
  });
});