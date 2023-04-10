import * as core from "@actions/core";
import { mocked } from "jest-mock";
import mockedEnv from "mocked-env";
import nock from "nock";

import { ConfigError } from "../src/exceptions/ConfigError";
import { WPVCConfig } from "../src/wpvc-config";

jest.mock("@actions/core");

describe("Mocked env variables", () => {
  let restore: () => void;

  beforeEach(() => {
    restore = mockedEnv({ GITHUB_REPOSITORY: "OWNER/REPO" });
    mocked(core).getInput.mockReturnValue("GH_TOKEN");
  });
  afterEach(() => {
    restore();
  });

  test("WPVCConfig works correctly", async () => {
    expect.assertions(1);
    const config = {
      readme: "path/to/readme.txt",
      assignees: [],
    };

    nock("https://api.github.com")
      .get("/repos/OWNER/REPO/contents/.wordpress-version-checker.json")
      .reply(200, {
        content: Buffer.from(JSON.stringify(config)).toString("base64"),
      });

    await expect(WPVCConfig()).resolves.toStrictEqual(config);
  });

  test("WPVCConfig works correctly with assignees", async () => {
    expect.assertions(1);
    const config = {
      readme: "path/to/readme.txt",
      assignees: ["PERSON1", "PERSON2"],
    };

    nock("https://api.github.com")
      .get("/repos/OWNER/REPO/contents/.wordpress-version-checker.json")
      .reply(200, {
        content: Buffer.from(JSON.stringify(config)).toString("base64"),
      });

    await expect(WPVCConfig()).resolves.toStrictEqual(config);
  });

  test("WPVCConfig fails gracefully on connection issues", async () => {
    expect.assertions(1);
    await expect(WPVCConfig()).rejects.toThrow(ConfigError);
  });

  test("WPVCConfig returns null on no config", async () => {
    expect.assertions(1);
    nock("https://api.github.com")
      .get("/repos/OWNER/REPO/contents/.wordpress-version-checker.json")
      .reply(404);

    await expect(WPVCConfig()).resolves.toBeNull();
  });

  test("WPVCConfig fails gracefully on invalid response", async () => {
    expect.assertions(1);
    nock("https://api.github.com")
      .get("/repos/OWNER/REPO/contents/.wordpress-version-checker.json")
      .reply(200);

    await expect(WPVCConfig()).rejects.toThrow(ConfigError);
  });

  test("WPVCConfig fails gracefully on invalid response 2", async () => {
    expect.assertions(1);
    nock("https://api.github.com")
      .get("/repos/OWNER/REPO/contents/.wordpress-version-checker.json")
      .reply(200, {
        content: "OOPS",
      });

    await expect(WPVCConfig()).rejects.toThrow(ConfigError);
  });

  test("WPVCConfig fails gracefully on invalid config", async () => {
    expect.assertions(1);
    const config = {
      readme_incorrect: "path/to/readme.txt",
    };

    nock("https://api.github.com")
      .get("/repos/OWNER/REPO/contents/.wordpress-version-checker.json")
      .reply(200, {
        content: Buffer.from(JSON.stringify(config)).toString("base64"),
      });

    await expect(WPVCConfig()).rejects.toThrow(ConfigError);
  });

  test("WPVCConfig fails gracefully on invalid config 2", async () => {
    expect.assertions(1);

    nock("https://api.github.com")
      .get("/repos/OWNER/REPO/contents/.wordpress-version-checker.json")
      .reply(200, {
        content: Buffer.from(JSON.stringify(false)).toString("base64"),
      });

    await expect(WPVCConfig()).rejects.toThrow(ConfigError);
  });

  test("WPVCConfig fails gracefully on invalid config 3", async () => {
    expect.assertions(1);
    const config = {
      readme: false,
    };

    nock("https://api.github.com")
      .get("/repos/OWNER/REPO/contents/.wordpress-version-checker.json")
      .reply(200, {
        content: Buffer.from(JSON.stringify(config)).toString("base64"),
      });

    await expect(WPVCConfig()).rejects.toThrow(ConfigError);
  });

  test("WPVCConfig fails gracefully on invalid config 4", async () => {
    expect.assertions(1);
    const config = {
      readme: "path/to/readme.txt",
      assignees: false,
    };

    nock("https://api.github.com")
      .get("/repos/OWNER/REPO/contents/.wordpress-version-checker.json")
      .reply(200, {
        content: Buffer.from(JSON.stringify(config)).toString("base64"),
      });

    await expect(WPVCConfig()).rejects.toThrow(ConfigError);
  });

  test("WPVCConfig fails gracefully on invalid config 5", async () => {
    expect.assertions(1);
    const config = {
      readme: "path/to/readme.txt",
      assignees: ["user", false],
    };

    nock("https://api.github.com")
      .get("/repos/OWNER/REPO/contents/.wordpress-version-checker.json")
      .reply(200, {
        content: Buffer.from(JSON.stringify(config)).toString("base64"),
      });

    await expect(WPVCConfig()).rejects.toThrow(ConfigError);
  });

  test("WPVCConfig fails gracefully on invalid config 6", async () => {
    expect.assertions(1);
    const config = {
      readme: "path/to/readme.txt",
      channel: false,
    };

    nock("https://api.github.com")
      .get("/repos/OWNER/REPO/contents/.wordpress-version-checker.json")
      .reply(200, {
        content: Buffer.from(JSON.stringify(config)).toString("base64"),
      });

    await expect(WPVCConfig()).rejects.toThrow(ConfigError);
  });

  test("WPVCConfig fails gracefully on invalid config 7", async () => {
    expect.assertions(1);
    const config = {
      readme: "path/to/readme.txt",
      channel: "not-stable",
    };

    nock("https://api.github.com")
      .get("/repos/OWNER/REPO/contents/.wordpress-version-checker.json")
      .reply(200, {
        content: Buffer.from(JSON.stringify(config)).toString("base64"),
      });

    await expect(WPVCConfig()).rejects.toThrow(ConfigError);
  });
});
