// connection pool 생성

const mysql = require('mysql2/promise');

//mysql과 connect하는 connection pool 생성 : 지정 - 4가지(host, username, password, database(schema)) 
const pool = mysql.createPool({ 
    host : '192.168.1.96',
    user: 'power',
    password : 'power0228',
    database : 'esg_power' //node라고 생성했던 스키마 작성
});

//모듈로 사용을 위해 내보내기
module.exports = pool;