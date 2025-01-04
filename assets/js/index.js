let today = moment().format("YYYY-MM-DD");
let todayStart = moment().format('YYYY-MM-DD 00:00:00');
let todayStartTimestamp = moment(todayStart).format('X');
let todayEnd = moment().format('YYYY-MM-DD 23:59:59');
let todayEndTimestamp = moment(todayEnd).format('X');

$.ajax({
    url: `https://www.sofascore.com/api/v1/sport/football/scheduled-events/${today}`,
    type: 'GET',
    dataType: 'json',
    success: function (data) {

    	$("header").append(`<p>${moment().format("dddd MMMM Do YYYY HH:mm")}</p>`);
    	let n = 0;
    	for (i=0; i<Object.keys(data.events).length; i++) {
    		console.log(data.events[i]);
    		if (data.events[i].startTimestamp >= moment().unix() - (3600*24) && data.events[i].startTimestamp <= todayEndTimestamp && data.events[i].status.description != 'Postponed' && data.events[i].status.description != 'Abandoned') {
    			let flag;
	            let status;
	            let tournament;
	            let time;
            	let RedCardHome = '';
            	let RedCardAway = '';
	            let homeScore = '';
	            let awayScore = '';
	            let homeScoreAgg = '';
	            let awayScoreAgg = '';
	            let liveColor = '';
	            let round = '';
	            $(".matches").append(`<div class='match' id='${data.events[i].id}'></div>`);
	            time = Math.trunc((moment().unix()-data.events[i].time.currentPeriodStartTimestamp)/60);
	            if (data.events[i].tournament.category.hasOwnProperty("alpha2")) {
	                flag = data.events[i].tournament.category.alpha2.toLowerCase();
	            } else {
	                flag = data.events[i].tournament.category.flag.toLowerCase();
	            }

	            // check match status
	            if (data.events[i].status.description == 'Not started') {
	                status = moment.unix(data.events[i].startTimestamp).format('HH:mm');
	            }
	            else {
	            	// check for aggregate score
	            	if (data.events[i].homeScore.hasOwnProperty("aggregated")) {
	            		homeScoreAgg = `(${data.events[i].homeScore.aggregated})`;
	            		awayScoreAgg = `(${data.events[i].awayScore.aggregated})`;
	            		homeScore = `${data.events[i].homeScore.display} ${homeScoreAgg}`;
	            		awayScore = `${data.events[i].awayScore.display} ${awayScoreAgg}`;
	            	} else {
		            	// get goals
		            	homeScore = data.events[i].homeScore.display;
		            	awayScore = data.events[i].awayScore.display;
		            }
	            	if (data.events[i].status.description == "1st half") {
	            		liveColor = `style="color:#8df268"`;
		                if (time > 45) {
		                    status = `45+${time-45}'`;
		                } else {
		                    status = `${time}'`;
		                }
		            } else if (data.events[i].status.description == "2nd half") {
		            	liveColor = `style="color:#8df268"`;
		                if (time > 45) {
		                    status = `90+${time-45}'`;
		                } else {
		                    status = `${45+time}'`;
		                }
		            } else if (data.events[i].status.description == "Halftime") {
		                status = "HT";
		            } else if (data.events[i].status.description == "Ended") {
		                status = "FT";
		            } else if (data.events[i].status.description == "Extra time halftime") {
		                status = "ET HT";
		            } else if (data.events[i].status.description == "Started") {
		                status = "";
		            } else if (data.events[i].status.description == "AP") {
		                status = data.events[i].status.description;
		            	homeScore = `${data.events[i].homeScore.display} ${homeScoreAgg} <span class='pen'>${data.events[i].homeScore.penalties}<span class='pen'>`;
		            	awayScore = `${data.events[i].awayScore.display} ${awayScoreAgg} <span class='pen'>${data.events[i].awayScore.penalties}<span class='pen'>`;
		            } else if (data.events[i].status.description == "1st extra") {
		            	liveColor = `style="color:#8df268"`;
		                if (time > 15) {
		                    status = `105+${time-15}' ET`;
		                } else {
		                    status = `${90+time}' ET`;
		                }
		            } else if (data.events[i].status.description == "2nd extra") {
		            	liveColor = `style="color:#8df268"`;
		                if (time > 15) {
		                    status = `120+${time-15}' ET`;
		                } else {
		                    status = `${105+time}' ET`;
		                }
		            } else {
		                status = data.events[i].status.description;
		            }
	            }
	            
	            // get tournament info
	            if (data.events[i].tournament.hasOwnProperty('uniqueTournament')) {
	                tournament = data.events[i].tournament.uniqueTournament.name;
	            } else {
	                tournament = data.events[i].tournament.name;
	            }
	            if (data.events[i].roundInfo.hasOwnProperty('name')) {
	                round = `, ${data.events[i].roundInfo.name}`;
	            }

	            // Get red cards
	            if (data.events[i].hasOwnProperty('homeRedCards')) {
	            	for (var r = 1; r <= data.events[i].homeRedCards; r++) {
	            		RedCardHome = RedCardHome + `<img class='red' src='https://www.sofascore.com/static/images/incidents/icon-red-card.svg'>`;
	            	}
	            }
	            if (data.events[i].hasOwnProperty('awayRedCards')) {
	            	for (var r = 1; r <= data.events[i].awayRedCards; r++) {
	                	RedCardAway = RedCardAway + `<img class='red' src='https://www.sofascore.com/static/images/incidents/icon-red-card.svg'>`;
	                }
	            }
	            $(`.matches > .match#${data.events[i].id}`).append(`<div class='info'><img class='tournament_logo' src='https://www.sofascore.com/static/images/flags/${flag}.png' title='${data.events[i].tournament.category.name}'><p class='tournament'><b>${tournament}${round}</b></p><p class='time' ${liveColor}>${status}</p></div>`);
	            $(`.matches > .match#${data.events[i].id}`).append(`<div class='home'><img class='team_logo' src='https://api.sofascore.app/api/v1/team/${data.events[i].homeTeam.id}/image'><p class='home_team' title='${data.events[i].homeTeam.name}'>${data.events[i].homeTeam.shortName}</p>${RedCardHome}<p class='home_score'>${homeScore}</p></div><div class='away'><img class='team_logo' src='https://api.sofascore.app/api/v1/team/${data.events[i].awayTeam.id}/image'><p class='away_team' title='${data.events[i].awayTeam.name}'>${data.events[i].awayTeam.shortName}</p>${RedCardAway}<p class='away_score'>${awayScore}</p></div>`);
	            $(`.matches > .match#${data.events[i].id}`).append(`<div class='more'><a href='https://www.sofascore.com/football/match/${data.events[i].slug}/${data.events[i].customId}#id:${data.events[i].id}' target='_blank'>Match Details</a></div>`);
    		}
    	}
    }
});