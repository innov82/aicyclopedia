# AIcyclopedia

Business website, lead dashboard, and automation demo.

## Source snapshot

Exported from Lovable project `b51a7807-5615-4567-818e-2557c14fc993`, commit `cb8bc62d0b7b974e7d038d080709b1fd0acae03f`.

All future code changes are made through GitHub. Lovable is hosting only.

## Development

Use Bun with the committed lockfile: `bun install --frozen-lockfile`, then `bun run dev`. Production build: `bun run build`.

Environment values are deliberately excluded. Configure required environment values locally or in the hosting dashboard. Keep them out of Git.

The studio photograph uses a Lovable-hosted asset pointer. Preview/hosting must resolve that asset URL; it is not a bundled image.

## Demo scope

Data stays in browser localStorage. Messages, reminders, and follow-up are simulated. No live messaging, billing, or multi-user backend is enabled.

## Hosting connection

This preservation branch does not itself connect Lovable to GitHub. In Lovable Project settings → Git → GitHub, connect the project to the desired GitHub account. Lovable creates the synced repository. Use that connected repository for subsequent development and publish through Lovable.
