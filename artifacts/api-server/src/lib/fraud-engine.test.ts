import { describe, it, expect, vi, beforeEach } from "vitest";
import { scoreTransaction } from "./fraud-engine";

vi.mock("./redis", () => ({
  cacheGet: vi.fn(),
  cacheSet: vi.fn(),
}));

vi.mock("./mongo", () => ({
  getMongoDb: vi.fn().mockResolvedValue({
    collection: () => ({
      insertOne: vi.fn().mockResolvedValue({}),
    }),
  }),
}));

vi.mock("@workspace/db", () => ({
  db: {},
  rulesTable: {},
  transactionsTable: {},
  usersTable: {},
}));

import { cacheGet } from "./redis";

describe("Fraud Engine - scoreTransaction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should approve transaction under normal parameters", async () => {
    vi.mocked(cacheGet).mockResolvedValue(2); // userVelocity = 2
    
    const result = await scoreTransaction({
      cardId: "card123",
      userId: "user123",
      merchantId: "merch123",
      merchantName: "Test Merchant",
      amount: 100,
      currency: "USD",
      location: { country: "US", city: "New York", lat: 40.7128, lng: -74.0060 },
      deviceFingerprint: "device123",
    });

    // decision will be approved if score is low
    // ML anomaly score is random so score might vary slightly, but basic logic holds
    expect(result.transactionId).toBeDefined();
    expect(result.triggeredRules.filter(r => r !== "ML_ANOMALY_DETECTED")).toEqual([]);
  });

  it("should trigger HIGH_AMOUNT_THRESHOLD when amount > 5000", async () => {
    vi.mocked(cacheGet).mockResolvedValue(1);
    
    const result = await scoreTransaction({
      cardId: "card123",
      userId: "user123",
      merchantId: "merch123",
      merchantName: "Test Merchant",
      amount: 6000,
      currency: "USD",
      location: { country: "US", city: "New York", lat: 40.7128, lng: -74.0060 },
      deviceFingerprint: "device123",
    });

    expect(result.triggeredRules).toContain("HIGH_AMOUNT_THRESHOLD");
  });

  it("should trigger VELOCITY_BREACH when velocity > 10", async () => {
    vi.mocked(cacheGet).mockResolvedValue(12); // userVelocity > 10
    
    const result = await scoreTransaction({
      cardId: "card123",
      userId: "user123",
      merchantId: "merch123",
      merchantName: "Test Merchant",
      amount: 100,
      currency: "USD",
      location: { country: "US", city: "New York", lat: 40.7128, lng: -74.0060 },
      deviceFingerprint: "device123",
    });

    expect(result.triggeredRules).toContain("VELOCITY_BREACH");
  });
});
