CREATE TABLE IF NOT EXISTS events(
    id serial primary key,
    name varchar(64) not null unique,
    slug varchar(64) not null,
    description varchar(500),
    created timestamp with time zone not null default current_timestamp,
    modified timestamp with time zone not null default current_timestamp
);

CREATE TABLE IF NOT EXISTS registration (
    id serial primary key,
    name character varying(64) NOT NULL,
    comment varchar(500),
    eventid INTEGER NOT NULL,
    created timestamp with time zone not null default current_timestamp,
    CONSTRAINT eventid FOREIGN KEY (eventid) REFERENCES events (id)
);

CREATE TABLE IF NOT EXISTS users (
    id serial primary key,
    username character varying(255) NOT NULL,
    password character varying(255) NOT NULL
);
-- Lykilorð: "123"
INSERT INTO users (username, password)
VALUES (
        'admin',
        '$2a$11$pgj3.zySyFOvIQEpD7W6Aund1Tw.BFarXxgLJxLbrzIv/4Nteisii'
    );