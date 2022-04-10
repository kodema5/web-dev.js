export default async (x) => {
    console.log(
        'echo>',
        x, // JSON.stringify(x, null, 2),
        '\n')
    return x
}
/*
select a.typname, b.oid, b.typarray from pg_catalog.pg_type a
      left join pg_catalog.pg_type b on b.oid = a.typelem
      where a.typcategory = 'A'
      group by a.typname, b.oid, b.typarray
      order by b.oid

*/