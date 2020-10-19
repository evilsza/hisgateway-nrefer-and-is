import { FastifyInstance } from "fastify";

export default async function dbconnect(fastify: FastifyInstance) {

    // HIS connection =========================================
    fastify.register(require('./plugins/db'), {
        config: {
            client: process.env.HIS_DB_CLIENT,
            host: process.env.HIS_DB_HOST,
            user: process.env.HIS_DB_USER,
            password: process.env.HIS_DB_PASSWORD,
            dbName: process.env.HIS_DB_NAME,
            port: +process.env.HIS_DB_PORT,
            schema: process.env.HIS_DB_SCHEMA,
            charSet: process.env.HIS_DB_CHARSET,
            encrypt: process.env.HIS_DB_ENCRYPT || true
        },
        connectionName: 'dbHIS'
    });

    // nRefer connection =========================================
    fastify.register(require('./plugins/db'), {
        config: {
            client: process.env.REFER_DB_CLIENT || process.env.HIS_DB_CLIENT,
            host: process.env.REFER_DB_HOST || process.env.HIS_DB_HOST,
            port: +process.env.REFER_DB_PORT || +process.env.HIS_DB_PORT,
            user: process.env.REFER_DB_USER || process.env.HIS_DB_USER,
            password: process.env.REFER_DB_PASSWORD || process.env.HIS_DB_PASSWORD,
            dbName: process.env.REFER_DB_NAME || process.env.HIS_DB_NAME,
            schema: process.env.REFER_DB_SCHEMA || process.env.HIS_DB_SCHEMA,
            charSet: process.env.REFER_DB_CHARSET || process.env.HIS_DB_CHARSET || '',
            encrypt: process.env.REFER_DB_ENCRYPT || process.env.HIS_DB_ENCRYPT || true
        },
        connectionName: 'dbRefer'
    });

    // ISOnline connection =========================================
    fastify.register(require('./plugins/db'), {
        config: {
            client: process.env.IS_DB_CLIENT || process.env.HIS_DB_CLIENT,
            host: process.env.IS_DB_HOST || process.env.HIS_DB_HOST,
            port: +process.env.IS_DB_PORT || +process.env.HIS_DB_PORT,
            user: process.env.IS_DB_USER || process.env.HIS_DB_USER,
            password: process.env.IS_DB_PASSWORD || process.env.HIS_DB_PASSWORD,
            dbName: process.env.IS_DB_NAME || process.env.HIS_DB_NAME,
            schema: process.env.IS_DB_SCHEMA || process.env.HIS_DB_SCHEMA,
            charSet: process.env.IS_DB_CHARSET || process.env.HIS_DB_CHARSET,
            encrypt: process.env.IS_DB_ENCRYPT || process.env.HIS_DB_ENCRYPT || true
        },
        connectionName: 'dbISOnline'
    });

    // dbCannabis connection =========================================
    fastify.register(require('./plugins/db'), {
        config: {
            client: process.env.CANNABIS_DB_CLIENT || process.env.HIS_DB_CLIENT,
            host: process.env.CANNABIS_DB_HOST || process.env.HIS_DB_HOST,
            port: +process.env.CANNABIS_DB_PORT || +process.env.HIS_DB_PORT,
            user: process.env.CANNABIS_DB_USER || process.env.HIS_DB_USER,
            password: process.env.CANNABIS_DB_PASSWORD || process.env.HIS_DB_PASSWORD,
            dbName: process.env.CANNABIS_DB_NAME || process.env.HIS_DB_NAME,
            schema: process.env.CANNABIS_DB_SCHEMA || process.env.HIS_DB_SCHEMA,
            charSet: process.env.CANNABIS_DB_CHARSET || process.env.HIS_DB_CHARSET,
            encrypt: process.env.CANNABIS_DB_ENCRYPT || process.env.HIS_DB_ENCRYPT || true
        },
        connectionName: 'dbCannabis'
    });


}
