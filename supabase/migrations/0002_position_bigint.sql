-- Fix overflow: position era int (int4) e o código usa Date.now() que excede o range.
-- Rode esta migration no SQL Editor se você já tinha aplicado a 0001 antes.

alter table leads alter column position type bigint;
