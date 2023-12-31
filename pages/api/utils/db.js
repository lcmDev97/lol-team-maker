import knex from "knex";

const db = knex({
  client: "mysql2",
  connection: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
  },

  pool: {
    min: 0,
    max: 10,
  },
  acquireConnectionTimeout: 10000,
});

export default function DB() {
  return db;
}
