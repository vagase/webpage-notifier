const mongo = require("../common/mongo");

exports.addOne = async (siteId, format, payload) => {
    const crawlHistories = await mongo.collection("crawl_histories");
    const ret = await crawlHistories.insertOne(
        { siteId, format, payload, createdAt: Date.now() },
    );

    return ret.insertedId;
}