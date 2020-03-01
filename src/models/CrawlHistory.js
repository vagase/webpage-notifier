const mongo = require("../common/mongo");

exports.addOne = async (siteId, format, payload) => {
    const crawlHistories = await mongo.collection("crawl_histories");
    const ret = await crawlHistories.insertOne(
        { siteId, format, payload, createdAt: Date.now() },
    );

    return ret.insertedId;
}

exports.findLatestTwoHistoriesForSiteId = async (siteId) => {
    const crawlHistories = await mongo.collection("crawl_histories");

    const record = await crawlHistories.find(
        { siteId },
        {
            sort: {createdAt: -1},
            limit: 2
        }
    ).toArray();

    return record;
}

exports.findLatestHistoryForSiteId = async (siteId) => {
    const crawlHistories = await mongo.collection("crawl_histories");

    const record = await crawlHistories.findOne(
        { siteId },
        { sort: {createdAt: -1},
    })

    return record;
}