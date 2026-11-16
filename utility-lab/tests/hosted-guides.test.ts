import test from "node:test";
import assert from "node:assert/strict";
import {
  validatePhotoEmbed,
  validateUtility,
  UTILITY_REFERENCES,
} from "../src/utility-data.ts";
test("source-hosted photo pages remain restricted to exact original canonical pages", () => {
  const url = "https://gonade.app/nade/nuke-b-dark-from-ramp-incendiary";
  const embed = {
    provider: "gonade",
    postUrl: url,
    embedUrl: url,
    height: 1100,
  };
  assert.deepEqual(validatePhotoEmbed(embed), embed);
  assert.deepEqual(
    validateUtility({ ...UTILITY_REFERENCES[0], photoEmbed: embed })
      ?.photoEmbed,
    embed,
  );
  for (const overrides of [
    {
      postUrl: "http://gonade.app/nade/nuke-example",
      embedUrl: "http://gonade.app/nade/nuke-example",
    },
    {
      postUrl: "https://gonade.app.evil.example/nade/nuke-example",
      embedUrl: "https://gonade.app.evil.example/nade/nuke-example",
    },
    { postUrl: url + "?embed=true", embedUrl: url + "?embed=true" },
    { postUrl: url + "#fake", embedUrl: url + "#fake" },
    { embedUrl: "https://gonade.app/nade/different-guide" },
    {
      postUrl: "https://user:password@gonade.app/nade/nuke-example",
      embedUrl: "https://user:password@gonade.app/nade/nuke-example",
    },
    {
      postUrl: "https://gonade.app/api/nades/1",
      embedUrl: "https://gonade.app/api/nades/1",
    },
    { provider: "arbitrary-html" },
    { height: 10000 },
  ])
    assert.equal(validatePhotoEmbed({ ...embed, ...overrides }), null);
});

test("additional photo providers accept only their specific public guide routes", () => {
  for (const [provider, url] of [
    ["csnades", "https://csnades.gg/nuke/smokes/double-doors-from-b-ramp"],
    ["cs2tricks", "https://www.cs2tricks.com/nades/mirage/grenades/catwalk-from-back-alley-9376"],
    ["lineupspro", "https://lineups.pro/cache/5erxnx"],
  ]) {
    assert.ok(validatePhotoEmbed({ provider, postUrl: url, embedUrl: url }));
    assert.equal(validatePhotoEmbed({ provider, postUrl: url + "?redirect=https://example.com", embedUrl: url + "?redirect=https://example.com" }), null);
    assert.equal(validatePhotoEmbed({ provider, postUrl: url, embedUrl: "https://example.com/" }), null);
    const foreign = url.replace(new URL(url).hostname, new URL(url).hostname + ".example.com");
    assert.equal(validatePhotoEmbed({ provider, postUrl: foreign, embedUrl: foreign }), null);
  }
});
