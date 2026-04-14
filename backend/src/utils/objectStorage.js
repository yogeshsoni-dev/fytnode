'use strict';

const path = require('path');
const { Client } = require('minio');
const AppError = require('./AppError');

function parseBoolean(value, fallback = false) {
  if (value == null) return fallback;
  return String(value).toLowerCase() === 'true';
}

function getConfig() {
  const endpointValue = process.env.MINIO_ENDPOINT;
  const bucket = process.env.MINIO_BUCKET_NAME;

  if (!endpointValue || !bucket) {
    throw new AppError('MinIO is not configured on the server.', 500);
  }

  const parsed = endpointValue.startsWith('http')
    ? new URL(endpointValue)
    : new URL(`http://${endpointValue}`);

  const useSSL = parsed.protocol === 'https:' || parseBoolean(process.env.MINIO_USE_SSL, false);
  const port = parsed.port ? Number.parseInt(parsed.port, 10) : (useSSL ? 443 : 80);

  return {
    endPoint: parsed.hostname,
    port,
    useSSL,
    accessKey: process.env.MINIO_ACCESS_KEY,
    secretKey: process.env.MINIO_SECRET_KEY,
    bucket,
    publicBaseUrl: (process.env.MINIO_PUBLIC_BASE_URL || endpointValue).replace(/\/+$/, ''),
    supplementsPrefix: (process.env.MINIO_SUPPLEMENTS_PREFIX || 'suppliments').replace(/^\/+|\/+$/g, ''),
    equipmentPrefix: (process.env.MINIO_GYMPRODUCTS_PREFIX || 'gymproducts').replace(/^\/+|\/+$/g, ''),
  };
}

function createClient(config) {
  return new Client({
    endPoint: config.endPoint,
    port: config.port,
    useSSL: config.useSSL,
    accessKey: config.accessKey,
    secretKey: config.secretKey,
  });
}

function sanitizeFileName(fileName) {
  const ext = path.extname(fileName || '').toLowerCase();
  const baseName = path.basename(fileName || 'image', ext).toLowerCase();
  const safeBaseName = baseName.replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'image';
  return `${safeBaseName}${ext}`;
}

function getFolderForCategory(category) {
  const config = getConfig();
  return category === 'EQUIPMENT' ? config.equipmentPrefix : config.supplementsPrefix;
}

function buildPublicUrl(publicBaseUrl, bucket, objectName) {
  const encodedSegments = objectName.split('/').map(encodeURIComponent).join('/');
  return `${publicBaseUrl}/${bucket}/${encodedSegments}`;
}

function getBucketBaseUrl(config) {
  return `${config.publicBaseUrl}/${config.bucket}/`;
}

function extractObjectName(storedValue) {
  if (!storedValue) return null;

  if (!/^https?:\/\//i.test(storedValue)) {
    return storedValue.replace(/^\/+/, '');
  }

  const config = getConfig();
  const bucketBaseUrl = getBucketBaseUrl(config);
  if (storedValue.startsWith(bucketBaseUrl)) {
    return decodeURIComponent(storedValue.slice(bucketBaseUrl.length));
  }

  return null;
}

async function uploadProductImageToMinio({ file, category }) {
  if (!file) return null;

  const config = getConfig();
  const client = createClient(config);
  const folder = getFolderForCategory(category);
  const objectName = `${folder}/${Date.now()}-${Math.round(Math.random() * 1e9)}-${sanitizeFileName(file.originalname)}`;

  await client.putObject(
    config.bucket,
    objectName,
    file.buffer,
    file.buffer.length,
    {
      'Content-Type': file.mimetype,
    }
  );

  return objectName;
}

async function getPresignedObjectUrl(objectName, expirySeconds = 60 * 60 * 24 * 7) {
  if (!objectName) return null;

  const config = getConfig();
  const client = createClient(config);

  return new Promise((resolve, reject) => {
    client.presignedGetObject(config.bucket, objectName, expirySeconds, (error, url) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(url);
    });
  });
}

async function resolveStoredProductImageUrl(storedValue) {
  if (!storedValue) return null;

  const objectName = extractObjectName(storedValue);
  if (!objectName) {
    return storedValue;
  }

  return getPresignedObjectUrl(objectName);
}

async function serializeProductImage(product) {
  if (!product) return product;
  return {
    ...product,
    imageUrl: await resolveStoredProductImageUrl(product.imageUrl),
  };
}

async function serializeProducts(products) {
  return Promise.all((products || []).map(serializeProductImage));
}

module.exports = {
  extractObjectName,
  getPresignedObjectUrl,
  resolveStoredProductImageUrl,
  serializeProductImage,
  serializeProducts,
  uploadProductImageToMinio,
};
