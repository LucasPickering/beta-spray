CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- A function to update the `updated_at` col. To be used as a BEFORE UPDATE trigger
CREATE FUNCTION public.update_timestamp() RETURNS trigger
  LANGUAGE plpgsql
  AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END
$$;

-- Custom types
CREATE TYPE annotation_source AS ENUM ('user', 'auto');
CREATE TYPE body_part AS ENUM ('left_hand', 'right_hand', 'left_foot', 'right_foot');


CREATE TABLE boulders (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name        TEXT NOT NULL,
    image_url   TEXT NOT NULL,
    created_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
CREATE TRIGGER
  update_timestamp
BEFORE UPDATE ON
  boulders
FOR EACH ROW EXECUTE PROCEDURE
  update_timestamp();
-- TODO add listener in rust to clean up remote image in storage

CREATE TABLE holds (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    boulder_id  UUID NOT NULL REFERENCES boulders(id),
    position_x  REAL NOT NULL,
    position_y  REAL NOT NULL,
    source      annotation_source NOT NULL,
    created_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
CREATE TRIGGER
  update_timestamp
BEFORE UPDATE ON
  holds
FOR EACH ROW EXECUTE PROCEDURE
  update_timestamp();


CREATE TABLE problems (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name        TEXT NOT NULL,
    boulder_id  UUID NOT NULL REFERENCES boulders(id),
    created_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
CREATE TRIGGER
  update_timestamp
BEFORE UPDATE ON
  problems
FOR EACH ROW EXECUTE PROCEDURE
  update_timestamp();
-- TODO add trigger to clean up boulder


CREATE TABLE problem_holds (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hold_id     UUID NOT NULL REFERENCES holds(id),
    problem_id  UUID NOT NULL REFERENCES problems(id),
    source      annotation_source NOT NULL,
    created_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
CREATE TRIGGER
  update_timestamp
BEFORE UPDATE ON
  problem_holds
FOR EACH ROW EXECUTE PROCEDURE
  update_timestamp();


CREATE TABLE betas (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name        TEXT NOT NULL,
    problem_id  UUID NOT NULL REFERENCES problems(id),
    created_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
CREATE TRIGGER
  update_timestamp
BEFORE UPDATE ON
  betas
FOR EACH ROW EXECUTE PROCEDURE
  update_timestamp();


CREATE TABLE beta_moves (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    -- Deliberately nullable, some moves may not fall on a hold
    hold_id     UUID REFERENCES holds(id),
    beta_id     UUID NOT NULL REFERENCES betas(id),
    -- The name is redundant, but `order` is a SQL keyword and this avois having
    -- to quote it everywhere
    move_order  INT NOT NULL CHECK (move_order >= 0),
    created_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UNIQUE (beta_id, move_order)
);
-- We filter by these two a lot
CREATE INDEX ON beta_moves(beta_id);
CREATE INDEX ON beta_moves(move_order);
CREATE TRIGGER
  update_timestamp
BEFORE UPDATE ON
  beta_moves
FOR EACH ROW EXECUTE PROCEDURE
  update_timestamp();
-- TODO add trigger to slide moves
