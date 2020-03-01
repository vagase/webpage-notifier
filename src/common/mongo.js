const bluebird = require('bluebird');
const MongoDB = require('mongodb');
bluebird.promisifyAll(MongoDB);

const MongoClient = require('mongodb').MongoClient;
const config = require('./config');
const path = require('path');
const Joi = require("joi");
Joi.objectId = require('joi-objectid')(Joi);

const url = 'mongodb://192.168.50.9:27017';
const dbName = 'webpage-notifier';

/** 
 * 1. create indexes for collection. 
 * NOTE: MongoDB does not recreate the existing index or indexes, it's safe to call createIndexes multiple times
*/
async function mongoSetup(client) {
    const db = client.db(dbName);

    const createIndexes = async () => {
        const conf = config.parse(path.join(__dirname, 'mongo.config.json'));
        const mongoIndexes = conf.indexes;
        const collectionNames = Object.keys(mongoIndexes);

        for (let collectionName of collectionNames) {
            const collection  = db.collection(collectionName);
            const indexes = mongoIndexes[collectionName];
            const ret = await collection.createIndexes(indexes.map(index => {
                return {key: index}
            } ));
            
            console.info(`mongo create indexes:`, ret);
        }
    }

    await createIndexes();
}

let clientPromise = null;
async function getClient() {
    if (!clientPromise) {
        console.info("mongo start connnecting...");

        clientPromise = new Promise((resolve, reject) => {
            MongoClient.connect(url, async function(err, client) {
                if (err) {
                    console.error("mongo connect faild", err);
                    reject(err);
                    clientPromise = null;
                }              
                else {
                    console.info("mongo connect success");
                    await mongoSetup(client);
                    resolve(client);
                }
            });
        });
    }

    return clientPromise;
}

async function getDb(dbName) {
    const client = await getClient();


    return client.db(dbName);
}

async function db() {
    return getDb(dbName);
}

async function collection(collectionName) {
    const d = await db();
    return d.collection(collectionName);
}

exports.MongoDB = MongoDB;
exports.db = db;
exports.collection = collection;