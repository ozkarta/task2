
//      Requires  needed  modules
let Express = require( 'express' );

let mongoose = require( 'mongoose' );

let bodyParser = require( 'body-parser' );


let router = require( './routes/apiRoutes.js' );
//  Port for application
let port = 4132;

let app = new Express();

//  x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
//  JSON
app.use(bodyParser.json());

app.use('/API', router);

//            MONGOOSE
//   Create mongoose connection
mongoose.connect('mongodb://localhost/task2');


//  Initialize  Mongoose Models  












//         Listen to the port with Arrow Function callback
let server = app.listen(port,() => {

	console.log('app started on port .... ' +port);

} );