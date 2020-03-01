const mongo = require("../common/mongo");
const {ClientError} = require('../common/error');


/**
 * @selectorType: css-selector or xpath
 * 
 * return document id
 */
exports.addOne = async (url, selector, selectorType, email) => {
    const sites = await mongo.collection("sites");
    const ret = await sites.findOneAndUpdate(
        { url, selector, selectorType, email },
        { $set: {email} }, 
        { 
            upsert: true,
            returnOriginal: false,
            projection: {
                _id: 1
            }
        })
    ;

    return ret.value._id;
}

exports.findOneById = async (siteId) => {
    const sites = await mongo.collection("sites");
    const record = await sites.findOne({_id: new mongo.MongoDB.ObjectID(siteId)});
     if (!record) {
        throw new ClientError(-1, `site not found for id: ${siteId}`);
    }
    return record;
}