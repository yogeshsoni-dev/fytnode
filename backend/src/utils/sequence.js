'use strict';

const prisma = require('./prismaClient');

function assertSafeIdentifier(value, kind) {
  if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(value)) {
    throw new Error(`Invalid ${kind}: ${value}`);
  }
}

async function syncAutoincrementSequence(tableName, columnName = 'id') {
  assertSafeIdentifier(tableName, 'table name');
  assertSafeIdentifier(columnName, 'column name');

  const tableRef = `"${tableName}"`;
  const serialSequenceExpr = `pg_get_serial_sequence('${tableRef}', '${columnName}')`;

  await prisma.$executeRawUnsafe(`
    SELECT setval(
      ${serialSequenceExpr},
      COALESCE((SELECT MAX("${columnName}") FROM ${tableRef}), 1),
      COALESCE((SELECT MAX("${columnName}") IS NOT NULL FROM ${tableRef}), false)
    )
  `);
}

function isUniqueIdConflict(error) {
  return error?.code === 'P2002' && Array.isArray(error.meta?.target) && error.meta.target.includes('id');
}

module.exports = {
  syncAutoincrementSequence,
  isUniqueIdConflict,
};
