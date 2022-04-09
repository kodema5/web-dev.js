-- an example

drop schema if exists example cascade;
create schema example;

-- the model for payload
--
create type example.web_payload_t as (
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
create function example.web_foo_bar(
    x jsonb
)
    returns jsonb
    language plpgsql
as $$
declare
    req example.web_payload_t = jsonb_populate_record(null::example.web_payload_t, x);
begin
    return to_jsonb(req);
end;
$$;

select example.web_foo_bar(jsonb_build_object('a', 123));