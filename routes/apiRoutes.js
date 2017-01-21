var Express = require( 'express' );

var router = Express.Router();

let mongooseModels = require( '../DB/mongooseModels.js' );

let Country = mongooseModels.countryModel;
let Currency = mongooseModels.currencyModel;

//   Currency EndPoint
router.route('/currency')
	.get(getCurrencyRoute)
	.post(postCurrencyRoute);

	//  Callback Functions for Currency EndPoint
	function getCurrencyRoute(req, res){
		// Gets all Currency records from DB
		Currency.find({},(err,result) =>{
			if(err){
				return res.sendStatus(500);
			}else{
				return res.json(result);
			}
		});
	};
	function postCurrencyRoute(req, res){
		console.dir(req.body);
		// If One of the parameters is missing, then 
		// return status code 400
		if (!req.body.currencyName){
			return res.sendStatus(400);
		}
		if (!req.body.currencyCode){
			return res.sendStatus(400);
		}
		let currencyName = req.body.currencyName;
		let currencyCode = req.body.currencyCode;		
		// Ensures that there will not be duplicates after insertion
		// Check if there is record in DB
		// With same params
		 Currency.find({currencyName:currencyName,currencyCode:currencyCode},(err1,result) => {
		 	if (err1){
		 		return res.sendStatus(500);
		 	}
		 	if (result.length===0){		 		
		 	    // It there is no record with  params then 
				// Create new Currency object
				// And save to  DB		
				let currency = new Currency();
				currency.currencyName = currencyName;
				currency.currencyCode = currencyCode;
				// Save record to DB
				// If no error return status code 200
				// If there is error return status code 500
				currency.save( (err,result) =>{ 
					if (err){
						return res.sendStatus(500);
					}
					return res.sendStatus(200);
				 } );
		 	}else{
		 		// If there is Record with same params then
			 	// return status CONFLICT
			 	return res.sendStatus(409);		
		 	}		 	 	
		 });
	};	
// Currency Endpoint With Parameter
router.route('/currency/:id')	
	.put(putCurrencyRoute)
	.delete(deleteCurrencyRoute);
	
	// Callback Functions
	function putCurrencyRoute(req, res){
		//  If ID Is not provided
		console.dir(req.body);
		if (!req.params.id){
			return res.sendStatus(400);
		}
		// Of Both parameteres are nullable
		if (!req.body.currencyName && !req.body.currencyCode){
			return res.sendStatus(400);
		}
		// Find record  using ID and update
		Currency.findOne({_id:req.params.id}, (err,result) =>{
			if (err){
				return res.sendStatus(500);
			}else{
				if (req.body.currencyName){
					result.currencyName = req.body.currencyName;
				}
				if (req.body.currencyCode){
					result.currencyCode = req.body.currencyCode;
				}
				//  Saving updated result ....
				result.save(function afterSaveCallback(err1,result1){
						if (err1){
							return res.sendStatus(500);
						}else{
							return res.sendStatus(200);
						}						
					});
			}
		});	
	};
	function deleteCurrencyRoute(req, res){
		if (!req.params.id){
			return res.sendStatus(400);
		}
		Currency.remove({_id:req.params.id}, (err,result) =>{
			if(err){
				return res.sendStatus(500);
			}
			res.sendStatus(200);
		});

	};
//  Country EndPoint
router.route('/Country')
	.get(getCountryRoute)
	.post(postCountryRoute);

	//  Callback Functions For Country EndPoint
	function getCountryRoute(req, res){
		Country.find({})
				.populate('currency')
				.exec(function afterPopulationCallback(err,result){
					if(err){
						return res.sendStatus(500);
					}
					res.json(result);
				})
	};
	function postCountryRoute(req, res){

		// Check if  all 3  values are  in req.body
		// return error code  of they are not presented
		if (!req.body.countryName){
			return res.sendStatus(400);
		}
		if (!req.body.countryCodeISO){
			return res.sendStatus(400);
		}
		if (!req.body.currencyID){
			return res.sendStatus(400);
		}
		// If they are presented
		// find currency record  in DB
		// to make sure it's right currency ID
		Currency.findOne({_id:req.body.currencyID},currencyFindCallback);
		// Callback function for  currency Find
		function currencyFindCallback(err,currency){
			//  If error send error code
			if (err){
				return res.sendStatus(500);
			}
			// If there is no error and Currency is not nullable
			// create country object with parameters provided in req.body
			// and save to DB
			if (currency){
				let country = new Country();
				country.countryName = req.body.countryName;
				country.countryCodeISO = req.body.countryCodeISO;
				country.currency = currency._id;

				//  Save  country to DB
				country.save((err1,result1) =>{
					if (err1){
						return res.sendStatus(500);
					}
					return res.sendStatus(200);
				});
			}else{
				return res.sendStatus(400);
			}
		}
	};	
