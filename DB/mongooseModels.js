let mongoose = require('mongoose');

let Schema = mongoose.Schema;

let countrySchema = new Schema({
	countryName			: String,
	countryCodeISO		: String,
	currency 			: {type: Schema.Types.ObjectId, ref: 'Currency'}
},
{
    timestamps: true
});

let currencySchema = new Schema({
	currencyName		:String,
	currencyCode		:String
},
{
    timestamps: true
});

module.exports.countryModel = mongoose.model( 'Country', countrySchema);
module.exports.currencyModel = mongoose.model( 'Currency', currencySchema);