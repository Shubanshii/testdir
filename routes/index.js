var express = require('express')
	, router = express.Router()
	, MongoClient = require('mongodb').MongoClient
	, ObjectId = require('mongodb').ObjectId
	, fs = require('fs-extra')
	, url = 'mongodb://Shubanshii:Baylorprser2011@ds245357.mlab.com:45357/upload-tutorial'
	, multer = require('multer')
	, util = require('util')
	, upload = multer({limits: {filesize: 2000000},dest:'/uploads/'})

router.get('/', function(req, res){res.render('index');});

router.post('/uploadpicture', upload.single('picture'), function(req, res){
	if(req.file == null) {
		res.render('index', {title: 'Please select a picture file to submit!'});
	} else {
		MongoClient.connect(url, function(err, db){
			var newImg= fs.readFileSync(req.file.path);
			var encImg = newImg.toString('base64');
			var newItem = {
				description: req.body.description,
				contentType: req.file.mimetype,
				size: req.file.size,
				img: Buffer(encImg, 'base64')
			};

		db.Collection('files')
			.insert(newItem, function(err, result){
				if(err) {console.log(err);}
				var newoid = new ObjectId(result.ops[0]._id);
				fs.remove(req.file.path, function(err) {
					if(err) {console.log(err)};
					res.render('index', {title: 'Thanks for the Picture!'})
				})
			})
		})
	}
})

router.get('/picture/:picture', function(req, res) {
	var filename = req.params.picture;
		MongoClient.connect(url, function(err, db){
			db.Collection('files')
				.findOne({'_id': ObjectId(filename)}, function(err, results){
					res.setHeader('content-type', results.contentType);
					res.send(results.img.buffer);
				})
		})
})

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

module.exports = router;
