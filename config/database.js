const { Pool } = require('pg');

console.log("called!! ");

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});




pool.connect()
    .then(()=>console.log('Connected to postgres Sql: ',process.env.DB_NAME))
    .catch(err=>console.log('database connection err',err.stack));




module.exports = pool;


