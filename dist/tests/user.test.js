import request from "supertest";
import app from "../app.js";

beforeAll(() => {});

afterAll(() => {});

describe("Sample", () => {
  it("Sum", () => {
    expect(1 + 1).toEqual(2);
    expect(1 + 1 == 2).toBeTruthy();
  });

  it("Test api calling", async () => {
    const res = await request(app)
      .get("/");

    expect(res.statusCode).toEqual(200);
  });
});
