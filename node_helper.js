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
var config = {sightengineUser: 'MYUSER', sightengineSecret: 'MYSECRET'} ;

module.exports = NodeHelper.create({
	
  start: function () {
    console.log('Bose helper started ...');
  },

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
  
  checkBoseart: async function(sART) {
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
			var sightengine = require('sightengine')('{' + this.config.sightengineUser + '}', '{' + this.config.sightengineSecret + '}' );

			sightengine.check(['properties']).set_url('https://sightengine.com/assets/img/examples/example2.jpg').then(function(result) {
  // read the output (result)
				const pictureProperties = JSON.parse(result) ; ;
				console.log("DEBUG MMM BOSE, JSON picture = ", JSON.stringify(pictureProperties));
				artListCache.push(
					{
					 art:sART, 
					 dominant:pictureProperties.colors.dominant.hex,
					 accent: (pictureProperties.colors.accent? pictureProperties.colors.accent[0].hex:pictureProperties.colors.other[0].hex)
					});
				if (artListCache.length > 50 ) { artListCache.shift() ; }
				this.sendBoseart(artListCache.length - 1);
			}).catch(function(err) {
  // handle the error
  				console.log("MMM_BOSE ERROR", err) ;
				this.sendBoseart(-1) ;
			})	
			
/*			var endpoint = 'https://api.sightengine.com/' ;
			const data = { 'models': 'properties', 'url': sART, 'api_user': '{' + this.config.sightengineUser + '}', 'api_secret': '{' + this.config.sightengineSecret + '}' };
			const querystring = this.encodeQueryData(data);
			var url = endpoint + '1.0/check.json';
				console.log("ENDPOINT = >>" + url + '?' + querystring + "<<") ;
			try {
				const res = await fetchAPI(url + '?' + querystring, {headers: { 'user-agent': 'SE-SDK-NODEJS1.3.1'}}) ;
				const pictureProperties = await res.json() ;
				console.log("DEBUG MMM BOSE, JSON picture = ", JSON.stringify(pictureProperties));
				artListCache.push(
					{
					 art:sART, 
					 dominant:pictureProperties.colors.dominant.hex,
					 accent: (pictureProperties.colors.accent? pictureProperties.colors.accent[0].hex:pictureProperties.colors.other[0].hex)
					});
				if (artListCache.length > 50 ) { artListCache.shift() ; }
				this.sendBoseart(artListCache.length - 1);
			} catch (err) {
				console.log("MMM_BOSE ERROR", err) ;
				this.sendBoseart(-1) ;
			}
	*/
		} else {
			this.sendBoseart(found) ;
		};

	  } else {
	  this.sendBoseart(-1) ;
	  };
  },	  
	  
  sendBoseart: function(i) {
	 if (i == -1 ) {
		sendSocketNotification('COLOR_BOSE_DATA', []) ;
	 } else {
		 sendSocketNotification('COLOR_BOSE_DATA',[artListCache[i].dominant, artListCache[i].accent]) ;
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
		(async () => {
		await this.checkBoseart(payload);
		})();
	} else if (notification === 'CONFIG') {
		this.config = payload ;
	} 
  }
  
});
