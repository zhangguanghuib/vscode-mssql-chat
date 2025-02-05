import * as mssql from 'mssql';

/**
 * Gets the database context.
 * @param config The database configuration.
 * @returns The database context.
 */
export async function getDatabaseContext(config: mssql.config): Promise<mssql.ConnectionPool> {
    try {
        const pool = await mssql.connect(config);
        return pool;
    } catch (err) {
        console.error('Database connection failed: ', err);
        throw err;
    }
}

/**
 * Runs a query against the database.
 * @param pool The database connection pool.
 * @param query The SQL query to run.
 * @returns The query result.
 */
export async function runQuery(pool: mssql.ConnectionPool, query: string): Promise<mssql.IResult<any>> {
    try {
        const result = await pool.request().query(query);
        return result;
    } catch (err) {
        console.error('Query execution failed: ', err);
        throw err;
    }
}