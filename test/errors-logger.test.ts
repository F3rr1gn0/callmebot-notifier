import { describe, expect, it, vi } from "vitest";
import { CallMeBotError, HttpError, RetryExhaustedError, ValidationError } from "../src/errors.js";
import { createLogger } from "../src/logger.js";

describe("errors and logger", () => {
  it("creates typed errors", () => {
    expect(new CallMeBotError("x").code).toBe("CALLMEBOT_ERROR");
    expect(new ValidationError("x").name).toBe("ValidationError");
    expect(new HttpError("x", 500).status).toBe(500);
    expect(new RetryExhaustedError("x").code).toBe("RETRY_EXHAUSTED");
  });

  it("respects log level", () => {
    const log = { error: vi.fn(), warn: vi.fn(), info: vi.fn(), debug: vi.fn() };
    const logger = createLogger(log, "warn");
    logger.error("e");
    logger.warn("w");
    logger.info("i");
    logger.debug("d");
    expect(log.error).toHaveBeenCalled();
    expect(log.warn).toHaveBeenCalled();
    expect(log.info).not.toHaveBeenCalled();
    expect(log.debug).not.toHaveBeenCalled();
  });

  it("drops logs in silent mode", () => {
    const log = { error: vi.fn(), warn: vi.fn(), info: vi.fn(), debug: vi.fn() };
    const logger = createLogger(log, "silent");
    logger.error("e");
    logger.warn("w");
    logger.info("i");
    logger.debug("d");
    expect(log.error).not.toHaveBeenCalled();
    expect(log.warn).not.toHaveBeenCalled();
    expect(log.info).not.toHaveBeenCalled();
    expect(log.debug).not.toHaveBeenCalled();
  });
});
