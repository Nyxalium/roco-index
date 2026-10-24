# Contributing

Open an issue for a bug, translation correction or missing information. Include the affected page, expected result, and a source or screenshot where useful.

For code changes, run `npm ci`, make a focused change, and run `npm run build`. Check affected layouts on both desktop and a narrow mobile viewport. Explain the change and validation in your pull request.

Keep original Chinese text, record IDs and saved-state formats intact. Translation corrections belong in `src/data/compendium.en.json`; retain the matching `zh` string and mark unverified wording for review. Do not infer global-game mechanics or creature identities from artwork.

Preserve third-party copyright notices and licences. Do not commit credentials, personal browser data, local development files or build output.
