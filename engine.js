var Game_Board = function(){
	var data; // var cards_arr, $cards as global var
	/*
	 Processing prevously fetched .conf file. Splitting, cutting then doubling it
		to have 16 card pairs.
	*/
	this.set_Data = function(d){
		data = d;
		cards_arr = []; 
		data = data.split('\n');
		var plen = data.length;
		while (plen--) {
			if (data[plen].charAt(0) == "#"){
				cards_arr.push(data[plen].substring(0,7));
				
			}
		}
		for (var i = 0; i<8;i++) cards_arr[i+8]=cards_arr[i];
	}
	/*
	 Building the game board, filling up game_board dif with
		shuffled cards, gives them unique id's. Then sets the first card
		as active. $cards is an array of the 16 card objects
	*/
	this.create_Game = function() {
		cards_arr = Shuffle(cards_arr);
		for (var j = 0; j < cards_arr.length; j++) {
			$("#game_board").append($('<div></div>')
			.attr({ id : "card_"+j })
			.addClass("card_holder")
			.css({visibility:"visible"})
			);				
		}
		$("#card_0").addClass("active");
		$cards = $('.card_holder').not(':has(:empty)');
	}
	/*
	This priv.function is used for shuffle the cards array.
	*/
	function Shuffle(o){ 
		for (var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x =
			o[--i], o[i] = o[j], o[j] = x);
		return o;
	} 
	/*
	Resetting values then restarts the game by re-building and shuffling cards 
		then resetting informations
	*/
	this.restart_Game = function(){
		$('#game_board').html('');
		pairs = 8;
		$("#restart").removeClass('restart_active');
		this.create_Game();
		infos.null_Points();
		infos.Update();
		control.setStart();
		infos.stop_Timer();
	}

	
}
var Game_Control = function(){
	var allowed = [37,38,39,40,13],	//Allowed key-codes (lowering bug-risk)
		selected = [];				//selected cards. 2dim arr, contains 1 or 2 selected 
									//card's id as first and paired #color code.
	var start = true;
	this.setStart = function(){
		start = true;
	}
	/* 	
	Gameplay is binded to every keyup event. Comparing, selecting cards,
		and moving between cards.
	*/ 
	this.gameplay = function(e, forced){
		var dir = e.which;
		if ($.inArray(dir, allowed)<0){return;} // if key-code is not allowed, returns.
		if(start==true) {
			infos.start_Timer();
			start = false;
		}
		var $active = $('.active');				// currently active card. *active means it is "hovered" the cursor set to this.
		var i; 
		/* 	
		If ENTER and restart is active, restart the game after confirmation, or
		enter is hit by the end of the prevous successful game.
		*/ 
		if (dir == 13 && $( "#restart" ).hasClass( "restart_active" )){
			var r = confirm("A new game will start!");
			if (r == true) {
				$('.popup').css('display','none');
				gameboard.restart_Game();
			}
			return;
		}
		if (dir == 13) {
			var len = selected.length;
			if(selected.length){
				if($active.attr('id')==selected[0][1]) return; // is to prevent select the same card at the same time
			}		
			if (len>1){ // 2 cards can be selected at the same time.
				selected = [];
				$('.selected').removeClass('selected');
			}
			else { //putting the current active selected card's data into selected array.
				selected[len] = [ cards_arr[$cards.index($('.active'))], $active.attr('id') ];
				$active.addClass('selected')
				var xaxa =  cards_arr[$cards.index($('.active'))];
				$active.css("background-color" , xaxa );
				$('.active').addClass('opacity');
			}
			/* 	
			 Comparing the selected cards. 
			*/ 		
			if (len==1){
				if (selected[0][0]==selected[1][0] && selected[0][1] != selected[1][1]){ // if 2 cards are equal
					pairs--;
					selected = [];
					$(document).off('keyup', control.gameplay);
					/*
						"Pausing" keyup for 2 seconds. Preventing user to select randomly while 
						the 2 compared cards are visible.
					*/
					setTimeout(function() {
					$('.selected').css({ visibility : "hidden" }) // simply hiding them from the user
						$(document).on('keyup', control.gameplay);
						control.gameplay({'which':39}, true); 	//calling recursively with the key-code "next", 
																//causing Jump-to the next available card
						infos.set_Points(+1);
						if (pairs == 0) {infos.endGame();}
						}, 2000);
				}
				else { 
					selected = [];
					$(document).off('keyup', control.gameplay);
					setTimeout(function() {
					    $('.selected').removeClass('selected').removeClass('opacity');  
					    $(document).on('keyup', control.gameplay);
						infos.set_Points(-1);
					}, 2000);
					
				}
			}
		}
		
		/* 	
			If user did not hit enter (this means user wants to move away from restart) 
			then sets active to the last card, if thats hidden, calls LEFT recursively.
		*/ 
		if (dir != 13 && $( "#restart" ).hasClass( "restart_active" )){
			$("#restart").removeClass('restart_active');
			if($cards.eq(15).css('visibility')=='hidden')
				control.gameplay({'which':37});
			else $cards.eq(15).addClass('active');
			return;
		} 

/* *******
DO WHILE  do #finds the next visible and puts there the cursor
		 while #there are invisible <DIV>'s on the board,
			   #there are still pairs on the board 
Arrow keys 38: 'up',40: 'bottom',37: 'prev',39: 'next'*/

		do {
			$active = $('.active');
			i = $cards.index($('.active'));
			if (i == 15 &&  dir == 39 ){
				if(forced===true){
					$active.removeClass('active');
					$cards.eq(0).addClass('active');	
				} else {
					$active.removeClass('active');
					$("#restart").addClass('restart_active');
				}
			}
			if (i <= 15 && i >=11 && dir == 40){
				$active.removeClass('active');
				$cards.eq(i-4*3).addClass('active');			
			}
			if (dir == 37) {
					$active.removeClass('active');
					$cards.eq(i-1).addClass('active');	
			} else if (dir == 39) {
					$active.removeClass('active');
					$cards.eq(i+1).addClass('active');	
			} else if (dir == 38){
					$active.removeClass('active');
					$cards.eq(i-4).addClass('active');	
			} else if (dir == 40) {
					$active.removeClass('active');
					$cards.eq(i+4).addClass('active');	
			}
		}
		while ($('.active').css("visibility") == "hidden" && pairs > 0);

	}
}
var Game_Infos = function(){
	var points = 0;
	var start_time = 0;
	var interval;
	/*
	Sets points then update,...
	*/
	this.set_Points = function(point){
		points = points + point;
		this.Update();
	}
	/*
	Nulls points before restarting game in game_board function.
	*/
	this.null_Points = function(){
		points = 0;
		this.Update();
	}
	this.start_Timer = function(){
		start_time = new Date();
		interval = setInterval(timer, 1000);	
	}
	this.stop_Timer = function(){
		interval = clearInterval(interval);
		$('#timer').html("00:00");
	}
	this.getTime = function(){
		var now = new Date();
		var dif = new Date(now-start_time);
		var mins = ("0" + dif.getMinutes()).slice(-2);
		var secs = ("0" + dif.getSeconds()).slice(-2);
		return mins+":"+secs;
	}
	function timer(){
		$('#timer').html(infos.getTime());
	}
	
	/*
	Updates informations usually after finding a pair and/or making a mistake
	*/
    this.Update = function(){
		$("#remaining").html(pairs);
		$("#score").html(points);
	}
	/*
		Ends the game, shows ending informations, offers restart!
	*/
	this.endGame = function(){
		$('.popup').fadeIn();
		this.stop_Timer();
		$('.active').removeClass('active');
		$("#restart").addClass('restart_active');
		$('#popup_msg').html("<p>You successfully matched all pairs!<p>Your time: "+this.getTime())
		.append("<p>Your score:"+points)
		.append("<p>Hit ENTER to start a new game!");
		
	}
}

var gameboard = new Game_Board();
var infos = new Game_Infos();
var control = new Game_Control();
var $cards, pairs, cards_arr;
$(document).ready(function () {
   $.get('proxy.php', function(data){
		gameboard.set_Data(data);
		gameboard.create_Game();
	});
	pairs = 8;
	$(document).on('keyup', control.gameplay);
	infos.Update();
});