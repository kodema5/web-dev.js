-- an example

create schema if not exists web;

-- the model for payload
--
drop type if exists web.example_foo_t cascade;
create type web.example_foo_t as (
    _method text,    -- POST, GET, ....
    _origin text,    -- ip
    _url text,       -- original url
    _cookies jsonb,  -- cookies
    _headers jsonb,  -- headers
    _query jsonb,    -- querystring
    _type text,      -- form, form-data, text (as json), json

    data jsonb,      -- data
    errors jsonb     -- usually for response
);

--
--
create or replace function web.example_foo(
    x jsonb
)
    returns jsonb
    language plpgsql
as $$
declare
    req web.example_foo_t = jsonb_populate_record(null::web.example_foo_t, x);
    res jsonb;
begin
    -- raise exception 'error.error';

    res = jsonb_build_object(
        '_headers', jsonb_build_object('auth', 'abc'),
        'data', req.data
    )

    return return res;
end;
$$;

select web.example_foo(jsonb_build_object('data', 123));