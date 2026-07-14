# Content model

The shared vocabulary for Press and RICE catalogs. D1 is the runtime catalog;
site-specific JSON is a validated static fallback, not an independent model.
Existing migrations remain append-only. Future schema changes start at D1
migration `0019` and update this package and the backend contract together.
