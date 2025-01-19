// 2nd iteration.. else if no more!

let today = moment().format('YYYY-MM-DD');
let todayStart = moment().format('YYYY-MM-DD 00:00:00');
let todayStartTimestamp = moment(todayStart).format('X');
let todayEnd = moment().format('YYYY-MM-DD 23:59:59');
let todayEndTimestamp = moment(todayEnd).format('X');

$.ajax({
	url: `https://www.sofascore.com/api/v1/sport/football/scheduled-events/${today}`,
	type: 'GET',
	dataType: 'json',
	success: function (data) {
		$('header').append(`<p>${moment().format('dddd MMMM Do YYYY HH:mm')}</p>`);
		let n = 0;
		for (let i = 0; i < Object.keys(data.events).length; i++) {
			
			if (
				data.events[i].startTimestamp >= moment().unix() - 3600 * 24 &&
				data.events[i].startTimestamp <= todayEndTimestamp &&
				data.events[i].status.description !== 'Postponed' &&
				data.events[i].status.description !== 'Abandoned' &&
				data.events[i].status.description !== 'Canceled'
			) {
				let flag;
				let status;
				let tournament;
				let time = Math.trunc((moment().unix() - data.events[i].time.currentPeriodStartTimestamp) / 60);
				let RedCardHome = '';
				let RedCardAway = '';
				let homeScore = '';
				let awayScore = '';
				let homeScoreAgg = '';
				let awayScoreAgg = '';
				let homeScorePen = '';
				let awayScorePen = '';
				let liveColor = '';
				let round = '';

				$('.matches').append(`<div class='match' id='${data.events[i].id}'></div>`);

				if (data.events[i].tournament.category.hasOwnProperty('alpha2')) {
					flag = data.events[i].tournament.category.alpha2.toLowerCase();
				} else {
					flag = data.events[i].tournament.category.flag.toLowerCase();
				}

				// Status Handlers
				const statusHandlers = {
					'Not started': () => moment.unix(data.events[i].startTimestamp).format('HH:mm'),
					'Halftime': () => 'HT',
					'Ended': () => 'FT',
					'Extra time halftime': () => 'ET HT',
					'Started': () => '',
					'Start delayed': () => {
					homeScore = '';
					awayScore = '';
					return 'D';
					}
				};

				// Dynamic Handlers for time-based statuses
				const dynamicHandlers = {
					'1st half': () => {
						liveColor = `style='color:#8df268'`;
						return time > 45 ? `45+${time - 45}'` : `${time}'`;
					},
					'2nd half': () => {
						liveColor = `style='color:#8df268'`;
						return time > 45 ? `90+${time - 45}'` : `${45 + time}'`;
					},	
					'1st extra': () => {
						liveColor = `style='color:#8df268'`;
						return time > 15 ? `105+${time - 15}' ET` : `${90 + time}' ET`;
					},
					'2nd extra': () => {
						liveColor = `style='color:#8df268'`;
						return time > 15 ? `120+${time - 15}' ET` : `${105 + time}' ET`;
					}
				};

				// Determine Match Status
				status = statusHandlers[data.events[i].status.description]?.() ||
						dynamicHandlers[data.events[i].status.description]?.() ||
						data.events[i].status.description;

				// Check for Scores
				if (data.events[i].status.description != 'Not started') {
					// Handle scores for matches that have started
					homeScore = data.events[i].homeScore?.display !== undefined ? data.events[i].homeScore.display : '0';
					awayScore = data.events[i].awayScore?.display !== undefined ? data.events[i].awayScore.display : '0';

					// Handle penalties and aggregate scores
					if (data.events[i].homeScore.hasOwnProperty('aggregated')) {
						homeScoreAgg = `(${data.events[i].homeScore.aggregated})`;
						awayScoreAgg = `(${data.events[i].awayScore.aggregated})`;
					}
					if (data.events[i].homeScore && data.events[i].homeScore.hasOwnProperty('penalties')) {
						homeScorePen = data.events[i].homeScore.penalties;
						awayScorePen = data.events[i].awayScore.penalties;
					}
				}

				// Get Tournament Info
				tournament = data.events[i].tournament.hasOwnProperty('uniqueTournament')
				? data.events[i].tournament.uniqueTournament.name
				: data.events[i].tournament.name;

				if (data.events[i].hasOwnProperty('roundInfo') && data.events[i].roundInfo.hasOwnProperty('name')) {
					round = `, ${data.events[i].roundInfo.name}`;
				}

				// Get Red Cards
				if (data.events[i].hasOwnProperty('homeRedCards')) {
					for (let r = 1; r <= data.events[i].homeRedCards; r++) {
						RedCardHome += `<img class='red' src='https://www.sofascore.com/static/images/incidents/icon-red-card.svg'>`;
					}
				}
				if (data.events[i].hasOwnProperty('awayRedCards')) {
					for (let r = 1; r <= data.events[i].awayRedCards; r++) {
						RedCardAway += `<img class='red' src='https://www.sofascore.com/static/images/incidents/icon-red-card.svg'>`;
					}
				}

				console.log(`${data.events[i].id} ${data.events[i].tournament.category.name} ${data.events[i].homeTeam.name} ${data.events[i].awayTeam.name} ${status} ${homeScore}-${awayScore}`);
				console.log(data.events[i]);

				// Append Data to the Page
				$(`.matches > .match#${data.events[i].id}`).append(
					`<div class='info'><img class='tournament_logo' src='https://www.sofascore.com/static/images/flags/${flag}.png' title='${data.events[i].tournament.category.name}'>
						<p class='tournament'><b>${tournament}${round}</b></p><p class='time' ${liveColor}>${status}</p>
					</div>`
				);

				$(`.matches > .match#${data.events[i].id}`).append(
					`<div class='home'>
						<img class='team_logo' src='https://api.sofascore.app/api/v1/team/${data.events[i].homeTeam.id}/image'>
						<p class='team' title='${data.events[i].homeTeam.name}'>${data.events[i].homeTeam.shortName}</p>${RedCardHome}
						<div class='score'>
							<p class='goals'>${homeScore}
								<span class='agg'>${homeScoreAgg}</span>
								<span class='pen'>${homeScorePen}</span>
							</p>
						</div>
					</div>
					<div class='away'><img class='team_logo' src='https://api.sofascore.app/api/v1/team/${data.events[i].awayTeam.id}/image'>
						<p class='team' title='${data.events[i].awayTeam.name}'>${data.events[i].awayTeam.shortName}</p>${RedCardAway}
						<div class='score'>
							<p class='goals'>${awayScore}
								<span class='agg'>${awayScoreAgg}</span>
								<span class='pen'>${awayScorePen}</span>
							</p>
						</div>
					</div>`
				);

				$(`.matches > .match#${data.events[i].id}`).append(
					`<div class='more'>
						<a href='https://www.sofascore.com/football/match/${data.events[i].slug}/${data.events[i].customId}#id:${data.events[i].id}' target='_blank'>Match Details</a>
					</div>`
				);
			}
		}
	}
});