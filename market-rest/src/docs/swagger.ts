import swaggerJSDoc from "swagger-jsdoc";

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: "3.0.3",
    info: {
      title: "FinSight Market REST API",
      version: "1.0.0",
      description: "API documentation for the market-rest service.",
    },
    servers: [
      {
        url: "/",
        description: "Current server",
      },
    ],
    tags: [
      { name: "Health" },
      { name: "Subscription" },
      { name: "User" },
      { name: "Stock" },
      { name: "AHP Config" },
      { name: "Portfolio" },
      { name: "Stock Year Data" },
    ],
    paths: {
      "/": {
        get: {
          tags: ["Health"],
          summary: "Service welcome endpoint",
          responses: {
            "200": {
              description: "Welcome message",
            },
          },
        },
      },
      "/health": {
        get: {
          tags: ["Health"],
          summary: "Health check",
          responses: {
            "200": {
              description: "Service is healthy",
            },
          },
        },
      },
      "/api/subscription/plans": {
        get: {
          tags: ["Subscription"],
          summary: "Get all subscription plans",
          responses: {
            "200": {
              description: "List of subscription plans",
            },
          },
        },
      },
      "/api/subscription/create": {
        post: {
          tags: ["Subscription"],
          summary: "Create a subscription",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/SubscriptionDto",
                },
              },
            },
          },
          responses: {
            "201": {
              description: "Subscription created",
            },
            "400": {
              description: "Bad request",
            },
          },
        },
      },
      "/api/user/getDetail/{userId}": {
        get: {
          tags: ["User"],
          summary: "Get user detail by ID",
          parameters: [
            {
              name: "userId",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: {
            "200": { description: "User detail" },
            "404": { description: "User not found" },
          },
        },
      },
      "/api/user/favoriteStocks/{userId}": {
        get: {
          tags: ["User"],
          summary: "Get favorite stock IDs for a user",
          parameters: [
            {
              name: "userId",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: {
            "200": { description: "Favorite stock IDs" },
          },
        },
      },
      "/api/user/create": {
        post: {
          tags: ["User"],
          summary: "Create a user",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/UserDto" },
              },
            },
          },
          responses: {
            "201": { description: "User created" },
            "400": { description: "Bad request" },
          },
        },
      },
      "/api/user/update": {
        put: {
          tags: ["User"],
          summary: "Update a user",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/UserDto" },
              },
            },
          },
          responses: {
            "200": { description: "User updated" },
            "400": { description: "Bad request" },
          },
        },
      },
      "/api/user/delete": {
        delete: {
          tags: ["User"],
          summary: "Delete a user",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/UserDto" },
              },
            },
          },
          responses: {
            "200": { description: "User deleted" },
            "400": { description: "Bad request" },
          },
        },
      },
      "/api/user/updatePassword": {
        put: {
          tags: ["User"],
          summary: "Update user password",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/UserDto" },
              },
            },
          },
          responses: {
            "200": { description: "Password updated" },
            "400": { description: "Bad request" },
          },
        },
      },
      "/api/user/login": {
        post: {
          tags: ["User"],
          summary: "Login user",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/UserDto" },
              },
            },
          },
          responses: {
            "200": { description: "Login success" },
            "401": { description: "Unauthorized" },
          },
        },
      },
      "/api/user/addFavoriteStock": {
        post: {
          tags: ["User"],
          summary: "Add favorite stock",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/UserDto" },
              },
            },
          },
          responses: {
            "200": { description: "Favorite stock added" },
          },
        },
      },
      "/api/user/removeFavoriteStock": {
        post: {
          tags: ["User"],
          summary: "Remove favorite stock",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/UserDto" },
              },
            },
          },
          responses: {
            "200": { description: "Favorite stock removed" },
          },
        },
      },
      "/api/stock/get/{stockId}": {
        get: {
          tags: ["Stock"],
          summary: "Get stock by ID",
          parameters: [
            {
              name: "stockId",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: {
            "200": { description: "Stock detail" },
          },
        },
      },
      "/api/stock/getAllStocksId": {
        get: {
          tags: ["Stock"],
          summary: "Get all stock IDs",
          responses: {
            "200": { description: "Stock ID list" },
          },
        },
      },
      "/api/stock/create": {
        post: {
          tags: ["Stock"],
          summary: "Create a stock",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/StockDto" },
              },
            },
          },
          responses: {
            "201": { description: "Stock created" },
          },
        },
      },
      "/api/stock/update": {
        put: {
          tags: ["Stock"],
          summary: "Update a stock",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/StockDto" },
              },
            },
          },
          responses: {
            "200": { description: "Stock updated" },
          },
        },
      },
      "/api/stock/delete": {
        delete: {
          tags: ["Stock"],
          summary: "Delete a stock",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/StockDto" },
              },
            },
          },
          responses: {
            "200": { description: "Stock deleted" },
          },
        },
      },
      "/api/stock/updateIndustryRatios": {
        put: {
          tags: ["Stock"],
          summary: "Update stock industry ratios",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/StockDto" },
              },
            },
          },
          responses: {
            "200": { description: "Industry ratios updated" },
          },
        },
      },
      "/api/stock/recalculateValuations": {
        post: {
          tags: ["Stock"],
          summary: "Force valuation recalculation",
          responses: {
            "200": { description: "Valuation recalculation triggered" },
          },
        },
      },
      "/api/ahpConfig/get/{userId}": {
        get: {
          tags: ["AHP Config"],
          summary: "Get AHP config by user ID",
          parameters: [
            {
              name: "userId",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: {
            "200": { description: "AHP config found" },
            "404": { description: "AHP config not found" },
          },
        },
      },
      "/api/ahpConfig/create": {
        post: {
          tags: ["AHP Config"],
          summary: "Create AHP config",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AhpConfigDto" },
              },
            },
          },
          responses: {
            "201": { description: "AHP config created" },
          },
        },
      },
      "/api/ahpConfig/update": {
        put: {
          tags: ["AHP Config"],
          summary: "Update AHP config",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AhpConfigDto" },
              },
            },
          },
          responses: {
            "200": { description: "AHP config updated" },
          },
        },
      },
      "/api/stockYearData/get/{stockId}/{year}": {
        get: {
          tags: ["Stock Year Data"],
          summary: "Get stock yearly data by stock ID and year",
          parameters: [
            { name: "stockId", in: "path", required: true, schema: { type: "string" } },
            { name: "year", in: "path", required: true, schema: { type: "integer" } },
          ],
          responses: {
            "200": { description: "Stock year data" },
          },
        },
      },
      "/api/stockYearData/create/{year}": {
        post: {
          tags: ["Stock Year Data"],
          summary: "Create stock yearly data",
          parameters: [{ name: "year", in: "path", required: true, schema: { type: "integer" } }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/StockYearDataDto" },
              },
            },
          },
          responses: {
            "201": { description: "Stock year data created" },
          },
        },
      },
      "/api/stockYearData/update/{year}": {
        put: {
          tags: ["Stock Year Data"],
          summary: "Update stock yearly data",
          parameters: [{ name: "year", in: "path", required: true, schema: { type: "integer" } }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/StockYearDataDto" },
              },
            },
          },
          responses: {
            "200": { description: "Stock year data updated" },
          },
        },
      },
      "/api/stockYearData/delete": {
        delete: {
          tags: ["Stock Year Data"],
          summary: "Delete stock yearly data",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/StockYearDataDto" },
              },
            },
          },
          responses: {
            "200": { description: "Stock year data deleted" },
          },
        },
      },
      "/api/portfolio/allocate": {
        post: {
          tags: ["Portfolio"],
          summary: "Allocate portfolio",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/PortfolioAllocationRequest" },
              },
            },
          },
          responses: {
            "200": { description: "Portfolio allocation result" },
          },
        },
      },
    },
    components: {
      schemas: {
        UserDto: {
          type: "object",
          properties: {
            userId: { type: "string" },
            username: { type: "string" },
            email: { type: "string" },
            password: { type: "string" },
            phoneNumber: { type: "string" },
            isAdmin: { type: "boolean" },
            stockId: { type: "string" },
          },
          required: ["userId", "username", "email", "password", "phoneNumber", "isAdmin"],
        },
        SubscriptionDto: {
          type: "object",
          properties: {
            subscriptionId: { type: "string" },
            userId: { type: "string" },
            subscriptionPlanId: { type: "integer" },
            type: { type: "string" },
            startDate: { type: "string" },
            endDate: { type: "string" },
            status: { type: "string", enum: ["ACTIVE", "EXPIRED", "CANCELED"] },
          },
          required: [
            "subscriptionId",
            "userId",
            "subscriptionPlanId",
            "startDate",
            "endDate",
            "status",
          ],
        },
        AhpConfigDto: {
          type: "object",
          properties: {
            ahpConfigId: { type: "string" },
            userId: { type: "string" },
            criteriaJson: { type: "string" },
            pairwiseMatrixJson: { type: "string" },
            weightsJson: { type: "string" },
          },
          required: ["ahpConfigId", "userId", "criteriaJson", "pairwiseMatrixJson", "weightsJson"],
        },
        StockYearDataDto: {
          type: "object",
          properties: {
            stockId: { type: "string" },
            netIncome: { type: "number" },
            totalEquity: { type: "number" },
            intangibles: { type: "number" },
            operatingCashFlow: { type: "number" },
            freeCashFlow: { type: "number" },
            revenue: { type: "number" },
            dividendPerShare: { type: "number" },
            sharesOutstanding: { type: "number" },
            priceEndYear: { type: "number" },
            costOfEquity: { type: "number" },
            wacc: { type: "number" },
            dividendGrowthRate: { type: "number" },
            ddm: { type: "number" },
            dcf: { type: "number" },
            ri: { type: "number" },
            pe: { type: "number" },
            pbv: { type: "number" },
            pcf: { type: "number" },
            ps: { type: "number" },
          },
          required: [
            "stockId",
            "netIncome",
            "totalEquity",
            "intangibles",
            "operatingCashFlow",
            "freeCashFlow",
            "revenue",
            "dividendPerShare",
            "sharesOutstanding",
            "priceEndYear",
            "costOfEquity",
            "wacc",
            "dividendGrowthRate",
            "ddm",
            "dcf",
            "ri",
            "pe",
            "pbv",
            "pcf",
            "ps",
          ],
        },
        StockDto: {
          type: "object",
          properties: {
            stockId: { type: "string" },
            stockName: { type: "string" },
            sector: { type: "string" },
            matchPrice: { type: "number" },
            industryPeRatio: { type: "number" },
            industryPbRatio: { type: "number" },
            industryPcfRatio: { type: "number" },
            industryPsRatio: { type: "number" },
            stockYearData: { $ref: "#/components/schemas/StockYearDataDto" },
          },
          required: [
            "stockId",
            "stockName",
            "sector",
            "matchPrice",
            "industryPeRatio",
            "industryPbRatio",
            "industryPcfRatio",
            "industryPsRatio",
            "stockYearData",
          ],
        },
        PortfolioAllocationRequest: {
          type: "object",
          properties: {
            userId: { type: "string" },
            budget: { type: "number" },
            numberOfStocks: { type: "integer" },
            lotSize: { type: "integer" },
          },
          required: ["userId", "budget", "numberOfStocks"],
        },
      },
    },
  },
  apis: [],
};

export const swaggerSpec = swaggerJSDoc(options);
