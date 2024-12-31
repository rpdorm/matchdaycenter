$.ajax({
    url: 'https://www.sofascore.com/api/v1/sport/football/events/live',
    type: "GET",
    dataType: "json",
    success: function (data) {
        for (i=0; i<Object.keys(data.events).length; i++) {
            let flag;
            let status;
            let tournament;
            let time;
            let RedCardHome = '';
            let RedCardAway = '';
            let liveColor = '';
            //console.log(data.events[i]);

            // Get match time
            $(".live").append(`<div class='match' id='${data.events[i].id}'></div>`);
            time = Math.trunc((moment().unix()-data.events[i].time.currentPeriodStartTimestamp)/60);
            if (data.events[i].tournament.category.hasOwnProperty("alpha2")) {
                flag = data.events[i].tournament.category.alpha2.toLowerCase();
            } else {
                flag = data.events[i].tournament.category.flag.toLowerCase();
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
            } else if (data.events[i].status.description == "Extra time halftime") {
                status = "ET HT";
            } else if (data.events[i].status.description == "Started") {
                status = "";
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

            // Get Tournament Name
            if (data.events[i].tournament.hasOwnProperty("uniqueTournament")) {
                tournament = data.events[i].tournament.uniqueTournament.name;
            } else {
                tournament = data.events[i].tournament.name;
            }

            // Get red cards
            if (data.events[i].hasOwnProperty('homeRedCards')) {
                for (var r = 1; r <= data.events[i].homeRedCards; r++) {
                    RedCardHome = RedCardHome + `<img src='https://www.sofascore.com/static/images/incidents/icon-red-card.svg'>`;
                }
            }
            if (data.events[i].hasOwnProperty('awayRedCards')) {
                for (var r = 1; r <= data.events[i].awayRedCards; r++) {
                    RedCardAway = RedCardAway + `<img src='https://www.sofascore.com/static/images/incidents/icon-red-card.svg'>`;
                }
            }

            // Plot stuff
            $(`.live > .match#${data.events[i].id}`).append(`<div class='info'><img class='tournament_logo' src='https://www.sofascore.com/static/images/flags/${flag}.png' title='${data.events[i].tournament.category.name}'><p class='tournament'>${tournament}</p><p class='time' ${liveColor}>${status}</p></div>`);
            $(`.live > .match#${data.events[i].id}`).append(`<div class='home'><img class='team_logo' src='https://api.sofascore.app/api/v1/team/${data.events[i].homeTeam.id}/image'><p class='home_team' title='${data.events[i].homeTeam.name}'>${data.events[i].homeTeam.shortName}</p>${RedCardHome}<p class='home_score'>${data.events[i].homeScore.display}</p></div><div class='away'><img class='team_logo' src='https://api.sofascore.app/api/v1/team/${data.events[i].awayTeam.id}/image'><p class='away_team' title='${data.events[i].awayTeam.name}'>${data.events[i].awayTeam.shortName}</p>${RedCardAway}<p class='away_score'>${data.events[i].awayScore.display}</p></div>`);
            $(`.live > .match#${data.events[i].id}`).append(`<div class='more'><a href='https://www.sofascore.com/football/match/${data.events[i].slug}/${data.events[i].customId}#id:${data.events[i].id}' target='_blank'>Match Details</a></div>`);
        }
        
        console.log(`ok... displaying ${Object.keys(data.events).length} live matches.`);
    }
});