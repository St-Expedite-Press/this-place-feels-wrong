# Repository retirement gate

The monorepo `St-Expedite-Press/this-place-feels-wrong` is canonical. The archived `St-Expedite-Press/rice-magazine` repository must remain available until every preservation and dependency gate below is complete. Its similarly named Cloudflare Pages project is active and is not a deletion target.

## Preservation state — 2026-07-13

- Archived `main` (`f89262710c90a672d402775d3027098c9f77e299`) is already reachable through monorepo subtree merge `911df16`.
- Pull-request head `9505f69b7a34ac9e546e9aa28a81972a35240269` and merge `8ae54cbe64ff1a746abd6185dee630eefc5ec928` were fetched into an offline mirror.
- A complete 119,042,184-byte bundle was created and restored successfully from `.migration/repository-archives/rice-magazine-2026-07-13/rice-magazine-2026-07-13.bundle`.
- Bundle SHA-256: `aa0db6a130c3729e19aa33f56d9cda1043866bc1e9ae70029587a750cbc0fe4a`.
- The bundle contains archived main plus `refs/archive/pull/1/{head,merge}` and records complete history.

This is one local preservation copy, not the required second off-machine copy.

## Remaining gates

1. Copy the verified bundle and metadata exports to a second durable location and verify its hash.
2. Perform an authenticated GitHub inventory of Pages configuration, environments, hooks, deploy keys, variables, secret names, Actions runs, deployments, rulesets, and repository settings. Never export secret values.
3. Confirm `rice.stexpedite.press` has no GitHub Pages or archived-repository DNS dependency.
4. Confirm the Cloudflare Pages replacement passes build, assets, canonical URL, sitemap, API fallback, and update-signup checks.
5. Remove obsolete badges, webhooks, OAuth callbacks, workflow references, and deploy credentials.
6. Disable the old GitHub Pages path and observe a quarantine period with no traffic or rollback need.
7. Obtain separate explicit approval immediately before permanent GitHub repository deletion.

Do not interpret repository retirement as permission to delete the active Cloudflare Pages project, D1 data, DNS routes, or the offline preservation bundle.
