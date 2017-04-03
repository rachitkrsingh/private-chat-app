$(document).ready(function(){

	/******************************************************************************
    * Variables
    ******************************************************************************/
	var socket = io.connect();

	// review conditons


	/******************************************************************************
    * Model Component
    ******************************************************************************/
	var Model = {
		currentUser: "",
		currentUserChat : {},
		sender : {}
	};


	/******************************************************************************
    * Controller Component
    ******************************************************************************/

    var Controller = {
    	init : function(){
    		var self = this;
    		SocketComponent.init();
    		self.sendMessageEvent();
        },
		selectUserClickEvent : function (){

			var $userNameList = $("#availableUsers .username");

			$($userNameList).each(function(){
				$(this).on('click',function(){
					
					var username = $(this).html();

					SocketComponent.currentUser(username);

					Model.currentUser = username;
				
					View.displayCurrentUser(username);
					View.showChatRoom();
				});
			});

		},
		getCurrentUser :  function (){
			var name = Model.currentUser;
			return name;
		},
		userItemClickEvent : function (){

			var $userList = $("#usersWrap .user");

			$($userList).each(function(){
				$(this).on('click',function(){
					var $userElem = $(this);

					var user = $($userElem).find(".name").html();

					View.removeUserActiveState();

					
					$(this).addClass("active");
					$(this).removeClass("new-messsage-notif");

					$(this).attr("data-newmsgcount", "0");
					$(this).attr("data-state", "active");

					$(this).find(".new-msg-count").html("");

					$("#message").attr("data-user", user); 
					$("#chatWrap .header").html(user);

					$("#message").prop('disabled', false);

					$("#message").removeClass('input-disable');

					$("#chat").html("");


					var currentUser = Controller.getCurrentUser();

					View.showAllChatDataInChatRoom( currentUser, user);

				});
			});
		},
		sendMessageEvent : function (){
			$("#send-message").submit(function(evt){
				evt.preventDefault();

				var dataToSend = {
					msg : $("#message").val(),
					user: $("#message").attr("data-user")
				}

				SocketComponent.privateMsg(dataToSend);

				Controller.storeDataInModel(dataToSend, true);
				View.appendChatMsg(Model.currentUser, dataToSend.msg);

				$("#message").val('');
			});
		},
		pushChatMsgForCurrentUser : function (user ,msg){
			var chatMsgArr = Model.currentUser.user;

			if (chatMsgArr && chatMsgArr !== "undefined") {
				Model.currentUserChat.user.push(msg);
			} else {
				Model.currentUserChat[user] = [];
				Model.currentUserChat[user].push(msg);
			}

		},
		storeDataInModel : function ( dataToStore, fromCurrUser ){
			var username = dataToStore.user;
			var msg  = dataToStore.msg;
			

			if (fromCurrUser) {
				var keys = Object.keys(Model.currentUserChat);
				if (keys.indexOf(username) > -1) {
					Model.currentUserChat[username].push(dataToStore.msg);
				} else {
					Model.currentUserChat[username] = [];
					Model.currentUserChat[username].push(dataToStore.msg);
				}

			} else {
				var senderNames = Object.keys(Model.sender);

				if (senderNames.indexOf(username) > -1) {
					Model.sender[username].push(dataToStore.msg);
				} else {
					Model.sender[username] = [];
					Model.sender[username].push(dataToStore.msg);
				}
			}

		},
    };

     /******************************************************************************
    * View Component
    ******************************************************************************/

    var View = {
        showUserListToSelect : function (userArr){

			$("#availableUsers").html('');
			var innerHtml = '';

			if (userArr.length > 0) {
				for(var i = 0; i < userArr.length; i++){
					innerHtml = "<div class='username'>" + userArr[i]+ "</div>";
					$("#availableUsers").append(innerHtml);
					
				}
			} else {
				innerHtml = "<div class=''>Sorry No user available</div>";
				$("#availableUsers").append(innerHtml);
			}

		},

		displayCurrentUser : function (displayname){

			var $currentUserContainer = $("#currentUser");
			$($currentUserContainer).html("Hello " + displayname);
		},

		showChatRoom : function (){
			$('#usernameWrap').hide();
			$('#contentWrap').show();
		},

		showOnlineUsers : function (onlineUsers){
			$("#usersWrap").html('');
			var innerHtml = '';

			if (onlineUsers.length === 1 ) {
				
				View.noUserOnline();

			} else {

				for(var i = 0; i < onlineUsers.length; i++){

					if ( Controller.getCurrentUser() !==onlineUsers[i]) {
						innerHtml = "<div class='user clearfix' data-newMsgCount='0'><div class='name'>" + onlineUsers[i] + "</div><div class='new-msg-count'></div></div>";
						$("#usersWrap").append(innerHtml);
					}

				}
			}
		},

		noUserOnline : function (){

			$("#usersWrap").html('');
			var innerHtml = '';
			innerHtml = "<div class='no-user'> No User Online</div>";
			$("#usersWrap").append(innerHtml);

		},

		removeUserActiveState : function (){

			var $userList = $("#usersWrap .user");
			$($userList).each(function(){
				$(this).attr("data-state", "");
				$(this).removeClass("active");
			});

		},

		showAllChatDataInChatRoom : function (currentuserName, contactUser){

			// for current user msgses
			var currentUserObj = Model.currentUserChat;
			var currentUserChatArr = currentUserObj[contactUser];
			if (currentUserChatArr && currentUserChatArr !== "undefined") {
				for(var i = 0; i < currentUserChatArr.length; i++){
					View.appendChatMsg(currentuserName, currentUserChatArr[i] );
				}
			}

			// for contact user msgses
			var contactUserObj = Model.sender;
			var chatArr = contactUserObj[contactUser];
			if (chatArr && chatArr !== "undefined") {
				for(var i = 0; i < chatArr.length; i++){
					View.appendChatMsg(contactUser, chatArr[i] );
				}
			}
			
		},

		appendChatMsg : function (name, msg){
			$("#chat").append("<span class='whisper'><b>" + name +" :</b> " + msg + "</span><br/>");	
		},

		newPrivateMsgCount : function(newmsgUser){
			var $contactUser = $("#usersWrap .user");
			$($contactUser).each(function(event){
				var $this = $(this);
				var name = $($this).find(".name").html();
				if( name === newmsgUser) {
					var count  = $($this).attr("data-newMsgCount");
					count = parseInt(count) + 1 ;
					$($this).attr("data-newMsgCount", count);
					$($this).find(".new-msg-count").html(count);

					// View.newMesgView(this);
					$($this).addClass("new-messsage-notif");
					return;
				}
			});
		},

		newMesgView : function (user){
			$(user).css("background-color", "#000");
			$(user).css("color", "#FFF");
		},

		showErrorMsgInChatRoom : function (msg){
			$("#chat").append("<span class='error'>"  + msg + "</span><br/>");
		}
    };

    /******************************************************************************
    * Socket Component
    ******************************************************************************/


    var SocketComponent = {
    	init : function(){
    		var self = this;
    		self.allAvailableUsername();
    		self.getOnlineUsers();
    		self.whisper();
    	},
    	allAvailableUsername : function(){
    		socket.on('all available username', function(data){
				if (data.length) {
					View.showUserListToSelect(data);
					Controller.selectUserClickEvent();
				}
			});
    	},
    	currentUser : function(data){
    		socket.emit('current user', data, function(data){});
    	},
    	getOnlineUsers : function(){
    		socket.on('online users', function(data){
				View.showOnlineUsers(data);
				Controller.userItemClickEvent();
			});
    	},
    	privateMsg : function(dataToEmit){

    		socket.emit('private message', dataToEmit, function(data){

				if (data) {

					View.showErrorMsgInChatRoom(data);

				} else {

					Controller.pushChatMsgForCurrentUser( dataToEmit.user ,dataToEmit.msg );
				
				}	
				
			});
    	},
    	whisper : function (){
    		socket.on('whisper', function(data){

				Controller.storeDataInModel(data, false);

				if ($("#message").data("user") === data.user) {

					View.appendChatMsg( data.user, data.msg);

				} else {

					View.newPrivateMsgCount(data.user);

				}
			});
    	},
    };


	window.ChatApp  = Controller;
    ChatApp.init();

});