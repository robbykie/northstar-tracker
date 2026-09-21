# Northstar tracker

A local-first personal asset tracker inspired by the supplied visual reference.

## Run it

Open `index.html` in any modern browser. No install, sign-in, or server is required for this first version.

## Included

- Portfolio summary, allocation, movers, and holdings views
- Add, search, remove, and export holdings
- Browser-only storage using `localStorage`
- Simulated quote refresh, clearly labelled as local demo data

## Next step: live quotes

The next iteration can use a market-data provider behind a small server component so provider credentials never reach the browser. This also gives us a reliable place for scheduled refreshes and rate-limit handling.
