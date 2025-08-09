import { describe, it, expect } from "vitest";
import {
  SearchQuerySchema,
  ProductSchema,
  CompanySchema,
  BannedIngredientSchema,
  AlternativesRequestSchema,
  validationUtils,
  sanitizeInput,
} from "@/lib/validations";

describe("Validation Schemas", () => {
  describe("SearchQuerySchema", () => {
    it("should validate valid search queries", () => {
      const validQuery = { query: "lipstick", limit: 10, offset: 0 };
      const result = SearchQuerySchema.safeParse(validQuery);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.query).toBe("lipstick");
      }
    });

    it("should reject queries with less than 3 characters", () => {
      const invalidQuery = { query: "ab" };
      const result = SearchQuerySchema.safeParse(invalidQuery);
      expect(result.success).toBe(false);
      if (!result.success) {
        const errorMessage =
          result.error.issues?.[0]?.message || result.error.message;
        expect(errorMessage).equal("Please enter at least 3 characters");
      }
    });

    it("should sanitize search queries", () => {
      const maliciousQuery = { query: '<script>alert("xss")</script>lipstick' };
      const result = SearchQuerySchema.safeParse(maliciousQuery);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.query).not.toContain("<script>");
        expect(result.data.query).toContain("lipstick");
      }
    });

    it("should apply default values", () => {
      const minimalQuery = { query: "test query" };
      const result = SearchQuerySchema.safeParse(minimalQuery);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.limit).toBe(10);
        expect(result.data.offset).toBe(0);
      }
    });
  });

  describe("ProductSchema", () => {
    const validProduct = {
      id: 1,
      notifNo: "CPNP-123456",
      name: "Test Lipstick",
      category: "Cosmetics",
      status: "Notified" as const,
      riskLevel: "safe" as const,
      dateNotified: "2023-01-01",
      isVerticallyIntegrated: false,
      recencyScore: 0.8,
    };

    it("should validate valid products", () => {
      const result = ProductSchema.safeParse(validProduct);
      expect(result.success).toBe(true);
    });

    it("should reject invalid status values", () => {
      const invalidProduct = { ...validProduct, status: "Invalid" };
      const result = ProductSchema.safeParse(invalidProduct);
      expect(result.success).toBe(false);
    });

    it("should reject invalid risk levels", () => {
      const invalidProduct = { ...validProduct, riskLevel: "invalid" };
      const result = ProductSchema.safeParse(invalidProduct);
      expect(result.success).toBe(false);
    });

    it("should sanitize product names", () => {
      const productWithHtml = { ...validProduct, name: "<b>Test</b> Lipstick" };
      const result = ProductSchema.safeParse(productWithHtml);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).not.toContain("<b>");
      }
    });

    it("should validate date format", () => {
      const invalidDateProduct = {
        ...validProduct,
        dateNotified: "01/01/2023",
      };
      const result = ProductSchema.safeParse(invalidDateProduct);
      expect(result.success).toBe(false);
    });
  });

  describe("CompanySchema", () => {
    it("should validate valid companies", () => {
      const validCompany = { id: 1, name: "Test Company Ltd." };
      const result = CompanySchema.safeParse(validCompany);
      expect(result.success).toBe(true);
    });

    it("should reject empty company names", () => {
      const invalidCompany = { id: 1, name: "" };
      const result = CompanySchema.safeParse(invalidCompany);
      expect(result.success).toBe(false);
    });

    it("should sanitize company names", () => {
      const companyWithHtml = { id: 1, name: "<script>Test</script> Company" };
      const result = CompanySchema.safeParse(companyWithHtml);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).not.toContain("<script>");
      }
    });
  });

  describe("BannedIngredientSchema", () => {
    const validIngredient = {
      id: 1,
      name: "Parabens",
      healthRiskDescription: "May cause skin irritation",
      sourceUrl: "https://example.com/source",
    };

    it("should validate valid ingredients", () => {
      const result = BannedIngredientSchema.safeParse(validIngredient);
      expect(result.success).toBe(true);
    });

    it("should reject invalid URLs", () => {
      const invalidIngredient = { ...validIngredient, sourceUrl: "not-a-url" };
      const result = BannedIngredientSchema.safeParse(invalidIngredient);
      expect(result.success).toBe(false);
    });

    it("should require health risk description", () => {
      const invalidIngredient = {
        ...validIngredient,
        healthRiskDescription: "",
      };
      const result = BannedIngredientSchema.safeParse(invalidIngredient);
      expect(result.success).toBe(false);
    });
  });

  describe("AlternativesRequestSchema", () => {
    it("should validate valid alternatives requests", () => {
      const validRequest = { excludeId: 1, category: "Cosmetics", limit: 5 };
      const result = AlternativesRequestSchema.safeParse(validRequest);
      expect(result.success).toBe(true);
    });

    it("should apply default limit", () => {
      const minimalRequest = {};
      const result = AlternativesRequestSchema.safeParse(minimalRequest);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.limit).toBe(3);
      }
    });

    it("should enforce maximum limit", () => {
      const requestWithHighLimit = { limit: 20 };
      const result = AlternativesRequestSchema.safeParse(requestWithHighLimit);
      expect(result.success).toBe(false);
    });
  });
});

describe("Validation Utils", () => {
  describe("sanitizeInput", () => {
    it("should sanitize strings by removing HTML tags", () => {
      const input = '<script>alert("xss")</script>Hello World';
      const result = sanitizeInput.string(input);
      expect(result).not.toContain("<script>");
      expect(result).toContain("Hello World");
    });

    it("should sanitize search queries", () => {
      const input = "  <script>  test   query  </script>  ";
      const result = sanitizeInput.searchQuery(input);
      expect(result).toBe("test query");
      expect(result).not.toContain("<script>");
    });

    it("should sanitize notification numbers", () => {
      const input = "cpnp-123/456-abc";
      const result = sanitizeInput.notificationNumber(input);
      expect(result).toBe("CPNP-123/456-ABC");
    });
  });

  describe("validationUtils", () => {
    it("should format Zod errors correctly", () => {
      const invalidData = { query: "ab" }; // Too short
      const result = SearchQuerySchema.safeParse(invalidData);

      if (!result.success) {
        const formattedError = validationUtils.formatZodError(result.error);
        expect(formattedError.error).toContain("3 characters");
        expect(formattedError.message).toContain("Validation failed");
      }
    });

    it("should safely validate data", () => {
      const validData = { query: "test query" };
      const result = validationUtils.safeValidate(SearchQuerySchema, validData);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.query).toBe("test query");
      }
    });

    it("should handle validation failures", () => {
      const invalidData = { query: "ab" };
      const result = validationUtils.safeValidate(
        SearchQuerySchema,
        invalidData
      );

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.error).toContain("3 characters");
      }
    });

    it("should validate required fields", () => {
      const data = { name: "Test", description: "" };
      const missing = validationUtils.validateRequired(data, [
        "name",
        "description",
        "category",
      ]);

      expect(missing).toContain("description");
      expect(missing).toContain("category");
      expect(missing).not.toContain("name");
    });
  });
});
