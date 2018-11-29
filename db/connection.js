const Pool = require ('pg').Pool

const Foo = require('../models/foo')
const Bar = require('../models/bar')
const Baz = require('../models/baz')

const pool = new Pool({connectionString: 'postgres://toptal:toptal@localhost:5432/protobuf_spike'})

const db = {
  query: async function() {
    const client = await pool.connect()
    try {
      return await client.query(...arguments)
    } finally {
      client.release()
    }
  }
}

async function writeFoo(foo) {
  const fooId = (await db.query(`
    INSERT INTO foos (string, number)
    VALUES ($1, $2)
    RETURNING id`, [foo.string, foo.number])).rows[0]['id']

  for (const bar of foo.bars) {
    let bazId = null
    if (bar.baz) {
      bazId = (await db.query(`
        INSERT INTO bazs (string, number)
        VALUES ($1, $2)
        RETURNING id`, [bar.baz.string, bar.baz.number])).rows[0]['id']
    }

    await db.query(`
      INSERT INTO bars (string, date, baz_id, foo_id)
      VALUES ($1, $2, $3, $4)
      RETURNING id`, [bar.string, bar.date, bazId, fooId])
  }

  return fooId
}

async function readFoo(id) {
  const rows = (await db.query(`
    SELECT
      foos.id AS foo_id,
      foos.string AS foo_string,
      foos.number AS foo_number,
      bars.id AS bar_id,
      bars.string AS bar_string,
      bars.date AS bar_date,
      bazs.id AS baz_id,
      bazs.string AS baz_string,
      bazs.number AS baz_number
    FROM foos                              
    LEFT JOIN bars ON foos.id = bars.foo_id
    LEFT JOIN bazs ON bars.baz_id = bazs.id
    WHERE foos.id = $1
    ORDER BY bars.id`, [id])).rows

  if (rows.length === 0) {
    return null
  }

  const row1 = rows[0]
  const foo = new Foo(row1.string, row1.number)

  for (const row of rows) {
    if (row['bar_id']) {
      let baz = null
      if (row['baz_id']) {
        baz = new Baz(row['baz_string'], row['baz_number'])
      }
      const bar = new Bar(row['bar_string'], row['bar_date'], baz)
      foo.bars.push(bar)
    }
  }

  return foo
}

module.exports = {
  writeFoo,
  readFoo
}
