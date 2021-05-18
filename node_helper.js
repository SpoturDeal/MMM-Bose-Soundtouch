/* Magic Mirror
 * Module: MagicMirror-Bose-Module
 *
 * By SpoturDeal https://github.com/
 * list enhancement & usage of asynx/await and got rid of deprecated "request" dependency
 * MIT Licensed.
 */
 
var NodeHelper = require('node_helper');
var fetchAPI = require('node-fetch');
var updateInterval = 10000 ;
var iplist = [] ;
var artListCache = [] ;
var currentART = null ; 

module.exports = NodeHelper.create({
	
  start: function () {
    console.log('Bose helper started ...');
  },
  
  config: {sightengineUser: 'MYUSER', sightengineSecret: 'MYSECRET'},

  readOnebose: async function(endpoint) {
	const regexp = /source="INVALID_SOURCE"|source="STANDBY"/ ;
	try {
		const res = await fetchAPI(endpoint) ;
		const data = await res.text();
		if (data.search(regexp) != -1) {
			return {res: "off" , body: data} ;
		}
		return {res: "on" , body: data} ;
	} catch (err) {
		return {res: "error" , body: JSON.stringify(err)};
	}
  },
	  
  readAllboses: async function (iplist) {
	if (!Array.isArray(iplist)) { iplist = [iplist] } ;
	var answer ;
	for (let ip of iplist) {
		  answer = await this.readOnebose("http://"+ ip + ":8090/now_playing") ;
		  if (answer.res === "on") { break} ;
	};
	return answer ;
  },
	
  boseFetcher: function() {
	var self = this ;
	(async () => {
		const result = await this.readAllboses(iplist);
		if (result.res != "error") {
			this.sendSocketNotification('BOSE_DATA', result.body);
		}
	})();
	setTimeout(function(){ self.boseFetcher();}, updateInterval )
  },	
  
  checkBoseart: /* async */ function(sART) {
	  
	  console.log("DEBUG MMM_BOSE: start checkBoseart");
	  if (currentART === sART) { return ; } //do nothing
	  console.log("DEBUG MMM_BOSE: start checkBoseart, user = ", this.config.sightengineUser);
	  if (this.config.sightengineUser === 'MYUSER') { return ; } // do nothing
	  currentART = sART ;
	  if (sART) {
		var found = -1 ;
		for (var i = 0; i < artListCache.length ; i++ ) {
			if (artListCache[i].art === sART) {
				found = i ;
				break ;
			}
		}
		if (found == -1) {
			var self = this ;
			var util = require('util');
			var exec = require('child_process').exec;
			var curl = require('curlrequest') ;
			var command = 'curl "'+ 
				'https://api.sightengine.com/1.0/properties.json?' +
				'api_user={' + this.config.sightengineUser + '}&' + 
				'api_secret={' + this.config.sightengineSecret + '}&' +
				'url=' + sART + '"' ;
			console.log("DEBUG ENDPOINT = ", command);
			child = exec(command, function(error, stdout, stderr){
				console.log("DEBUG MMMBOSE R=> ", stdout) ;
				console.log("DEBUG MMMBOSE E=> ", error) ;
				console.log("DEBUG MMMBOSE STDERR=> ",stderr) ;
				const pictureProperties = JSON.parse(stdout) ;
				console.log("DEBUG MMM BOSE, JSON picture = ", JSON.stringify(pictureProperties));
				artListCache.push(
					{
					 art:sART, 
					 dominant: {r: pictureProperties.colors.dominant.r,
								g: pictureProperties.colors.dominant.g,	
								b: pictureProperties.colors.dominant.g
							   },
					 accent: (pictureProperties.colors.accent? 
						{r: pictureProperties.colors.accent[0].r,
						 g: pictureProperties.colors.accent[0].g,
						 b: pictureProperties.colors.accent[0].b} 
						 : 
						{r: pictureProperties.colors.other[0].r,
						 g: pictureProperties.colors.other[0].g,
						b: pictureProperties.colors.other[0].b}
						)
					});
				if (artListCache.length > 50 ) { artListCache.shift() ; }
				self.sendBoseart(artListCache.length - 1);
			});				
		} else {
			this.sendBoseart(found) ;
		};
	  } else {
	  this.sendBoseart(-1) ;
	  };
  },	  
	  
  sendBoseart: function(i) {
	 if (i == -1 ) {
		this.sendSocketNotification('COLOR_BOSE_DATA', []) ;
	 } else {
		 this.sendSocketNotification('COLOR_BOSE_DATA',artListCache[i]) ;
	 }
  },
  
	encodeQueryData : function(data) {
		var ret = [];
		for (var d in data)
			ret.push(encodeURIComponent(d) + '=' + encodeURIComponent(data[d]));
		return ret.join('&');
	},

	
  socketNotificationReceived: function(notification, payload) {
	if (notification === 'BOSE_READ') {
		updateInterval = payload.interval ;
		iplist = payload.boselist ;
		this.boseFetcher() ;
	} else if (notification === 'CHECK_BOSEART') {
		console.log("CHECK_BOSEART Received in node_helper"); 
/*		(async () => {
		await */ this.checkBoseart(payload);
/*		})(); */
	} else if (notification === 'CONFIG') {
		this.config = payload ;
	} 
  }
  
});
