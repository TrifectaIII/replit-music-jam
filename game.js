function Room (name, io) {
    this.io = io;

    //name of room
    this.name = name;

    //list containing all player sockets
    this.sockets = [undefined,undefined,undefined,undefined];

    //list of player names
    this.names = ['','','',''];

    //list of player scores
    this.scores = [0,0,0,0];

    //tracks if game has started yet
    this.started = false;

    //list of booleans to keep track f which player got their qustion right
    this.corrects = [false,false,false,false];

    //tracks who has already answered
    this.answered = [false,false,false,false]; 

    //dict with song info
    this.selections = {
        "/static/sample/sample5.mp3": {
            "artist": "Rando Person",
            "name": "g minor"
        } 
        , 
        "/static/sample/megalo.mp3": {
            "artist": "Megalo box",
            "name":"Sachio"
        }
    };

    this.round = 1;

    this.totalround = 5; 

    this.correct_answer = "g-minor" ;

    this.choice_timer;


    //checks if room is empty
    this.isEmpty = function () {
        let empty = true;
        for (let i = 0; i < this.sockets.length; i++){
            if(!(this.sockets[i] === undefined)) {
                empty = false;
            };
        };
        return empty;
    };

    //check if everyone has answered
    this.check_answered = function(){
        console.log(this.answered);
        for( let i = 0; i <this.sockets.length; i++){
            console.log(this.sockets[i] === undefined);
            if ((!(this.sockets[i] === undefined)) && (this.answered[i]== false)){
                return false;
            };
        };
        return true;
    };

    //send new question to all players in room
    this.sendQuestion = function () {
        //generate new question
        var song = "/static/sample/sample5.mp3";
        var question = "artist"; // artist, composer,song
        var choices = ["1","g-minor","3","4"];


        //this.correct_answer = 'snsd';

        //reset trackers
        this.corrects = [false,false,false,false];
        this.answered = [false,false,false,false];

        //emit message
        this.io.sockets.in(this.name).emit('ask_question', song, question,choices);
        this.update();

        var thisRoom = this;

        //faallback timer in case of disconnects / new connects
        this.choice_timer = setTimeout(function () {
            thisRoom.answered = [true,true,true,true];
            thisRoom.sendJudge();
        }, 1000*21);//time in MS after which server will force judging
    };

    //judges choices and players
    this.sendJudge = function () {
        clearTimeout(this.choice_timer);

        var choices_correct = [false,true,false,false];
        this.io.sockets.in(this.name).emit('judge',choices_correct,this.corrects);
        this.update();

        //after judging, wait a bit then send next question
        if (this.round == this.totalround){
            var thisRoom = this;
            setTimeout(function () {
                thisRoom.io.sockets.in(thisRoom.name).emit('restart_game', thisRoom.scores);

                //reset room data
                thisRoom.scores = [0,0,0,0];
                thisRoom.started = false;
                thisRoom.corrects = [false,false,false,false];
                thisRoom.answered = [false,false,false,false]; 
                thisRoom.round = 1;
            },1000 * 3);
        }else{
            this.round +=1;
            var thisRoom = this;
	        setTimeout(function () {
	            thisRoom.sendQuestion();
	        }, 1000 * 3);//time in MS to wait until next question
	    }

    };

    //updates all player info and scores
    this.update = function () {
        // emit player info to room
        this.io.sockets.in(this.name).emit('player_info', this.names, this.scores);

        //emit round info to room
        this.io.sockets.in(this.name).emit('round_info', this.round, this.totalround);

        //emit individual scores to each socket
        for (let i = 0; i < this.sockets.length; i++) {
            if (!(this.sockets[i] === undefined)){
                this.sockets[i].emit('individual_score',this.scores[i]);
            };
        };
    };

    //adds new socket to room
    this.add = function (socket) {
        //add socket only if an empty slot exists and game hasnt started
        let joined = false;
        let spot = 0;
        // if (!this.started) {
            for (let i = 0; i < this.sockets.length; i++){
                if (this.sockets[i] === undefined) {
                    this.sockets[i] = socket;
                    joined = true;
                    spot = i;
                    //join socketsio room
                    socket.join(this.name);
                    break;
                };
            };
        // };

        if (joined) {
            if (this.started) {
                socket.emit('game_started');
            };

            //when player successfully joins lobby, setup
            this.names[spot] = 'Player '+(spot+1).toString();

            this.update();//update when new person joins
            
            //scoping variable
            let thisRoom = this;

            //wipe player slot on Disconnect
            socket.on('disconnect', function () {
                thisRoom.names[spot]  = '';
                thisRoom.scores[spot] = 0;
                thisRoom.sockets[spot] = undefined;
                thisRoom.update(); //update when somebody disconnects
            });

            //sets name of player
            socket.on('set_name', function (name) {
                thisRoom.names[spot] = name;
                thisRoom.update();//update when somebody sets their name
            });

            //when game starts, immediately generate and send a question
             socket.on('start_game',function(){
             	if (!(thisRoom.started)){
	                thisRoom.started = true;
	                thisRoom.sendQuestion();
            	}

            });

            //when client sends back their choice
            socket.on('choice',function(choice){
                if (!(thisRoom.answered[spot])){
                    //check if this socket got it correct
                    if (choice == thisRoom.correct_answer){
                        //give points
                        thisRoom.scores[spot] += 1;
                        //mark them as correct
                        thisRoom.corrects[spot] = true;
                    };

                    //mark this socket as answered
                    thisRoom.answered[spot] = true;
                    thisRoom.io.sockets.in(thisRoom.name).emit('answered', thisRoom.answered);
                    // did everyone answer?
                    if (thisRoom.check_answered()){
                        thisRoom.sendJudge();
                    };
                };
            });

        } else {
            //when player is trying to join full lobby
            socket.emit('cannot_join');
        };
    };
};

module.exports = {
    Room:Room,
};