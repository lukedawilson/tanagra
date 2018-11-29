CREATE DATABASE protobuf_spike;

CREATE TABLE bazs (
  id SERIAL PRIMARY KEY,
  string VARCHAR(256),
  number INTEGER
);

CREATE TABLE foos (
  id SERIAL PRIMARY KEY,
  string VARCHAR(256),
  number INTEGER
);

CREATE TABLE bars (
  id SERIAL PRIMARY KEY,
  string VARCHAR(256),
  date TIMESTAMP,
  baz_id INTEGER,
  foo_id INTEGER,
  CONSTRAINT bars_bazs_fk FOREIGN KEY(baz_id) REFERENCES bazs (id),
  CONSTRAINT bars_foos_fk FOREIGN KEY(foo_id) REFERENCES foos (id)
);

CREATE INDEX bars_baz_id ON bars (baz_id);
CREATE INDEX bars_foo_id ON bars (foo_id);

/**
Useful queries:
  DELETE FROM bars; DELETE FROM bazs; DELETE FROM foos;
  SELECT * FROM foos; SELECT * FROM BARS; SELECT * FROM bazs;
*/