//  Country EndPoint With Parameter
router.route('/Country/:id')	
	.put(putCountryRoute)
	.delete(deleteCountryRoute);

	// Callback Functions
	function putCountryRoute(req, res){
		//  If  ID is missing from URL return  error		
		if (!req.params.id){
			return res.sendStatus(400);
		}
		// Find Country, If error  send status 500
		// check country , If  not nullable 
		Country.findOne({_id:req.params.id},function afterCountryFindCallback(err,country){
			if (err){
				return res.sendStatus(500);
			}
			if (!country){
				return res.sendStatus(400);
			}

			//  Update field if it's provided
			if (req.body.countryName) {
				country.countryName = req.body.countryName;
			}
			if (req.body.countryCodeISO) {
				country.countryCodeISO = req.body.countryCodeISO;
			}
			// If currency is presented then check if  currency ID exists in DB
			// If ID dooes not exists return error code
			// If currency is not presented then save  country to DB
			if (req.body.currency) {
				Currency.findOne({_id:req.body.currency},function currencyExistsCallback(err,currency){
					if (err){
						res.sendStatus(500);
					}
					// If currency ID was invalid, Return Error code 400
					if (!currency){
						res.sendStatus(400);
					}
					country.currency = currency._id;
					country.save((err1,result) =>{
						if (err1){
							res.sendStatus(500);
						}					
						res.sendStatus(200);
					});
				});
			}else{
				country.save((err,result) =>{
					if (err){
						res.sendStatus(500);
					}					
					res.sendStatus(200);
				});
			}
			
		});
	};
	function deleteCountryRoute(req, res){
		if (!req.params.id){
			return res.sendStatus(400);
		}
		Country.remove({_id:req.params.id}, (err,result) =>{
			if(result){
				return res.sendStatus(500);
			}
			res.sendStatus(200);
		});
	}
//  Report By Date
router.route('/Report')
	.get(getReport);

	//  Callback Functions for Report
	function getReport(req,res){
		Currency.find({}, (err1, currency) =>{
			Country.find({}, (err2, country) =>{
				// variables 
				let  today = new Date();
				let dayArray = [];
				let  report = [];

				//  Create uniques  day for each record  in DB
				for (let i = 0; i < currency.length; i++){
					let recordCreatedDate = new Date( currency[i].createdAt );
					let date = new Date(recordCreatedDate.getFullYear(),recordCreatedDate.getMonth(),recordCreatedDate.getDate());
					if (!arrayContainsDate(dayArray,date)){
						dayArray.push(date);
					}
				}
				for (let j = 0; j < country.length; j++){
					let recordCreatedDate = new Date( country[j].createdAt );
					let date = new Date(recordCreatedDate.getFullYear(),recordCreatedDate.getMonth(),recordCreatedDate.getDate());
					if (!arrayContainsDate(dayArray,date)){
						dayArray.push(date);
					}
				}
				///   Create Report
				for (let i = 0; i < dayArray.length;i++){
					let date;
					let sum = {};
					//  Counters
					let countryCounter = 0;
					let currencyCounter = 0;

					//  If   iteratad country date is same as  iterated dayArray date
					//  then  counter++ 
					for (let k = 0; k <country.length; k++){
						let localDateDB = new Date( currency[k].createdAt );
						let localDate = new Date(localDateDB.getFullYear(),localDateDB.getMonth(),localDateDB.getDate());

						if (dayArray[i].getFullYear() === localDateDB.getFullYear()){
							if (dayArray[i].getMonth() === localDateDB.getMonth()){
								if (dayArray[i].getDate() === localDateDB.getDate()){
									countryCounter++;
								}
							}
						}
					}
					//  If   iteratad currency date is same as  iterated dayArray date
					//  then  counter++ 
					for (let p = 0; p < currency.length; p++){
						let localDateDB = new Date( currency[p].createdAt );
						let localDate = new Date(localDateDB.getFullYear(),localDateDB.getMonth(),localDateDB.getDate());
						
						if (dayArray[i].getFullYear() === localDateDB.getFullYear()){
							if (dayArray[i].getMonth() === localDateDB.getMonth()){
								if (dayArray[i].getDate() === localDateDB.getDate()){
									currencyCounter++;
								}
							}
						}
					}

					date = dayArray[i];
					sum.country = countryCounter;
					sum.currency = currencyCounter;

					report.push({date,sum});
				}



				res.json(report);





				//  Check if array contains  date  params  ===> (Array, date)
				function arrayContainsDate(array,date){
					var toReturn=false;
					for (let i=0;i<array.length;i++){
						if (array[i].getFullYear() === date.getFullYear()){
							if (array[i].getMonth() === date.getMonth()){
								if (array[i].getDate() === date.getDate()){
									toReturn = true;
								}
							}
						}
						
						
					}
					return toReturn;
				}

			});
		});
	};



module.exports=router;