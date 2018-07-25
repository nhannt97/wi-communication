var models = require('../database/db-connect');
var response = require('./response')
var Message = models.Message;
var NewMessage = models.NewMessage;
var User = models.User;
var Conversation = models.Conversation;
var appProfile = require('../app-init');
var op = models.Op;
var async = require('async');

module.exports.postMessage = (req, res) => {
	Message.create({
		content: req.body.content,
		type: req.body.type,
		idConversation: req.body.idConversation,
		idSender: req.body.idSender,
        sendAt: req.body.sendAt
	}).then(message => {
		if (message) {
			abc(req.decoded.id, req.body.idConversation, function(rs) {
				if(rs==1) {
					appProfile.io.in(req.body.idConversation).emit('sendMessage', req.body);
					res.send(response(200, 'SUCCESSFULLY', message));
				} else {
					res.send(response(404, 'CREATE NEWMESSAGE ERROR'));
				}
			})
		}
		else
			res.send(response(400, 'CREATE FAIL'));
	}).catch(err => {
		console.error(err);
		res.send(response(404, 'SOMETHING WENT WRONG: ' + err));
	});
}

function abc(idUser, idConversation, cb) {
	Conversation.findOne({
		where: {
			id: idConversation
		},
		include: {
			model: User,
			where: {
				id: {[op.ne]: idUser}
			}
		}
	}).then(conver => {
		if(conver) {
			async.eachOfSeries(conver.dataValues.Users, function(user, i, done) {
				NewMessage.create({
					idUser: user.dataValues.id,
					nameConversation: conver.dataValues.name
				}).then(newMess => {
					if(newMess) done();
					else cb(-1);
				}).catch(err => {
					cb(-1);
				});
			}, function(err) {
				if(err) cb(-1);
				cb(1);
			})
		} else cb(-1);
	}).catch(err => {
		cb(-1);
	});
}