-- CREATE DATABASE firstapi;

-- \l

-- \c firstapi;

DROP TABLE IF EXISTS identity.users;

CREATE TABLE identity.users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(40),
    email TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

INSERT INTO identity.users (name, email)
    VALUES ('william', 'janchundia@guayatuna.com.ec');

select * from identity.users;